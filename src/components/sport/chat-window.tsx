'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/i18n/provider';

interface Message {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderRole: 'USER' | 'ADMIN';
  sender: { id: string; name: string | null; image: string | null; role: 'USER' | 'ADMIN' };
}

interface Props {
  conversationId: string;
  currentUserId: string;
  title?: string;
  subtitle?: string;
}

export function ChatWindow({ conversationId, currentUserId, title, subtitle }: Props) {
  const { t, locale } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  };

  useEffect(() => {
    let mounted = true;
    fetch(`/api/sport/chat/messages?conversationId=${conversationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setMessages(data);
        setLoading(false);
        scrollToBottom();
      })
      .catch(() => setLoading(false));
    return () => { mounted = false; };
  }, [conversationId]);

  useEffect(() => {
    const es = new EventSource(`/api/sport/chat/stream?conversationId=${conversationId}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.id));
            const fresh = data.messages.filter((m: Message) => !seen.has(m.id));
            if (fresh.length === 0) return prev;
            return [...prev, ...fresh];
          });
          scrollToBottom();
        }
      } catch {}
    };
    es.onerror = () => { /* browser auto-reconnects */ };
    return () => es.close();
  }, [conversationId]);

  const send = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setInput('');
    try {
      const res = await fetch('/api/sport/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, body }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => (prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]));
        scrollToBottom();
      } else {
        const { error } = await res.json().catch(() => ({ error: t('chat.sendFailed') }));
        alert(error ?? t('chat.sendFailed'));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title ?? t('chat.windowTitle')}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-sm text-gray-400">{t('common.loading')}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-8">
            {t('chat.empty')}
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${
                    mine
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                  }`}
                >
                  {!mine && (
                    <div className="text-[10px] font-semibold mb-0.5 opacity-70">
                      {m.sender.name ?? t('chat.user')}{m.senderRole === 'ADMIN' ? ' · Admin' : ''}
                    </div>
                  )}
                  <div>{m.body}</div>
                  <div className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                    {new Date(m.createdAt).toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 p-3 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={t('chat.placeholder')}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="gradient-btn px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? '...' : t('chat.send')}
        </button>
      </div>
    </div>
  );
}
