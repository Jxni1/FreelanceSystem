import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { SmartBackButton } from '../../components/SmartBackButton';
import { apiClient } from '../../lib/apiClient';

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

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
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

  useEffect(() => {
    async function loadProjects() {
      setProjectsLoading(true);
      try {
        const res = await apiClient.get('/api/projects');
        const payload = res.data?.items ?? res.data?.value?.items ?? res.data?.value ?? res.data ?? [];
        setProjects(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setProjectsLoading(false);
      }
    }

    loadProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
        <p>Loading contract...</p>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent';
  const labelClass =
    'block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1.5';

  return (
    <div className="max-w-3xl mx-auto text-slate-900 space-y-6">
      <SmartBackButton
        fallbackTo={isEditMode ? `/admin/contracts/${id}` : '/admin/contracts'}
        label={isEditMode ? 'Back to Contract' : 'Back to Contracts'}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-linear-to-r from-teal-500 to-emerald-400" />

        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Edit Contract' : 'Create New Contract'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isEditMode
              ? 'Update the contract details below.'
              : 'Fill in the details to create a new contract.'}
          </p>
        </div>

        <div className="p-6 md:p-8">
          {formError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className={`${inputClass} resize-y`}
                placeholder="Enter contract description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  <label className={labelClass}>Project</label>
                  <select
                    name="projectID"
                    value={formData.projectID}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    disabled={projectsLoading}
                  >
                    <option value="">
                      {projectsLoading ? 'Loading projects...' : 'Select project'}
                    </option>
                    {projects.map((project) => (
                      <option
                        key={project.projectID ?? project.projectId ?? project.id}
                        value={project.projectID ?? project.projectId ?? project.id}
                      >
                        {project.title ??
                          project.name ??
                          `Project ${project.projectID ?? project.projectId ?? project.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting
                  ? isEditMode
                    ? 'Saving...'
                    : 'Creating...'
                  : isEditMode
                  ? 'Save Changes'
                  : 'Create Contract'}
              </button>
              <Link
                to={isEditMode ? `/admin/contracts/${id}` : '/admin/contracts'}
                className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold text-center transition-colors"
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
