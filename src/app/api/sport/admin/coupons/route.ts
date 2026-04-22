import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { bookings: true } } },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code, discountType, discountValue, maxUses, expiresAt } = await req.json();
  if (!code || !discountType || !discountValue) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'รหัสคูปองนี้มีอยู่แล้ว' }, { status: 409 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, isActive } = await req.json();
  const coupon = await prisma.coupon.update({ where: { id }, data: { isActive } });
  return NextResponse.json(coupon);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
