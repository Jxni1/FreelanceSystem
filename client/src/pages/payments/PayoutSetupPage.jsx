import { useEffect, useState } from 'react';
import { stripeService } from '../../lib/stripeService';

export default function PayoutSetupPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [working, setWorking] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stripeService.connectStatus();
      setStatus(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load payout status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const startOnboarding = async () => {
    setWorking(true);
    setError(null);
    try {
      const data = await stripeService.connectOnboard();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError('Stripe did not return an onboarding link.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to start onboarding.');
    } finally {
      setWorking(false);
    }
  };

  const ready = status?.payoutsEnabled || status?.transfersEnabled;

  return (
    <div className="p-8 max-w-2xl mx-auto text-slate-900">
      <h1 className="text-2xl font-bold">Payouts</h1>
      <p className="text-sm text-slate-500 mt-1">
        Connect a Stripe account so clients can pay you for approved milestones.
      </p>

      <div className="mt-6 bg-white border rounded-2xl p-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading status…</p>
        ) : (
          <>
            {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>}

            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  ready ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {!status?.hasAccount ? 'Not connected' : ready ? 'Ready to receive payments' : 'Setup incomplete'}
              </span>
            </div>

            {status?.hasAccount && (
              <ul className="mt-4 text-sm text-slate-600 space-y-1">
                <li>Can receive transfers: <strong>{status.transfersEnabled ? 'yes' : 'no'}</strong></li>
                <li>Can withdraw to bank (payouts): <strong>{status.payoutsEnabled ? 'yes' : 'no'}</strong></li>
                {status.currentlyDue?.length > 0 && (
                  <li className="text-amber-600">Still required: {status.currentlyDue.join(', ')}</li>
                )}
              </ul>
            )}

            <button
              type="button"
              onClick={startOnboarding}
              disabled={working}
              className="mt-5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60"
            >
              {working ? 'Redirecting…' : !status?.hasAccount ? 'Set up payouts' : ready ? 'Manage / update details' : 'Finish setup'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
