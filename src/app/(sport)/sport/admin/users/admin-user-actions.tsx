'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function AdminUserActions({ userId, currentRole, currentUserId }: {
  userId: string;
  currentRole: string;
  currentUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isSelf = userId === currentUserId;

  async function toggleRole() {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    setLoading(true);
    try {
      const res = await fetch('/api/sport/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`เปลี่ยน role เป็น ${newRole} แล้ว`);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (isSelf) return <span className="text-xs text-gray-300 dark:text-gray-600">-</span>;

  return (
    <button
      onClick={toggleRole}
      disabled={loading}
      className={`text-xs px-3 py-1 rounded-full font-medium transition disabled:opacity-50 ${
        currentRole === 'ADMIN'
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200'
      }`}
    >
      {loading ? '...' : currentRole === 'ADMIN' ? 'ถอด Admin' : 'ตั้งเป็น Admin'}
    </button>
  );
}
