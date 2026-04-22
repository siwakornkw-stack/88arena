'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { FieldCard } from '@/components/sport/field-card';

const FieldMap = dynamic(() => import('@/components/sport/field-map').then((m) => ({ default: m.FieldMap })), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center text-gray-400">กำลังโหลดแผนที่...</div>,
});

interface Field {
  id: string;
  name: string;
  sportType: string;
  location: string | null;
  pricePerHour: number;
  lat: number | null;
  lng: number | null;
  imageUrl: string | null;
  description: string | null;
  openTime: string;
  closeTime: string;
  facilities: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ViewToggleProps {
  fields: Field[];
  ratingMap: Map<string, { avg: number; count: number }>;
}

export function ViewToggle({ fields, ratingMap }: ViewToggleProps) {
  const [view, setView] = useState<'grid' | 'map'>('grid');

  return (
    <div className="space-y-4">
      {/* Toggle buttons */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setView('grid')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${view === 'grid' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          ▦ รายการ
        </button>
        <button
          onClick={() => setView('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${view === 'map' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          🗺️ แผนที่
        </button>
      </div>

      {view === 'grid' ? (
        fields.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏟️</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">ไม่พบสนามที่ตรงกับการค้นหา</h3>
            <p className="mt-2 text-gray-400">ลองปรับตัวกรองใหม่อีกครั้ง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {fields.map((field) => (
              <FieldCard key={field.id} field={field} rating={ratingMap.get(field.id)} />
            ))}
          </div>
        )
      ) : (
        <FieldMap fields={fields} />
      )}
    </div>
  );
}
