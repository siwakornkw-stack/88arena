import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [totalFields, totalUsers, totalBookings, pendingBookings, recentBookings] = await Promise.all([
    prisma.field.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        field: { select: { name: true, sportType: true } },
      },
    }),
  ]);

  return NextResponse.json({ totalFields, totalUsers, totalBookings, pendingBookings, recentBookings });
}
