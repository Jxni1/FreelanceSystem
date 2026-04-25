import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { SmartBackButton } from '../../components/SmartBackButton';

export default function ContractFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { contract, isLoading, fetchContractById, createContract, updateContract } = useContracts();

  const [formData, setFormData] = useState({
    description: '',
    start_Date: '',
    end_Date: '',
    price: '',
    agreed_Price: '',
    status: 'Pending',
    freelancerID: '',
    projectID: '',
  });

  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) fetchContractById(id);
  }, [id, isEditMode, fetchContractById]);

 useEffect(() => {
  if (isEditMode && contract) {
    setFormData({
      description: contract.description || '',
      start_Date: contract.start_Date?.split('T')[0] || '',
      end_Date: contract.end_Date?.split('T')[0] || '',
      price: contract.price || '',
      agreed_Price: contract.agreed_Price || '',
      status: contract.status || 'Pending',
      freelancerID: contract.freelancerID || '',
      projectID: contract.projectID || '',
    });
  }
}, [contract, isEditMode]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        agreed_Price: parseFloat(formData.agreed_Price),
      };

      if (isEditMode) {
        await updateContract(id, payload);
        navigate(`/admin/contracts/${id}`);
      } else {
        const created = await createContract(payload);
        navigate(`/admin/contracts/${created.contractID}`);
      }
    } catch (err) {
      setFormError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="p-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500">Loading contract...</p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="p-8 max-w-3xl mx-auto text-slate-100">
      <SmartBackButton
        fallbackTo={isEditMode ? `/admin/contracts/${id}` : '/admin/contracts'}
        label={isEditMode ? 'Back to Contract' : 'Back to Contracts'}
      />

      <div className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-4 bg-gradient-to-r from-purple-500 to-indigo-400" />

        <div className="p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            {isEditMode ? 'Edit Contract' : 'Create New Contract'}
          </h1>
          <p className="text-slate-500 mb-8 text-sm">
            {isEditMode ? 'Update the contract details below.' : 'Fill in the details to create a new contract.'}
          </p>

          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className={inputClass}
                placeholder="Enter contract description..."
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Start Date</label>
                <input
                  type="date"
                  name="start_Date"
                  value={formData.start_Date}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input
                  type="date"
                  name="end_Date"
                  value={formData.end_Date}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}>Agreed Price</label>
                <input
                  type="number"
                  name="agreed_Price"
                  value={formData.agreed_Price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Status - only in edit mode */}
            {isEditMode && (
              <div>
                <label className={labelClass}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            )}

            {/* IDs - only in create mode */}
            {!isEditMode && (
              <>
                <div>
                  <label className={labelClass}>Freelancer ID</label>
                  <input
                    type="text"
                    name="freelancerID"
                    value={formData.freelancerID}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Enter freelancer UUID..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Project ID</label>
                  <input
                    type="text"
                    name="projectID"
                    value={formData.projectID}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Enter project UUID..."
                  />
                </div>
              </>
            )}

            {/* Submit */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold rounded-xl transition-colors"
              >
                {isSubmitting
                  ? (isEditMode ? 'Saving...' : 'Creating...')
                  : (isEditMode ? 'Save Changes' : 'Create Contract')}
              </button>
              <Link
                to={isEditMode ? `/admin/contracts/${id}` : '/admin/contracts'}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
