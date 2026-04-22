import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  image: z.string().url().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
  notifEmail: z.boolean().optional(),
  notifLine: z.boolean().optional(),
  notifInApp: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, phone: true, image: true, role: true,
      createdAt: true, emailVerified: true, points: true,
      notifEmail: true, notifLine: true, notifInApp: true,
      twoFactorEnabled: true, referralCode: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  const { name, phone, image, currentPassword, newPassword, notifEmail, notifLine, notifInApp } = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (image !== undefined) updateData.image = image;
  if (notifEmail !== undefined) updateData.notifEmail = notifEmail;
  if (notifLine !== undefined) updateData.notifLine = notifLine;
  if (notifInApp !== undefined) updateData.notifInApp = notifInApp;

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: 'กรุณากรอกรหัสผ่านปัจจุบัน' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) return NextResponse.json({ error: 'ไม่สามารถเปลี่ยนรหัสผ่านสำหรับบัญชี OAuth' }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }, { status: 400 });
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json(updated);
}
