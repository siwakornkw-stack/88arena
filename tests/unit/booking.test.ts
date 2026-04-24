import { describe, it, expect } from 'vitest';
import { generateTimeSlots, getNext7Days, formatDateISO } from '@/lib/booking';

describe('generateTimeSlots', () => {
  it('generates hourly slots between open and close', () => {
    expect(generateTimeSlots('08:00', '12:00')).toEqual([
      '08:00-09:00',
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
    ]);
  });

  it('returns empty when open >= close', () => {
    expect(generateTimeSlots('10:00', '10:00')).toEqual([]);
  });

  it('pads single-digit hours with leading zero', () => {
    const slots = generateTimeSlots('08:00', '10:00');
    expect(slots[0]).toBe('08:00-09:00');
  });
});

describe('getNext7Days', () => {
  it('returns exactly 7 days', () => {
    expect(getNext7Days()).toHaveLength(7);
  });

  it('starts from today at midnight', () => {
    const days = getNext7Days();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(days[0].getTime()).toBe(today.getTime());
  });

  it('advances one day at a time', () => {
    const days = getNext7Days();
    for (let i = 1; i < days.length; i++) {
      const diff = days[i].getTime() - days[i - 1].getTime();
      expect(diff).toBe(24 * 60 * 60 * 1000);
    }
  });
});

describe('formatDateISO', () => {
  it('produces YYYY-MM-DD', () => {
    const d = new Date(Date.UTC(2026, 0, 15));
    expect(formatDateISO(d)).toBe('2026-01-15');
  });
});
