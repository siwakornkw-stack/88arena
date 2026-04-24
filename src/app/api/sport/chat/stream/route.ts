import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');
  if (!conversationId) return new Response('Missing conversationId', { status: 400 });

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return new Response('Not found', { status: 404 });

  const isOwner = conversation.userId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) return new Response('Forbidden', { status: 403 });

  const encoder = new TextEncoder();
  let since = new Date();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      const interval = setInterval(async () => {
        try {
          const newMessages = await prisma.message.findMany({
            where: { conversationId, createdAt: { gt: since } },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true, image: true, role: true } } },
          });

          if (newMessages.length > 0) {
            send({ messages: newMessages });
            since = newMessages[newMessages.length - 1].createdAt;
          } else {
            controller.enqueue(encoder.encode(': ping\n\n'));
          }
        } catch {
          clearInterval(interval);
          try { controller.close(); } catch {}
        }
      }, 3000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
