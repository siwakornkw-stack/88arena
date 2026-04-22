'use client';

import { cn } from '@/lib/utils';
import { getNext7Days, formatDateISO } from '@/lib/booking';

interface DatePickerProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const days = getNext7Days();

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const iso = formatDateISO(day);
        const isSelected = selectedDate === iso;
        const isToday = iso === formatDateISO(new Date());
        const dayName = day.toLocaleDateString('th-TH', { weekday: 'short' });
        const dayNum = day.getDate();
        const month = day.toLocaleDateString('th-TH', { month: 'short' });

        return (
          <button
            key={iso}
            onClick={() => onSelect(iso)}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-xl py-2.5 px-1 text-center transition-all duration-200 border-2',
              isSelected
                ? 'bg-primary-600 border-primary-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            )}
          >
            <span className={cn('text-xs font-medium', isSelected ? 'text-primary-100' : isToday ? 'text-primary-500' : 'text-gray-400')}>
              {dayName}
            </span>
            <span className={cn('text-xl font-bold leading-none', isToday && !isSelected && 'text-primary-600 dark:text-primary-400')}>
              {dayNum}
            </span>
            <span className={cn('text-xs', isSelected ? 'text-primary-200' : 'text-gray-400')}>
              {month}
            </span>
            {isToday && (
              <span className={cn('w-1.5 h-1.5 rounded-full mt-0.5', isSelected ? 'bg-white' : 'bg-primary-500')} />
            )}
          </button>
        );
      })}
    </div>
  );
}
