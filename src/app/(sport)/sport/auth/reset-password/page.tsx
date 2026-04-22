'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error('รหัสผ่านไม่ตรงกัน'); return; }
    if (password.length < 6) { toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/sport/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ!');
      router.push('/sport/auth/signin?reset=1');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full h-12 rounded-full border border-gray-200 dark:border-gray-700 px-5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition';

  if (!token) return (
    <div className="text-center text-red-500">
      <p>ลิงก์ไม่ถูกต้อง กรุณาขอ reset password ใหม่อีกครั้ง</p>
      <a href="/sport/auth/forgot-password" className="text-primary-600 hover:underline text-sm mt-2 block">ขอลิงก์ใหม่</a>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">รหัสผ่านใหม่</label>
        <div className="relative">
          <input type={show ? 'text' : 'password'} className={`${inputCls} pr-12`} placeholder="อย่างน้อย 6 ตัวอักษร" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{show ? '🙈' : '👁️'}</button>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">ยืนยันรหัสผ่านใหม่</label>
        <input type={show ? 'text' : 'password'} className={inputCls} placeholder="ยืนยันรหัสผ่าน" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      </div>
      <button type="submit" disabled={loading} className="w-full gradient-btn text-white font-semibold h-12 rounded-full text-sm disabled:opacity-60">
        {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/sport" className="text-4xl">🏟️</a>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">ตั้งรหัสผ่านใหม่</h1>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700/50 shadow-theme-sm p-8">
          <Suspense fallback={<div className="text-center text-gray-400">กำลังโหลด...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
