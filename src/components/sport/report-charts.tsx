'use client';

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { SPORT_TYPE_LABELS } from '@/lib/booking';

interface StatusData { name: string; value: number; color: string }
interface SportData { sportType: string; count: number; revenue: number }
interface HourData { hour: number; count: number }
interface DayData { day: string; count: number; revenue: number }
interface FieldTrend { fieldId: string; fieldName: string; data: { date: string; revenue: number }[] }
interface HeatmapCell { day: number; hour: number; count: number }
interface OccupancyField { fieldId: string; fieldName: string; sportType: string; occupancyRate: number; hoursBooked: number; totalSlots: number }

const FIELD_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const DAY_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

interface ReportChartsProps {
  byStatus: Record<string, number>;
  bySportType: SportData[];
  bookings: { date: string; status: string; timeSlot: string; field: { pricePerHour: number } }[];
  byHour?: HourData[];
  byDayOfWeek?: DayData[];
  byFieldTrend?: FieldTrend[];
  heatmap?: HeatmapCell[];
  occupancyByField?: OccupancyField[];
}

const STATUS_CHART_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  CANCELLED: '#6b7280',
};
const STATUS_NAMES: Record<string, string> = {
  PENDING: 'รอตรวจสอบ',
  APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ปฏิเสธ',
  CANCELLED: 'ยกเลิก',
};

function heatColor(count: number, max: number) {
  if (max === 0 || count === 0) return '#f3f4f6';
  const ratio = count / max;
  if (ratio < 0.25) return '#ddd6fe';
  if (ratio < 0.5) return '#a78bfa';
  if (ratio < 0.75) return '#7c3aed';
  return '#4c1d95';
}

function DayHourHeatmap({ heatmap }: { heatmap: HeatmapCell[] }) {
  const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6–22
  const cellMap: Record<string, number> = {};
  let maxCount = 0;
  for (const c of heatmap) {
    cellMap[`${c.day}-${c.hour}`] = c.count;
    if (c.count > maxCount) maxCount = c.count;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        {/* Hour labels */}
        <div className="flex ml-8 mb-1">
          {HOURS.map((h) => (
            <div key={h} className="w-8 text-center text-[9px] text-gray-400 flex-shrink-0">{h}น.</div>
          ))}
        </div>
        {/* Grid rows */}
        {DAY_SHORT.map((dayName, dow) => (
          <div key={dow} className="flex items-center gap-0 mb-0.5">
            <span className="w-8 text-[10px] text-gray-500 flex-shrink-0 text-right pr-1">{dayName}</span>
            {HOURS.map((h) => {
              const count = cellMap[`${dow}-${h}`] ?? 0;
              const bg = heatColor(count, maxCount);
              return (
                <div
                  key={h}
                  className="w-8 h-7 flex-shrink-0 rounded-sm mx-px flex items-center justify-center text-[9px] font-bold transition-colors cursor-default"
                  style={{ backgroundColor: bg, color: count / maxCount > 0.5 ? '#fff' : '#374151' }}
                  title={`${dayName} ${h}:00 — ${count} การจอง`}
                >
                  {count > 0 ? count : ''}
                </div>
              );
            })}
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center gap-2 mt-2 ml-8">
          <span className="text-[10px] text-gray-400">น้อย</span>
          {['#f3f4f6', '#ddd6fe', '#a78bfa', '#7c3aed', '#4c1d95'].map((c) => (
            <div key={c} className="w-5 h-4 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span className="text-[10px] text-gray-400">มาก</span>
        </div>
      </div>
    </div>
  );
}

export function ReportCharts({ byStatus, bySportType, bookings, byHour, byDayOfWeek, byFieldTrend, heatmap, occupancyByField }: ReportChartsProps) {
  const pieData: StatusData[] = Object.entries(byStatus)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: STATUS_NAMES[k] ?? k, value: v, color: STATUS_CHART_COLORS[k] ?? '#8b5cf6' }));

  const sportBarData = bySportType.map((s) => ({
    name: SPORT_TYPE_LABELS[s.sportType] ?? s.sportType,
    จำนวน: s.count,
    รายได้: s.revenue,
  }));

  const dailyMap: Record<string, { count: number; revenue: number }> = {};
  for (const b of bookings) {
    const d = b.date.split('T')[0];
    if (!dailyMap[d]) dailyMap[d] = { count: 0, revenue: 0 };
    dailyMap[d].count++;
    if (b.status === 'APPROVED') {
      const parts = b.timeSlot.split('-');
      const hrs = parts.length === 2 ? Math.max(1, Number(parts[1].split(':')[0]) - Number(parts[0].split(':')[0])) : 1;
      dailyMap[d].revenue += b.field.pricePerHour * (isNaN(hrs) ? 1 : hrs);
    }
  }
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, v]) => ({
      date: new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
      ...v,
    }));

  const hourData = (byHour ?? []).filter((h) => h.hour >= 6);
  const dayData = byDayOfWeek ?? [];
  const hasHeatmap = (heatmap ?? []).some((c) => c.count > 0);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pie: Status */}
        {pieData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">สัดส่วนสถานะการจอง</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name ?? ''} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} รายการ`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar: Sport type */}
        {sportBarData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">จำนวนจองตามประเภทกีฬา</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sportBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="จำนวน" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Daily trend */}
        {dailyData.length > 1 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 md:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">แนวโน้มการจองรายวัน (14 วันล่าสุด)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="การจอง" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="รายได้ (฿)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Day × Hour Heatmap Grid */}
      {hasHeatmap && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Peak Hour Heatmap (วัน × ชั่วโมง)</h3>
          <p className="text-xs text-gray-400 mb-4">สีเข้มขึ้น = จองมากขึ้น</p>
          <DayHourHeatmap heatmap={heatmap!} />
        </div>
      )}

      {/* Hourly bar (fallback when no cross-heatmap) */}
      {!hasHeatmap && hourData.length > 0 && hourData.some((h) => h.count > 0) && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">ช่วงเวลาที่นิยมจอง</h3>
          <p className="text-xs text-gray-400 mb-4">สีเข้มขึ้น = จองมากขึ้น</p>
          <div className="flex flex-wrap gap-1.5">
            {hourData.map(({ hour, count }) => {
              const maxH = Math.max(...hourData.map((h) => h.count), 1);
              return (
                <div key={hour} className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
                    style={{ backgroundColor: heatColor(count, maxH), color: count / maxH > 0.5 ? '#fff' : '#374151' }}
                    title={`${hour}:00 — ${count} การจอง`}
                  >
                    {count > 0 ? count : ''}
                  </div>
                  <span className="text-[10px] text-gray-400">{hour}น.</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day of week */}
      {dayData.length > 0 && dayData.some((d) => d.count > 0) && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">การจองตามวันในสัปดาห์</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dayData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, name) => [name === 'revenue' ? `฿${Number(v).toLocaleString()}` : `${v} รายการ`, name === 'revenue' ? 'รายได้' : 'การจอง']} />
              <Legend formatter={(v) => v === 'count' ? 'การจอง' : 'รายได้ (฿)'} />
              <Bar dataKey="count" name="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Occupancy Rate per Field */}
      {occupancyByField && occupancyByField.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Occupancy Rate ต่อสนาม</h3>
          <p className="text-xs text-gray-400 mb-4">ชั่วโมงที่จอง (อนุมัติ) / ชั่วโมงที่เปิดให้บริการทั้งหมดในช่วงเวลาที่เลือก</p>
          <div className="space-y-3">
            {occupancyByField.map((f) => {
              const pct = Math.round(f.occupancyRate);
              const barColor = pct >= 75 ? '#10b981' : pct >= 40 ? '#6366f1' : '#f59e0b';
              return (
                <div key={f.fieldId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[60%]">{f.fieldName}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{f.hoursBooked}h / {f.totalSlots}h</span>
                      <span className="text-sm font-bold" style={{ color: barColor }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-amber-400" /> &lt;40% ต่ำ</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-indigo-500" /> 40–74% ปานกลาง</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> ≥75% สูง</span>
          </div>
        </div>
      )}

      {/* Revenue trend per field */}
      {byFieldTrend && byFieldTrend.length > 0 && byFieldTrend.some((f) => f.data.length > 0) && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">รายได้รายวันต่อสนาม (Top 5)</h3>
          <div className="flex flex-wrap gap-3 mb-3">
            {byFieldTrend.map((f, i) => (
              <div key={f.fieldId} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FIELD_COLORS[i % FIELD_COLORS.length] }} />
                {f.fieldName}
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                type="category"
                allowDuplicatedCategory={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `฿${Number(v).toLocaleString()}`} />
              <Tooltip formatter={(v) => [`฿${Number(v).toLocaleString()}`, 'รายได้']} labelFormatter={(l) => new Date(l).toLocaleDateString('th-TH')} />
              {byFieldTrend.map((f, i) => (
                <Line
                  key={f.fieldId}
                  data={f.data}
                  type="monotone"
                  dataKey="revenue"
                  name={f.fieldName}
                  stroke={FIELD_COLORS[i % FIELD_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
