import { Link } from 'react-router-dom';

export default function PaymentCancelPage() {
  const returnPath = sessionStorage.getItem('postPaymentReturn') || '/dashboard';

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white border rounded-2xl p-8 text-center text-slate-900">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-2xl">
          ×
        </div>
        <h1 className="text-xl font-bold">Payment cancelled</h1>
        <p className="text-sm text-slate-500 mt-2">
          No charge was made. The milestone is still awaiting payment — you can resume it anytime.
        </p>
        <Link
          to={returnPath}
          className="inline-block mt-5 px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold"
        >
          Back to your contract
        </Link>
      </div>
    </div>
  );
}
