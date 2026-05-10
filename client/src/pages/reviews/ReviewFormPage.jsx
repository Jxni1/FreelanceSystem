import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useReviews } from '../../hooks/useReviews';
import { contractService } from '../../lib/contractService';

export default function ReviewFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { review, isLoading, error, fetchReviewById, createReview, updateReview } = useReviews();

  const [formData, setFormData] = useState({ contractId: '', comment: '', rating: 5 });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedContracts, setCompletedContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && id) fetchReviewById(id);
  }, [id, isEditMode]);

  useEffect(() => {
    if (isEditMode && review) {
      setFormData({ contractId: review.contractID, comment: review.comment, rating: review.rating });
    }
  }, [isEditMode, review]);

  useEffect(() => {
    if (!isEditMode) {
      setContractsLoading(true);
      contractService.getAll({ status: 'Completed', pageSize: 100 })
        .then(data => setCompletedContracts(data?.items ?? []))
        .catch(() => setCompletedContracts([]))
        .finally(() => setContractsLoading(false));
    }
  }, [isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (isEditMode) {
        await updateReview(id, { comment: formData.comment, rating: formData.rating });
      } else {
        await createReview({ contractID: formData.contractId, comment: formData.comment, rating: formData.rating });
      }
      navigate('/reviews');
    } catch (err) {
      setFormError(err?.response?.data?.error || err?.response?.data || 'Failed to save review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isLoading)
    return <div className="p-8 text-center text-slate-500">Loading review...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link to="/reviews" className="inline-block mb-6 text-slate-500 hover:text-teal-600 font-medium transition-colors">
        &larr; Back to Reviews
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {isEditMode ? 'Edit Review' : 'Leave a Review'}
        </h1>

        {(error || formError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {typeof (error || formError) === 'string' ? (error || formError) : 'An error occurred.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isEditMode && (
            <div>
              <label htmlFor="contractId" className="block text-sm font-semibold text-slate-900 mb-2">
                Completed Contract <span className="text-red-600">*</span>
              </label>
              {contractsLoading ? (
                <p className="text-sm text-slate-500">Loading your completed contracts...</p>
              ) : completedContracts.length === 0 ? (
                <p className="text-sm text-red-500">No completed contracts found. Reviews can only be submitted for completed contracts.</p>
              ) : (
                <select
                  id="contractId"
                  name="contractId"
                  value={formData.contractId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  required
                >
                  <option value="">Select a contract...</option>
                  {completedContracts.map(c => (
                    <option key={c.contractID} value={c.contractID}>
                      {c.freelancerName} — {c.description?.slice(0, 50) || c.contractID}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label htmlFor="rating" className="block text-sm font-semibold text-slate-900 mb-2">
              Rating <span className="text-red-600">*</span>
            </label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              required
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-semibold text-slate-900 mb-2">
              Comment <span className="text-red-600">*</span>
            </label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={5}
              maxLength={2000}
              placeholder="Share your experience working with this freelancer..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow resize-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1">{formData.comment.length}/2000 characters</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || (!isEditMode && completedContracts.length === 0)}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-all"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Review' : 'Submit Review'}
            </button>
            <Link
              to="/reviews"
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}