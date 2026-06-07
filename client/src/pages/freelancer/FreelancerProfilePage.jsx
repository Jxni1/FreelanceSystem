import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, Bookmark } from 'lucide-react';
import { useFreelancers } from '../../hooks/useFreelancers';
import { useReviews } from '../../hooks/useReviews';
import { useFavoriteFreelancers } from '../../hooks/useFavoriteFreelancers';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { RatingStars } from '../../components/ui/RatingStars';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export default function FreelancerProfilePage() {
  const { id } = useParams();
  const { freelancer, isLoading, fetchFreelancerById } = useFreelancers();
  const { reviews, fetchReviews } = useReviews();
  const { favorites, fetchFavorites, addFavorite, removeFavorite, isToggling } = useFavoriteFreelancers();

  useEffect(() => {
    if (id) fetchFreelancerById(id).catch(() => {});
  }, [id, fetchFreelancerById]);

  useEffect(() => {
    if (id) fetchReviews({ freelancerId: id, pageSize: 20 }).catch?.(() => {});
  }, [id, fetchReviews]);

  useEffect(() => {
    fetchFavorites().catch?.(() => {});
  }, [fetchFavorites]);

  const isSaved = useMemo(
    () => (favorites ?? []).some((f) => String(f.freelancerID) === String(id)),
    [favorites, id],
  );

  const person = useMemo(() => {
    if (!freelancer) return null;
    return {
      name: freelancer.name || freelancer.username || 'Freelancer',
      title: freelancer.experienceLevel ? `${freelancer.experienceLevel} freelancer` : 'Freelancer',
      experienceLevel: freelancer.experienceLevel || '—',
      rating: freelancer.averageRating || 0,
      reviews: freelancer.reviewCount ?? 0,
      rate: freelancer.hourlyRate ? `$${freelancer.hourlyRate}/hr` : '—',
      skills: freelancer.skills?.length ? freelancer.skills : [],
    };
  }, [freelancer]);

  const reviewItems = (reviews.items ?? []).map((r, index) => ({
    id: r.reviewsID ?? index,
    reviewer: r.clientName || 'Client',
    rating: r.rating ?? 0,
    comment: r.comment || '',
    date: formatDate(r.created_at),
  }));

  const handleToggleSave = async () => {
    if (isSaved) await removeFavorite(id);
    else await addFavorite(id);
    fetchFavorites().catch?.(() => {});
  };

  if (isLoading && !person) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" aria-hidden="true" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Breadcrumbs items={[{ label: 'Find talent', to: '/freelancers' }, { label: 'Profile' }]} />
        <Card className="border-rose-200 bg-rose-50">
          <p className="font-semibold text-rose-700">Freelancer not found</p>
          <p className="mt-1 text-sm text-rose-600">This profile could not be loaded.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Find talent', to: '/freelancers' }, { label: person.name }]} />

      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={person.name} size="lg" className="h-16 w-16 text-lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{person.name}</h1>
                <BadgeCheck className="h-5 w-5 text-brand-600" aria-hidden="true" />
              </div>
              <p className="mt-0.5 text-sm text-slate-500">{person.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                <RatingStars rating={person.rating} size="sm" />
                <span className="text-slate-400">({person.reviews} {person.reviews === 1 ? 'review' : 'reviews'})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <p className="text-xl font-bold text-slate-900">{person.rate}</p>
            <Button
              as="button"
              type="button"
              variant={isSaved ? 'soft' : 'outline'}
              size="sm"
              icon={Bookmark}
              onClick={handleToggleSave}
              disabled={isToggling}
            >
              {isSaved ? 'Shortlisted' : 'Shortlist'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Skills">
            {person.skills.length === 0 ? (
              <p className="text-sm text-slate-500">No skills listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {person.skills.map((tag) => (
                  <Badge key={tag} tone="slate">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          <Card title={`Reviews (${person.reviews})`}>
            {reviewItems.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews yet.</p>
            ) : (
              <ul className="space-y-4">
                {reviewItems.map((review) => (
                  <li key={review.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">{review.reviewer}</span>
                      <span className="text-xs text-slate-400">{review.date}</span>
                    </div>
                    <RatingStars rating={review.rating} size="sm" showValue={false} className="mt-1" />
                    <p className="mt-1.5 text-sm text-slate-600">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Stats">
            <dl className="space-y-2 text-sm">
              {[
                ['Hourly rate', person.rate],
                ['Experience', person.experienceLevel],
                ['Avg. rating', person.rating > 0 ? `${Number(person.rating).toFixed(1)} ★` : '—'],
                ['Reviews', person.reviews],
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
