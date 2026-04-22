import Link from 'next/link';

export const metadata = { title: 'ชำระเงินสำเร็จ' };

export default function PaymentSuccessPage() {
  return (
    <div className="wrapper py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">ชำระเงินสำเร็จ!</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        ระบบได้รับการชำระเงินของคุณแล้ว กรุณารอแอดมินยืนยันการจอง
      </p>
      <p className="text-sm text-gray-400 mb-8">
        คุณจะได้รับอีเมลยืนยันเมื่อการจองได้รับการอนุมัติ
      </p>
      <Link
        href="/sport/bookings"
        className="px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-semibold transition"
      >
        ดูการจองของฉัน →
      </Link>
    </div>
  );
}
