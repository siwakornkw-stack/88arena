'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SPORT_TYPE_LABELS, SPORT_TYPE_EMOJI, STATUS_LABELS, STATUS_COLORS } from '@/lib/booking';
import { ReportCharts } from '@/components/sport/report-charts';
import jsPDF from 'jspdf';

type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
type SportType = 'FOOTBALL' | 'BASKETBALL' | 'BADMINTON' | 'TENNIS' | 'VOLLEYBALL' | 'SWIMMING' | 'OTHER';

interface ReportBooking {
  id: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  note: string | null;
  createdAt: string;
  user: { name: string | null; email: string; phone: string | null };
  field: { name: string; sportType: SportType; pricePerHour: number };
}

interface ReportData {
  bookings: ReportBooking[];
  summary: {
    total: number;
    byStatus: Record<BookingStatus, number>;
    totalRevenue: number;
  };
  bySportType: { sportType: string; count: number; revenue: number }[];
  byField: { name: string; sportType: string; count: number; revenue: number; approved: number }[];
  byHour: { hour: number; count: number }[];
  byDayOfWeek: { day: string; count: number; revenue: number }[];
  byFieldTrend: { fieldId: string; fieldName: string; data: { date: string; revenue: number }[] }[];
  heatmap: { day: number; hour: number; count: number }[];
  occupancyByField: { fieldId: string; fieldName: string; sportType: string; occupancyRate: number; hoursBooked: number; totalSlots: number }[];
}

const SPORT_OPTIONS = [
  { value: 'ALL', label: 'ทุกประเภท' },
  ...Object.entries(SPORT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'ทุกสถานะ' },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function monthAgoISO() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
}

export default function ReportsPage() {
  const [from, setFrom] = useState(monthAgoISO());
  const [to, setTo] = useState(todayISO());
  const [status, setStatus] = useState('ALL');
  const [sportType, setSportType] = useState('ALL');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ from, to, status, sportType });
    const res = await fetch(`/api/sport/admin/reports?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [from, to, status, sportType]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  function buildExportUrl() {
    const params = new URLSearchParams({ from, to, status, sportType });
    return `/api/sport/admin/export?${params}`;
  }

  const maxCount = data?.bySportType.reduce((m, s) => Math.max(m, s.count), 0) ?? 1;

  function exportPDF() {
    if (!data) return;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text('88ARENA - Monthly Report', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Period: ${from} to ${to}`, 14, y);
    y += 12;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Summary', 14, y);
    y += 7;

    doc.setFontSize(10);
    doc.text(`Total Bookings: ${data.summary.total}`, 14, y); y += 5;
    doc.text(`Revenue (Approved): ${data.summary.totalRevenue.toLocaleString()} THB`, 14, y); y += 5;
    doc.text(`Pending: ${data.summary.byStatus.PENDING}  Approved: ${data.summary.byStatus.APPROVED}  Rejected: ${data.summary.byStatus.REJECTED}  Cancelled: ${data.summary.byStatus.CANCELLED}`, 14, y);
    y += 12;

    doc.setFontSize(12);
    doc.text('Bookings', 14, y);
    y += 7;

    doc.setFontSize(9);
    const headers = ['Field', 'Date', 'Time', 'Customer', 'Status'];
    const colX = [14, 64, 94, 114, 164];
    headers.forEach((h, i) => { doc.setFont('helvetica', 'bold'); doc.text(h, colX[i], y); });
    doc.setFont('helvetica', 'normal');
    y += 5;

    for (const b of data.bookings.slice(0, 60)) {
      if (y > 270) { doc.addPage(); y = 20; }
      const row = [
        b.field.name.slice(0, 18),
        new Date(b.date).toLocaleDateString('en-GB'),
        b.timeSlot,
        (b.user.name ?? b.user.email).slice(0, 18),
        STATUS_LABELS[b.status],
      ];
      row.forEach((cell, i) => doc.text(cell, colX[i], y));
      y += 5;
    }

    doc.save(`88arena-report-${from}-${to}.pdf`);
  }

  return (
    <div className="wrapper py-8 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/sport/admin" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 รีพอร์ต</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportPDF}
            disabled={!data}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition shadow-sm disabled:opacity-50"
          >
            📄 ส่งออก PDF
          </button>
          <a
            href={buildExportUrl()}
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition shadow-sm"
          >
            ⬇️ ส่งออก CSV
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">ตัวกรอง</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">ตั้งแต่วันที่</label>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">ถึงวันที่</label>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">สถานะ</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">ประเภทกีฬา</label>
            <select
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {SPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          กำลังโหลด...
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard icon="📋" label="การจองทั้งหมด" value={data.summary.total} color="from-blue-500/20 to-cyan-500/20" textColor="text-blue-600 dark:text-blue-400" />
            <SummaryCard icon="💰" label="รายได้ (อนุมัติแล้ว)" value={`฿${data.summary.totalRevenue.toLocaleString()}`} color="from-green-500/20 to-emerald-500/20" textColor="text-green-600 dark:text-green-400" />
            <SummaryCard icon="⏳" label="รอการอนุมัติ" value={data.summary.byStatus.PENDING} color="from-yellow-500/20 to-orange-500/20" textColor="text-yellow-600 dark:text-yellow-400" />
            <SummaryCard icon="✅" label="อนุมัติแล้ว" value={data.summary.byStatus.APPROVED} color="from-primary-500/20 to-violet-500/20" textColor="text-primary-600 dark:text-primary-400" />
          </div>

          {/* Recharts */}
          <ReportCharts
            byStatus={data.summary.byStatus}
            bySportType={data.bySportType}
            bookings={data.bookings}
            byHour={data.byHour}
            byDayOfWeek={data.byDayOfWeek}
            byFieldTrend={data.byFieldTrend}
            heatmap={data.heatmap}
            occupancyByField={data.occupancyByField}
          />

          {/* Status Breakdown + Sport Type Breakdown */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Status breakdown */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">สถานะการจอง</h2>
              <div className="space-y-3">
                {(Object.entries(data.summary.byStatus) as [BookingStatus, number][]).map(([st, count]) => (
                  <div key={st} className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[st]}`}>
                      {STATUS_LABELS[st]}
                    </span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: data.summary.total > 0 ? `${(count / data.summary.total) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sport type breakdown */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">จำนวนจองตามประเภทกีฬา</h2>
              {data.bySportType.length === 0 ? (
                <p className="text-sm text-gray-400">ไม่มีข้อมูล</p>
              ) : (
                <div className="space-y-3">
                  {data.bySportType.sort((a, b) => b.count - a.count).map((item) => (
                    <div key={item.sportType} className="flex items-center gap-3">
                      <span className="text-xl w-6 text-center">{SPORT_TYPE_EMOJI[item.sportType]}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">
                        {SPORT_TYPE_LABELS[item.sportType] ?? item.sportType}
                      </span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Field Analytics */}
          {data.byField && data.byField.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white">Analytics ต่อสนาม</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase">
                      <th className="px-4 py-3 text-left font-semibold">สนาม</th>
                      <th className="px-4 py-3 text-center font-semibold">การจองทั้งหมด</th>
                      <th className="px-4 py-3 text-center font-semibold">อนุมัติ</th>
                      <th className="px-4 py-3 text-center font-semibold">อัตราอนุมัติ</th>
                      <th className="px-4 py-3 text-right font-semibold">รายได้</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.byField.map((f) => (
                      <tr key={f.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{SPORT_TYPE_EMOJI[f.sportType]}</span>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{f.name}</p>
                              <p className="text-xs text-gray-400">{SPORT_TYPE_LABELS[f.sportType]}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">{f.count}</td>
                        <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-semibold">{f.approved}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {f.count > 0 ? ((f.approved / f.count) * 100).toFixed(0) : 0}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-primary-600 dark:text-primary-400">
                          ฿{f.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">รายการจอง ({data.bookings.length})</h2>
              <a
                href={buildExportUrl()}
                download
                className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
              >
                ⬇️ ดาวน์โหลด CSV
              </a>
            </div>

            {data.bookings.length === 0 ? (
              <div className="p-12 text-center text-gray-400">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-semibold">สนาม</th>
                      <th className="px-4 py-3 text-left font-semibold">วันที่ / เวลา</th>
                      <th className="px-4 py-3 text-left font-semibold">ลูกค้า</th>
                      <th className="px-4 py-3 text-left font-semibold">ราคา</th>
                      <th className="px-4 py-3 text-left font-semibold">สถานะ</th>
                      <th className="px-4 py-3 text-left font-semibold">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{SPORT_TYPE_EMOJI[booking.field.sportType]}</span>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{booking.field.name}</p>
                              <p className="text-xs text-gray-400">{SPORT_TYPE_LABELS[booking.field.sportType]}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(booking.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-primary-600 dark:text-primary-400">{booking.timeSlot} น.</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{booking.user.name ?? '-'}</p>
                          <p className="text-xs text-gray-400">{booking.user.email}</p>
                          {booking.user.phone && (
                            <a href={`tel:${booking.user.phone}`} className="text-xs text-green-600 dark:text-green-400 hover:underline">
                              {booking.user.phone}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                          ฿{booking.field.pricePerHour.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status]}`}>
                            {STATUS_LABELS[booking.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-[160px] truncate">
                          {booking.note ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  icon, label, value, color, textColor,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${color} border border-white/50 dark:border-gray-700/50 p-5`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}
