'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  emailVerified: string | null;
  points: number;
  notifEmail: boolean;
  notifLine: boolean;
  notifInApp: boolean;
  twoFactorEnabled: boolean;
  referralCode: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifLine, setNotifLine] = useState(true);
  const [notifInApp, setNotifInApp] = useState(true);
  const [referralData, setReferralData] = useState<{ referralCode: string; referralLink: string; referralCount: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/sport/profile')
      .then((r) => {
        if (r.status === 401) { router.push('/sport/auth/signin'); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setProfile(data);
        setName(data.name ?? '');
        setPhone(data.phone ?? '');
        setImageUrl(data.image ?? null);
        setNotifEmail(data.notifEmail ?? true);
        setNotifLine(data.notifLine ?? true);
        setNotifInApp(data.notifInApp ?? true);
      });

    fetch('/api/sport/referral')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setReferralData(d); })
      .catch(() => {});
  }, [router]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/sport/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'อัปโหลดไม่สำเร็จ');
      setImageUrl(data.url);
      await fetch('/api/sport/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, image: data.url }),
      });
      setProfile((p) => p ? { ...p, image: data.url } : p);
      toast.success('อัปโหลดรูปโปรไฟล์สำเร็จ');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = { name, phone, notifEmail, notifLine, notifInApp };
      if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }

      const res = await fetch('/api/sport/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProfile((p) => p ? { ...p, name: data.name, phone: data.phone, notifEmail, notifLine, notifInApp } : p);
      setCurrentPassword('');
      setNewPassword('');
      toast.success('บันทึกข้อมูลสำเร็จ!');
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function copyReferralLink() {
    if (!referralData) return;
    await navigator.clipboard.writeText(referralData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputCls = 'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition';

  if (!profile) {
    return (
      <div className="wrapper py-20 text-center text-gray-400">
        <div className="text-4xl mb-3">⏳</div>กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="wrapper py-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <a href="/sport" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">← หน้าหลัก</a>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👤 โปรไฟล์ของฉัน</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 flex items-center gap-4">
        <label className="relative w-16 h-16 flex-shrink-0 cursor-pointer group">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
            {imageUrl ? (
              <img src={imageUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              (profile.name ?? profile.email)[0].toUpperCase()
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <span className="text-white text-xs">{uploadingImage ? '⏳' : '📷'}</span>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
        </label>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white text-lg">{profile.name ?? 'ไม่ระบุชื่อ'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${profile.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
              {profile.role === 'ADMIN' ? '⚙️ Admin' : '👤 ผู้ใช้'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              ⭐ {profile.points} แต้ม
            </span>
            {profile.twoFactorEnabled && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">🔐 2FA</span>
            )}
            {profile.emailVerified ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ ยืนยันอีเมลแล้ว</span>
            ) : (
              <a href="/sport/auth/resend-verification" className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 transition">! ยังไม่ยืนยันอีเมล</a>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">สมัครเมื่อ</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(profile.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Referral Section */}
      {referralData && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">🎁 แนะนำเพื่อน</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">แนะนำเพื่อนให้สมัครและจองสนาม รับโบนัส <strong className="text-primary-600 dark:text-primary-400">50 แต้ม</strong> ต่อคน</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">รหัสแนะนำ</p>
              <p className="font-mono font-bold text-primary-600 dark:text-primary-400 text-lg tracking-widest">{referralData.referralCode}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{referralData.referralLink}</p>
            </div>
            <button
              onClick={copyReferralLink}
              className="flex-shrink-0 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition"
            >
              {copied ? '✓ คัดลอกแล้ว' : '🔗 คัดลอก'}
            </button>
          </div>
          <p className="text-xs text-gray-400">เพื่อนที่แนะนำแล้ว: <strong className="text-gray-700 dark:text-gray-300">{referralData.referralCount} คน</strong></p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 dark:text-white">แก้ไขข้อมูล</h2>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">ชื่อ-นามสกุล</label>
          <input className={inputCls} placeholder="ชื่อของคุณ" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">อีเมล</label>
          <input className={`${inputCls} opacity-60 cursor-not-allowed`} value={profile.email} disabled />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">เบอร์โทรศัพท์</label>
          <input className={inputCls} placeholder="0812345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">เปลี่ยนรหัสผ่าน <span className="text-xs font-normal text-gray-400">(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</span></h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">รหัสผ่านปัจจุบัน</label>
              <input className={inputCls} type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">รหัสผ่านใหม่</label>
              <input className={inputCls} type="password" placeholder="อย่างน้อย 6 ตัวอักษร" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="gradient-btn px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>
      </form>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">🔔 การแจ้งเตือน</h2>
        <div className="space-y-3">
          {[
            { key: 'notifEmail', label: '📧 อีเมล', value: notifEmail, set: setNotifEmail },
            { key: 'notifLine', label: '💬 LINE Notify', value: notifLine, set: setNotifLine },
            { key: 'notifInApp', label: '🔔 In-App & Push', value: notifInApp, set: setNotifInApp },
          ].map(({ key, label, value, set }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              <button
                type="button"
                onClick={() => set(!value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleSave as unknown as React.MouseEventHandler}
          disabled={saving}
          className="w-full py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60"
        >
          บันทึกการตั้งค่าแจ้งเตือน
        </button>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">🛡️ ความปลอดภัย</h2>
        <a
          href="/sport/profile/2fa"
          className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔐</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">ยืนยัน 2 ขั้นตอน (2FA)</p>
              <p className="text-xs text-gray-400">เพิ่มความปลอดภัยให้บัญชีด้วย TOTP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile.twoFactorEnabled ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">เปิดอยู่</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">ปิดอยู่</span>
            )}
            <span className="text-gray-400">→</span>
          </div>
        </a>
      </div>
    </div>
  );
}
