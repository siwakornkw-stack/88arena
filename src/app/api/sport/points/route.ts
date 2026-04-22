import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { points: true } }),
    prisma.pointTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return NextResponse.json({ points: user?.points ?? 0, transactions });
}
