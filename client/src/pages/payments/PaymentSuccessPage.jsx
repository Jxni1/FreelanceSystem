import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [returnPath] = useState(() => sessionStorage.getItem('postPaymentReturn') || '/dashboard');

  useEffect(() => {
    const timer = setTimeout(() => navigate(returnPath, { replace: true }), 6000);
    return () => clearTimeout(timer);
  }, [navigate, returnPath]);

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white border rounded-2xl p-8 text-center text-slate-900">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-2xl">
          ✓
        </div>
        <h1 className="text-xl font-bold">Payment received</h1>
        <p className="text-sm text-slate-500 mt-2">
          Your payment is confirmed. The milestone switches to <strong>Funded</strong> within a few
          seconds once Stripe finishes processing.
        </p>
        <Link
          to={returnPath}
          className="inline-block mt-5 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold"
        >
          Back to your contract
        </Link>
        <p className="text-xs text-slate-400 mt-3">Redirecting automatically…</p>
      </div>
    </div>
  );
}
