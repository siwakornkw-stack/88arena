'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function SignUpForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', referralCode: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setForm((f) => ({ ...f, referralCode: ref.toUpperCase() }));
  }, [searchParams]);

  const inputClass = "w-full h-12 rounded-full border border-gray-200 dark:border-gray-700 px-5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition";
  const errorInputClass = "w-full h-12 rounded-full border border-red-400 dark:border-red-500 px-5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 transition";

  function setField(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name || form.name.length < 2) e.name = 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
    if (!form.email) e.email = 'กรุณากรอกอีเมล';
    if (!/^0[0-9]{8,9}$/.test(form.phone)) e.phone = 'เบอร์โทรไม่ถูกต้อง (ตัวอย่าง: 0812345678)';
    if (form.password.length < 6) e.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sport/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password, referralCode: form.referralCode || undefined }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error ?? `เกิดข้อผิดพลาด (${res.status})`);
      setRegistered(true);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="text-center space-y-4">
        <div className="text-5xl">📧</div>
        <h2 className="font-semibold text-gray-900 dark:text-white">ตรวจสอบอีเมลของคุณ</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          เราได้ส่งลิงก์ยืนยันอีเมลไปที่ <strong>{form.email}</strong> แล้ว<br />
          กรุณากดลิงก์ในอีเมลเพื่อเปิดใช้งานบัญชี
        </p>
        <p className="text-xs text-gray-400">ลิงก์จะหมดอายุใน 24 ชั่วโมง</p>
        <a
          href="/sport/auth/signin"
          className="inline-block mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          ไปหน้าเข้าสู่ระบบ →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ชื่อ */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">ชื่อ-นามสกุล</label>
        <input type="text" className={errors.name ? errorInputClass : inputClass} placeholder="ชื่อของคุณ" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
        {errors.name && <p className="text-xs text-red-500 mt-1 pl-4">{errors.name}</p>}
      </div>

      {/* อีเมล */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">อีเมล</label>
        <input type="email" className={errors.email ? errorInputClass : inputClass} placeholder="example@email.com" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
        {errors.email && <p className="text-xs text-red-500 mt-1 pl-4">{errors.email}</p>}
      </div>

      {/* เบอร์โทรศัพท์ */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          เบอร์โทรศัพท์ <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📱</span>
          <input
            type="tel"
            className={`${errors.phone ? errorInputClass : inputClass} pl-10`}
            placeholder="0812345678"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            maxLength={10}
            required
          />
        </div>
        {errors.phone
          ? <p className="text-xs text-red-500 mt-1 pl-4">{errors.phone}</p>
          : <p className="text-xs text-gray-400 mt-1 pl-4">ใช้สำหรับให้แอดมินติดต่อยืนยันการจอง</p>
        }
      </div>

      {/* รหัสผ่าน */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">รหัสผ่าน</label>
        <div className="relative">
          <input type={showPass ? 'text' : 'password'} className={`${errors.password ? errorInputClass : inputClass} pr-12`} placeholder="อย่างน้อย 6 ตัวอักษร" value={form.password} onChange={(e) => setField('password', e.target.value)} required />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{showPass ? '🙈' : '👁️'}</button>
        </div>
        {errors.password && <p className="text-xs text-red-500 mt-1 pl-4">{errors.password}</p>}
      </div>

      {/* ยืนยันรหัสผ่าน */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">ยืนยันรหัสผ่าน</label>
        <input type={showPass ? 'text' : 'password'} className={errors.confirmPassword ? errorInputClass : inputClass} placeholder="ยืนยันรหัสผ่าน" value={form.confirmPassword} onChange={(e) => setField('confirmPassword', e.target.value)} required />
        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 pl-4">{errors.confirmPassword}</p>}
      </div>

      {/* รหัสแนะนำ (optional) */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">รหัสแนะนำ <span className="text-xs text-gray-400">(ถ้ามี)</span></label>
        <input type="text" className={inputClass} placeholder="รหัสจากเพื่อน เช่น AB3D7X2Y" value={form.referralCode} onChange={(e) => setField('referralCode', e.target.value.toUpperCase().slice(0, 8))} maxLength={8} />
      </div>

      <button type="submit" disabled={loading} className="w-full gradient-btn text-white font-semibold h-12 rounded-full text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2">
        {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
      </button>
    </form>
  );
}
