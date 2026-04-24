import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const CHAT_RATE_LIMIT = { limit: 30, windowMs: 60 * 1000 };

const schema = z.object({
  conversationId: z.string().min(1),
  body: z.string().trim().min(1, 'ข้อความว่างเปล่า').max(2000, 'ข้อความยาวเกินไป'),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isOwner = conversation.userId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 200,
    include: { sender: { select: { id: true, name: true, image: true, role: true } } },
  });

  // Mark as read for the viewer side
  if (isAdmin) {
    await prisma.conversation.update({ where: { id: conversationId }, data: { unreadByAdmin: 0 } });
  } else {
    await prisma.conversation.update({ where: { id: conversationId }, data: { unreadByUser: 0 } });
  }

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = rateLimit(`chat-message:${session.user.id}`, CHAT_RATE_LIMIT);
  if (!rl.success) {
    return NextResponse.json({ error: 'ส่งข้อความถี่เกินไป กรุณารอสักครู่' }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { conversationId, body } = parsed.data;
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isOwner = conversation.userId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        senderRole: session.user.role as Role,
        body,
      },
      include: { sender: { select: { id: true, name: true, image: true, role: true } } },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        unreadByUser: isAdmin ? { increment: 1 } : 0,
        unreadByAdmin: isAdmin ? 0 : { increment: 1 },
      },
    }),
  ]);

  return NextResponse.json(message, { status: 201 });
}
