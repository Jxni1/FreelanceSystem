import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, Briefcase } from 'lucide-react';
import { useClients } from '../../hooks/useClients';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { RatingStars } from '../../components/ui/RatingStars';

function formatMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? `$${n.toLocaleString()}` : '—';
}

export default function ClientProfilePage() {
  const { id } = useParams();
  const { client, isLoading, error, fetchClientById } = useClients();

  useEffect(() => {
    if (id) fetchClientById(id).catch(() => {});
  }, [id, fetchClientById]);

  if (isLoading && !client) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" aria-hidden="true" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Breadcrumbs items={[{ label: 'Clients' }, { label: 'Profile' }]} />
        <Card className="border-rose-200 bg-rose-50">
          <p className="font-semibold text-rose-700">Client not found</p>
          <p className="mt-1 text-sm text-rose-600">{typeof error === 'string' ? error : 'This profile could not be loaded.'}</p>
        </Card>
      </div>
    );
  }

  const name = client.name || client.username || 'Client';
  const rating = client.averageRating || 0;
  const reviewCount = client.reviewCount ?? 0;

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Clients' }, { label: name }]} />

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={name} size="lg" className="h-16 w-16 text-lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{name}</h1>
              <BadgeCheck className="h-5 w-5 text-brand-600" aria-hidden="true" />
            </div>
            {client.industry ? (
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-slate-500">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                {client.industry}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <RatingStars rating={rating} size="sm" />
              <span className="text-slate-400">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="About">
            {client.bio ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{client.bio}</p>
            ) : (
              <p className="text-sm text-slate-500">This client hasn’t added a bio yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Details">
            <dl className="space-y-2 text-sm">
              {[
                ['Industry', client.industry || '—'],
                ['Avg. budget', formatMoney(client.budget)],
                ['Rating', rating > 0 ? `${Number(rating).toFixed(1)} ★` : '—'],
                ['Reviews', reviewCount],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
