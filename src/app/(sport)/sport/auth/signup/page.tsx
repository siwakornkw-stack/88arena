import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SignUpForm } from './signup-form';

export const metadata = { title: 'สมัครสมาชิก' };

export default async function SportSignUpPage() {
  const session = await auth();
  if (session) redirect('/sport');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/sport" className="text-4xl">🏟️</a>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">สมัครสมาชิก 88ARENA</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">เริ่มจองสนามกีฬาออนไลน์วันนี้</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700/50 shadow-theme-sm p-8">
          <Suspense fallback={<div className="animate-pulse space-y-4">{Array.from({length:5}).map((_,i)=><div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-full"/>)}</div>}>
            <SignUpForm />
          </Suspense>
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            มีบัญชีแล้ว?{' '}
            <a href="/sport/auth/signin" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              เข้าสู่ระบบ
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
