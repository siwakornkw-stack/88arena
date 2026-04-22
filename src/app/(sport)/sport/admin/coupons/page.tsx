import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { CouponManager } from './coupon-manager';

export const metadata = { title: 'จัดการคูปอง' };

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/sport');

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="wrapper py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/sport/admin" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</Link>
      </div>
      <CouponManager initialCoupons={coupons.map((c) => ({ ...c, expiresAt: c.expiresAt?.toISOString() ?? null }))} />
    </div>
  );
}
