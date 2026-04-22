import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendBookingApprovedEmail, sendBookingRejectedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ids, status } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0 || !['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    where: { id: { in: ids }, status: 'PENDING' },
    include: {
      user: { select: { name: true, email: true } },
      field: { select: { name: true } },
    },
  });

  await prisma.booking.updateMany({
    where: { id: { in: bookings.map((b) => b.id) } },
    data: { status },
  });

  // Create notifications + send emails
  await Promise.all(
    bookings.map(async (booking) => {
      const isApproved = status === 'APPROVED';
      const emailData = {
        userName: booking.user.name ?? 'ลูกค้า',
        fieldName: booking.field.name,
        date: booking.date.toLocaleDateString('th-TH'),
        timeSlot: booking.timeSlot,
      };

      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: isApproved ? 'BOOKING_APPROVED' : 'BOOKING_REJECTED',
          title: isApproved ? '🎉 การจองได้รับการอนุมัติ' : '❌ การจองถูกปฏิเสธ',
          message: `${booking.field.name} วันที่ ${emailData.date} เวลา ${booking.timeSlot} น.`,
          link: '/sport/bookings',
        },
      });

      if (isApproved) {
        await sendBookingApprovedEmail(booking.user.email, emailData).catch(() => {});
      } else {
        await sendBookingRejectedEmail(booking.user.email, emailData).catch(() => {});
      }
    })
  );

  return NextResponse.json({ updated: bookings.length });
}
