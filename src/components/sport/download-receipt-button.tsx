'use client';

import { useState } from 'react';

interface ReceiptData {
  bookingId: string;
  fieldName: string;
  sportType: string;
  date: string;
  timeSlot: string;
  userName: string;
  userEmail: string;
  pricePerHour: number;
  totalAmount: number;
  discountAmount?: number;
  couponCode?: string;
  status: string;
  createdAt: string;
}

export function DownloadReceiptButton({ booking }: { booking: ReceiptData }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin;

      // Header bar
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, pageW, 40, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Sport Booking Receipt', margin, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Invoice / Tax Receipt', margin, 26);

      // Booking ID top right
      doc.setFontSize(9);
      doc.text(`#${booking.bookingId.slice(-8).toUpperCase()}`, pageW - margin, 18, { align: 'right' });
      doc.text(new Date(booking.createdAt).toLocaleDateString('en-GB'), pageW - margin, 25, { align: 'right' });

      y = 55;

      // Status badge
      const statusColor = booking.status === 'APPROVED' ? [34, 197, 94] : [234, 179, 8];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(margin, y - 5, 35, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(booking.status, margin + 17.5, y + 0.5, { align: 'center' });

      y += 10;
      doc.setTextColor(30, 30, 30);

      // Section helper
      const drawSection = (title: string, rows: [string, string][], startY: number): number => {
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(margin, startY, pageW - margin * 2, 8, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(99, 102, 241);
        doc.text(title, margin + 3, startY + 5.5);
        let rowY = startY + 13;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        for (const [label, value] of rows) {
          doc.setTextColor(100, 100, 100);
          doc.text(label, margin + 3, rowY);
          doc.setTextColor(30, 30, 30);
          doc.setFont('helvetica', 'bold');
          doc.text(value, pageW - margin - 3, rowY, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          rowY += 8;
        }
        return rowY + 4;
      };

      y = drawSection('Booking Details', [
        ['Field', booking.fieldName],
        ['Sport Type', booking.sportType],
        ['Date', new Date(booking.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
        ['Time', `${booking.timeSlot} hrs.`],
      ], y);

      y = drawSection('Customer Information', [
        ['Name', booking.userName],
        ['Email', booking.userEmail],
      ], y + 4);

      // Pricing
      y += 4;
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(margin, y, pageW - margin * 2, 8, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text('Payment Summary', margin + 3, y + 5.5);
      y += 13;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);

      doc.text('Booking Fee', margin + 3, y);
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.text(`THB ${booking.totalAmount + (booking.discountAmount ?? 0)}`, pageW - margin - 3, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 8;

      if (booking.discountAmount && booking.discountAmount > 0) {
        doc.setTextColor(100, 100, 100);
        doc.text(`Discount${booking.couponCode ? ` (${booking.couponCode})` : ''}`, margin + 3, y);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text(`-THB ${booking.discountAmount}`, pageW - margin - 3, y, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        y += 8;
      }

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageW - margin, y);
      y += 6;

      // Total
      doc.setFillColor(99, 102, 241);
      doc.roundedRect(margin, y, pageW - margin * 2, 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL', margin + 5, y + 8);
      doc.text(`THB ${booking.totalAmount.toLocaleString()}`, pageW - margin - 5, y + 8, { align: 'right' });
      y += 20;

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for booking with us. Please show this receipt when arriving at the venue.', pageW / 2, y, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, pageW / 2, y + 5, { align: 'center' });

      doc.save(`receipt-${booking.bookingId.slice(-8).toUpperCase()}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-1"
    >
      {loading ? '⏳' : '🧾'} {loading ? 'กำลังสร้าง...' : 'ใบเสร็จ'}
    </button>
  );
}
