import Link from 'next/link';

export const metadata = { title: 'ยกเลิกการชำระเงิน' };

export default function PaymentCancelPage() {
  return (
    <div className="wrapper py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
      <div className="text-6xl mb-6">❌</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">ยกเลิกการชำระเงิน</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        การจองถูกยกเลิกแล้ว คุณสามารถกลับไปเลือกสนามและทำการจองใหม่ได้
      </p>
      <div className="flex gap-3">
        <Link
          href="/sport"
          className="px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          กลับหน้าหลัก
        </Link>
        <Link
          href="/sport/bookings"
          className="px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
        >
          การจองของฉัน
        </Link>
      </div>
    </div>
  );
}
