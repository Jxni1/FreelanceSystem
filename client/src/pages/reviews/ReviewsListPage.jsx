import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { useAuthorization } from '../../hooks/useAuthorization';

export default function ReviewsListPage() {
  const { reviews, isLoading, error, fetchReviews, deleteReview } = useReviews();
  const { user } = useAuth();
  const { isClient } = useAuthorization();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReviews({ page });
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      fetchReviews({ page });
    } catch {}
  };

  if (isLoading && reviews.items.length === 0)
    return <div className="p-8 text-center text-slate-500">Loading reviews...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isClient ? 'My Reviews' : 'Reviews for Me'}
        </h1>
        {isClient && (
          <Link
            to="/reviews/new"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
          >
            + New Review
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {reviews.items.length === 0 && !isLoading ? (
        <div className="text-center py-16 text-slate-400">No reviews found.</div>
      ) : (
        <div className="space-y-4">
          {reviews.items.map((r) => (
            <div key={r.reviewsID} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">{r.freelancerName}</span>
                    <span className="text-slate-400 text-sm">by {r.clientName}</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < r.rating ? 'text-amber-400' : 'text-slate-200'}>★</span>
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm">{r.comment}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                {isClient && (
                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`/reviews/${r.reviewsID}/edit`}
                      className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(r.reviewsID)}
                      className="px-3 py-1.5 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
 
      {reviews.totalCount > reviews.pageSize && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-600">Page {page}</span>
          <button
            disabled={page * reviews.pageSize >= reviews.totalCount}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}