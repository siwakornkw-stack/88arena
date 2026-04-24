import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminChatClient } from './admin-chat-client';

export const metadata = { title: 'Admin Chat' };

export default async function AdminChatPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/sport');

  const conversations = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  const initial = conversations.map((c) => ({
    id: c.id,
    unreadByAdmin: c.unreadByAdmin,
    lastMessageAt: c.lastMessageAt.toISOString(),
    user: c.user,
    lastMessage: c.messages[0]?.body ?? '',
  }));

  return (
    <div className="wrapper py-6 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">💬 Admin Chat</h1>
      <AdminChatClient conversations={initial} currentUserId={session.user.id} />
    </div>
  );
}
