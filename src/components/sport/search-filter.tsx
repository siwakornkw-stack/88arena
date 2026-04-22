'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { SPORT_TYPE_LABELS } from '@/lib/booking';

const SPORT_TYPES = Object.entries(SPORT_TYPE_LABELS);

export function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/sport?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="ค้นหาสนาม หรือ สถานที่..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => update('search', e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
        />
      </div>

      {/* Sport Type */}
      <select
        defaultValue={searchParams.get('sport') ?? ''}
        onChange={(e) => update('sport', e.target.value)}
        className="h-11 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
      >
        <option value="">ทุกประเภทกีฬา</option>
        {SPORT_TYPES.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Price Range */}
      <select
        defaultValue=""
        onChange={(e) => {
          const [min, max] = (e.target.value || ',').split(',');
          update('minPrice', min);
          update('maxPrice', max);
        }}
        className="h-11 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
      >
        <option value="">ทุกช่วงราคา</option>
        <option value="0,200">ไม่เกิน ฿200/ชม.</option>
        <option value="200,500">฿200 – ฿500/ชม.</option>
        <option value="500,1000">฿500 – ฿1,000/ชม.</option>
        <option value="1000,">มากกว่า ฿1,000/ชม.</option>
      </select>
    </div>
  );
}
