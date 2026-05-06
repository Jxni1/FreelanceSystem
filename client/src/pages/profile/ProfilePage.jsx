import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const res = await apiClient.get('/api/users/me');
      const data = res.data?.value ?? res.data;
      setProfile(data);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Error loading profile.';
      setLoadError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 min-h-[50vh]">
        <div
          className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-10">
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg text-rose-700">
          <p className="font-semibold">Error loading profile</p>
          <p className="text-sm mt-1">{loadError}</p>
          <button
            onClick={loadProfile}
            className="mt-3 text-sm font-medium underline text-rose-800 hover:text-rose-900"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-10 text-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Profile</h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadProfile}
            className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors bg-teal-50 px-4 py-2 rounded-lg"
          >
            Refresh Data
          </button>

          <button
            type="button"
            onClick={() => navigate('/profile/edit')}
            className="text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            Edit Profile
          </button>

          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 sm:p-8 flex items-start gap-6">
          <div className="hidden sm:flex items-center justify-center w-20 h-20 bg-teal-100 text-teal-700 rounded-full text-2xl font-bold shrink-0">
            {profile?.name?.[0]}
            {profile?.surname?.[0]}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">
              {profile.name} {profile.surname}
            </h2>
            <p className="text-slate-500 font-medium">@{profile.username}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {profile.roles?.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {role}
                </span>
              ))}
            </div>

            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold w-20 inline-block text-slate-500">
                  Email:
                </span>{' '}
                {profile.email}
              </p>
              <p>
                <span className="font-semibold w-20 inline-block text-slate-500">
                  User ID:
                </span>{' '}
                <span className="font-mono text-xs">{profile.userId}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {profile.clientProfile && (
        <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="border-b border-slate-100 bg-slate-50 p-6">
            <h3 className="text-lg font-bold text-teal-700">Client Details</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Industry
              </p>
              <p className="text-slate-900 font-medium">{profile.clientProfile.industry}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Average Budget
              </p>
              <p className="text-slate-900 font-medium">
                $
                {profile.clientProfile.budget.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Bio / Description
              </p>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {profile.clientProfile.bio}
              </p>
            </div>
          </div>
        </div>
      )}

      {profile.freelancerProfile && (
        <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="border-b border-slate-100 bg-slate-50 p-6">
            <h3 className="text-lg font-bold text-teal-700">Freelancer Details</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Experience Level
                </p>
                <p className="text-slate-900 font-medium">
                  {profile.freelancerProfile.experienceLevel}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Hourly Rate
                </p>
                <p className="text-slate-900 font-medium">
                  ${profile.freelancerProfile.hourlyRate.toFixed(2)} / hr
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}