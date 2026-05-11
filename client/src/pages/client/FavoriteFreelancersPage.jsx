import { useEffect } from 'react';
import { useFavoriteFreelancers } from '../../hooks/useFavoriteFreelancers';


function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-xs ${
            i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-300'
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-slate-500">
        {rating > 0 ? rating.toFixed(1) : 'No reviews'}
      </span>
    </span>
  );
}

export default function FavoriteFreelancersPage() {
  const {
    favorites,
    isLoading,
    isToggling,
    error,
    fetchFavorites,
    removeFavorite,
  } = useFavoriteFreelancers();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Favorite Freelancers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Freelancers you saved for future projects.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {!isLoading && favorites.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg font-medium">No favorite freelancers yet</p>
          <p className="text-sm mt-1">
            Save freelancers from the freelancers page to see them here.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((f) => (
          <div
            key={f.favoriteFreelancerID || f.freelancerID}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 text-lg font-semibold">
                {f.name?.[0] ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{f.name}</p>
                <p className="text-xs text-slate-500">@{f.username}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                {f.experienceLevel}
              </span>
              <span className="text-teal-600 font-semibold">
                ${f.hourlyRate}/hr
              </span>
            </div>

            <StarRating rating={f.averageRating} />

            {f.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {f.skills.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 border border-teal-100 text-teal-700"
                  >
                    {s}
                  </span>
                ))}
                {f.skills.length > 5 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-400">
                    +{f.skills.length - 5}
                  </span>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isToggling}
                onClick={() => removeFavorite(f.freelancerID)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
              >
                <span aria-hidden>♥</span>
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}