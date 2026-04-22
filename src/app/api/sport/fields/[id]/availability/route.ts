import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function toTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

// Expands a stored timeSlot (single "09:00-10:00" or range "09:00-11:00") into hourly slot keys
function expandTimeSlot(ts: string): string[] {
  const [start, end] = ts.split('-');
  const startM = toMinutes(start);
  const endM = toMinutes(end);
  const duration = endM - startM;

  if (duration <= 60) return [ts];

  const result: string[] = [];
  for (let m = startM; m < endM; m += 60) {
    result.push(`${toTime(m)}-${toTime(m + 60)}`);
  }
  return result;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  const field = await prisma.field.findFirst({ where: { id: decodedId } });
  if (!field) return NextResponse.json({ error: 'Field not found' }, { status: 404 });

  const bookings = await prisma.booking.findMany({
    where: {
      fieldId: decodedId,
      date: new Date(date),
      status: { in: ['PENDING', 'APPROVED'] },
    },
    select: { timeSlot: true, status: true },
  });

  const bookedSlots: Record<string, string> = {};
  for (const b of bookings) {
    for (const slot of expandTimeSlot(b.timeSlot)) {
      bookedSlots[slot] = b.status;
    }
  }

  return NextResponse.json({ bookedSlots, openTime: field.openTime, closeTime: field.closeTime });
}
