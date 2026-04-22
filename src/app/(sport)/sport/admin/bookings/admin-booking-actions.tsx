'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function AdminBookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: 'APPROVED' | 'REJECTED') {
    setLoading(status);
    try {
      const res = await fetch(`/api/sport/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === 'APPROVED' ? 'อนุมัติการจองแล้ว ✓' : 'ปฏิเสธการจองแล้ว');
      router.refresh();
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => updateStatus('APPROVED')}
        disabled={!!loading}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50 transition"
      >
        {loading === 'APPROVED' ? '...' : '✓ อนุมัติ'}
      </button>
      <button
        onClick={() => updateStatus('REJECTED')}
        disabled={!!loading}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 transition"
      >
        {loading === 'REJECTED' ? '...' : '✗ ปฏิเสธ'}
      </button>
    </div>
  );
}
