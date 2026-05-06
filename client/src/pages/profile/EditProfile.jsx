import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/apiClient';

export default function EditProfilePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    profilePhoto: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setFormError(null);

        const res = await apiClient.get('/api/users/me');
        const data = res.data?.value ?? res.data;

        setForm({
          name: data?.name || '',
          surname: data?.surname || '',
          username: data?.username || '',
          email: data?.email || '',
          profilePhoto: data?.profilePhoto || '',
        });
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Failed to load profile.';
        setFormError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        surname: form.surname.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        profilePhoto: form.profilePhoto.trim() || null,
      };

      await apiClient.put('/api/users/me', payload);
      navigate('/profile');
    } catch (err) {
      console.log('edit profile error', err?.response?.status, err?.response?.data);

      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Failed to update profile.';

      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500';

  const labelClass =
    'block text-[11px] font-semibold text-slate-400 uppercase mb-1.5';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-10 text-slate-100">
      <div className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />

        <div className="p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Edit Profile
          </h1>
          <p className="text-slate-500 mb-8 text-sm">
            Update your personal account information.
          </p>

          {formError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  name="surname"
                  value={form.surname}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Profile Photo URL</label>
              <input
                type="text"
                name="profilePhoto"
                value={form.profilePhoto}
                onChange={handleChange}
                className={inputClass}
                placeholder="Optional"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white disabled:bg-teal-300"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}