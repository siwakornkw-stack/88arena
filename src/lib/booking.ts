export function generateTimeSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = [];
  const [openH] = openTime.split(':').map(Number);
  const [closeH] = closeTime.split(':').map(Number);

  for (let h = openH; h < closeH; h++) {
    const start = `${String(h).padStart(2, '0')}:00`;
    const end = `${String(h + 1).padStart(2, '0')}:00`;
    slots.push(`${start}-${end}`);
  }
  return slots;
}

export function getNext7Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('th-TH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const SPORT_TYPE_LABELS: Record<string, string> = {
  FOOTBALL: 'ฟุตบอล',
  BASKETBALL: 'บาสเกตบอล',
  BADMINTON: 'แบดมินตัน',
  TENNIS: 'เทนนิส',
  VOLLEYBALL: 'วอลเลย์บอล',
  SWIMMING: 'ว่ายน้ำ',
  OTHER: 'อื่นๆ',
};

export const SPORT_TYPE_EMOJI: Record<string, string> = {
  FOOTBALL: '⚽',
  BASKETBALL: '🏀',
  BADMINTON: '🏸',
  TENNIS: '🎾',
  VOLLEYBALL: '🏐',
  SWIMMING: '🏊',
  OTHER: '🏟️',
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'รอตรวจสอบ',
  APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ปฏิเสธ',
  CANCELLED: 'ยกเลิก',
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};
