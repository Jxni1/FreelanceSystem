import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Star, Bookmark, Search, UserSearch } from 'lucide-react';
import { useFreelancers } from '../../hooks/useFreelancers';
import { useFavoriteFreelancers } from '../../hooks/useFavoriteFreelancers';
import { PageHeading } from '../../components/ui/PageHeading';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';

const EXPERIENCE_LEVELS = ['Entry', 'Intermediate', 'Expert'];

function TalentCard({ person, isSaved, onToggleSave, saving }) {
  return (
    <Card bodyClassName="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={person.name} size="lg" />
          <div className="min-w-0">
            <Link to={`/freelancers/${person.id}`} className="block truncate font-semibold text-slate-900 hover:text-brand-700">
              {person.name}
            </Link>
            <p className="text-xs text-slate-500">{person.title}</p>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="font-medium text-slate-700">{person.rating > 0 ? person.rating.toFixed(1) : '—'}</span>
              <span className="text-slate-400">({person.reviews})</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold text-slate-900">{person.rate}</p>
        </div>
      </div>

      {person.skills.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {person.skills.map((tag) => (
            <Badge key={tag} tone="slate">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onToggleSave(person.id)}
          disabled={saving}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
            isSaved
              ? 'border-brand-200 bg-brand-50 text-brand-600'
              : 'border-line bg-white text-slate-400 hover:bg-slate-50 hover:text-brand-600'
          }`}
          aria-label={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
          aria-pressed={isSaved}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
        </button>
        <Button to={`/freelancers/${person.id}`} variant="outline" size="sm">
          View profile
        </Button>
      </div>
    </Card>
  );
}

export default function FreelancersPage() {
  const { freelancers, isLoading, fetchFreelancers } = useFreelancers();
  const { favorites, fetchFavorites, addFavorite, removeFavorite, isToggling } = useFavoriteFreelancers();
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [level, setLevel] = useState('');

  useEffect(() => {
    fetchFreelancers({
      page: 1,
      pageSize: 24,
      search: activeSearch || undefined,
      experienceLevel: level || undefined,
    });
  }, [fetchFreelancers, activeSearch, level]);

  useEffect(() => {
    fetchFavorites().catch?.(() => {});
  }, [fetchFavorites]);

  const savedIds = useMemo(
    () => new Set((favorites ?? []).map((f) => String(f.freelancerID))),
    [favorites],
  );

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveSearch(search.trim());
  };

  const handleToggleSave = async (freelancerId) => {
    if (savedIds.has(String(freelancerId))) await removeFavorite(freelancerId);
    else await addFavorite(freelancerId);
    fetchFavorites().catch?.(() => {});
  };

  const people = useMemo(
    () =>
      (freelancers.items ?? []).map((freelancer) => ({
        id: freelancer.freelancerID,
        name: freelancer.name || freelancer.username || 'Freelancer',
        title: freelancer.experienceLevel ? `${freelancer.experienceLevel} freelancer` : 'Freelancer',
        rating: freelancer.averageRating || 0,
        reviews: freelancer.reviewCount ?? 0,
        rate: freelancer.hourlyRate ? `$${freelancer.hourlyRate}/hr` : '—',
        skills: (freelancer.skills ?? []).slice(0, 4),
      })),
    [freelancers],
  );

  const total = freelancers.totalCount || 0;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Find talent"
        subtitle={`${total.toLocaleString()} ${total === 1 ? 'freelancer' : 'freelancers'} available`}
        actions={
          <>
            <Button to="/favorite-freelancers" variant="outline" icon={Users}>
              My shortlists
            </Button>
            <Button to="/projects/new" icon={Plus}>
              Post a job
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or username..."
            className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </form>
        <select
          value={level}
          onChange={(event) => setLevel(event.target.value)}
          className="h-10 rounded-xl border border-line bg-white px-3.5 text-sm text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          <option value="">All experience</option>
          {EXPERIENCE_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
        </div>
      ) : people.length === 0 ? (
        <Card bodyClassName="p-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <UserSearch className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="font-semibold text-slate-900">No freelancers found</p>
            <p className="text-sm text-slate-500">Try a different search or experience level.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {people.map((person) => (
            <TalentCard
              key={person.id}
              person={person}
              isSaved={savedIds.has(String(person.id))}
              onToggleSave={handleToggleSave}
              saving={isToggling}
            />
          ))}
        </div>
      )}
    </div>
  );
}
