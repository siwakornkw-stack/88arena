'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch(`/api/sport/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (!res.ok) throw new Error('เกิดข้อผิดพลาด');
      toast.success('ยกเลิกการจองแล้ว');
      router.refresh();
    } catch {
      toast.error('ไม่สามารถยกเลิกได้');
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">แน่ใจหรือ?</span>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          {loading ? 'กำลังยกเลิก...' : 'ยืนยัน'}
        </button>
        <button onClick={() => setConfirm(false)} className="text-xs text-gray-400 hover:text-gray-600">
          ไม่ใช่
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
    >
      ยกเลิกการจอง
    </button>
  );
}
