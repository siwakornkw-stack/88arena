import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ChatWindow } from '@/components/sport/chat-window';

export const metadata = { title: 'ติดต่อแอดมิน' };

export default async function CustomerChatPage() {
  const session = await auth();
  if (!session) redirect('/sport/auth/signin?callbackUrl=/sport/chat');

  const conversation = await prisma.conversation.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  return (
    <div className="wrapper py-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">ติดต่อแอดมิน</h1>
      <ChatWindow
        conversationId={conversation.id}
        currentUserId={session.user.id}
        title="แชทกับทีมงาน 88ARENA"
        subtitle="เราจะตอบกลับให้เร็วที่สุด"
      />
    </div>
  );
}
