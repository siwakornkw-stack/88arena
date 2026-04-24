import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.role === 'ADMIN') {
    const conversations = await prisma.conversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    return NextResponse.json(conversations);
  }

  const conversation = await prisma.conversation.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json([conversation]);
}
