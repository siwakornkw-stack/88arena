'use client';

import { useEffect, useState } from 'react';
import { ChatWindow } from '@/components/sport/chat-window';

interface Conversation {
  id: string;
  unreadByAdmin: number;
  lastMessageAt: string;
  lastMessage: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface Props {
  conversations: Conversation[];
  currentUserId: string;
}

export function AdminChatClient({ conversations: initial, currentUserId }: Props) {
  const [conversations, setConversations] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/sport/chat/conversations');
        if (!res.ok) return;
        const data = await res.json();
        const mapped: Conversation[] = data.map((c: {
          id: string;
          unreadByAdmin: number;
          lastMessageAt: string;
          user: Conversation['user'];
          messages?: { body: string }[];
        }) => ({
          id: c.id,
          unreadByAdmin: c.unreadByAdmin,
          lastMessageAt: c.lastMessageAt,
          user: c.user,
          lastMessage: c.messages?.[0]?.body ?? '',
        }));
        setConversations(mapped);
      } catch {}
    }, 8000);
    return () => clearInterval(poll);
  }, []);

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
      <aside className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden h-[calc(100vh-180px)]">
        <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">บทสนทนา ({conversations.length})</h3>
        </div>
        <div className="overflow-y-auto h-[calc(100%-49px)]">
          {conversations.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-8 px-4">ยังไม่มีบทสนทนา</div>
          ) : (
            conversations.map((c) => {
              const active = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 transition ${
                    active ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {c.user.name ?? c.user.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{c.lastMessage || 'ไม่มีข้อความ'}</p>
                    </div>
                    {c.unreadByAdmin > 0 && (
                      <span className="flex-shrink-0 text-[10px] font-semibold bg-red-500 text-white rounded-full px-2 py-0.5">
                        {c.unreadByAdmin}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div>
        {selected ? (
          <ChatWindow
            key={selected.id}
            conversationId={selected.id}
            currentUserId={currentUserId}
            title={selected.user.name ?? selected.user.email}
            subtitle={selected.user.email}
          />
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-[calc(100vh-180px)] flex items-center justify-center text-gray-400 text-sm">
            เลือกบทสนทนาเพื่อเริ่มแชท
          </div>
        )}
      </div>
    </div>
  );
}
