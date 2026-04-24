import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import { SportHeader } from '@/components/sport/sport-header';
import { I18nProvider } from '@/i18n/provider';
import { getLocale } from '@/i18n/server';

export const metadata = {
  title: { default: '88ARENA - ระบบจองสนามกีฬา', template: '%s | 88ARENA' },
  description: 'ระบบจองสนามกีฬาออนไลน์ ค้นหาและจองสนามได้ง่ายๆ',
};

export default async function SportLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const locale = await getLocale();

  return (
    <SessionProvider session={session}>
      <I18nProvider initialLocale={locale}>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex flex-col">
          <SportHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} 88ARENA — ระบบจองสนามกีฬาออนไลน์
          </footer>
        </div>
      </I18nProvider>
    </SessionProvider>
  );
}
