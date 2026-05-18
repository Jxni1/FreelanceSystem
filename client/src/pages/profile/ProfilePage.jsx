import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [tempPhotoPreview, setTempPhotoPreview] = useState('');
  const [photoInputKey, setPhotoInputKey] = useState(Date.now());
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const API_BASE_URL = 'https://localhost:7244';

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const res = await apiClient.get('/api/users/me');
      const data = res.data?.value ?? res.data?.data ?? res.data;
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

  useEffect(() => {
    if (!selectedPhotoFile) {
      setTempPhotoPreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedPhotoFile);
    setTempPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPhotoFile]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setSelectedPhotoFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }

    setUploadError(null);
    setUploadSuccess(false);
    setSelectedPhotoFile(file);
  };

  const handleRemoveSelectedPhoto = () => {
    setSelectedPhotoFile(null);
    setTempPhotoPreview('');
    setPhotoInputKey(Date.now());
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhotoFile) {
      setUploadError('Please choose an image first.');
      return;
    }

    try {
      setUploadError(null);
      setUploadSuccess(false);
      setIsUploadingPhoto(true);

      const meRes = await apiClient.get('/api/users/me');
      const me = meRes.data?.value ?? meRes.data?.data ?? meRes.data;

      const userId = me?.userId || me?.userID || me?.id;
      if (!userId) {
        setUploadError('Could not determine current user ID.');
        return;
      }

      const formData = new FormData();
      formData.append('Entity', 'User');
      formData.append('EntityID', userId);
      formData.append('File', selectedPhotoFile);

      const uploadRes = await apiClient.post('/api/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploaded = uploadRes.data?.data ?? uploadRes.data;
      const uploadedPath =
        uploaded?.file_Path ||
        uploaded?.filePath ||
        uploaded?.path ||
        uploaded?.url;

      if (!uploadedPath) {
        setUploadError('Upload succeeded but no file path was returned.');
        return;
      }

      // Save the profile photo path to the database
      await apiClient.put('/api/users/me', {
        name: profile.name.trim(),
        surname: profile.surname.trim(),
        username: profile.username.trim(),
        email: profile.email.trim(),
        profilePhoto: uploadedPath,
      });

      // Update profile with new photo path
      setProfile((prev) => ({
        ...prev,
        profilePhoto: uploadedPath,
      }));

      setSelectedPhotoFile(null);
      setTempPhotoPreview('');
      setPhotoInputKey(Date.now());
      setUploadSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      const raw = err?.response?.data;
      setUploadError(
        raw?.error ||
          raw?.message ||
          raw?.title ||
          (typeof raw === 'string' ? raw : 'Failed to upload profile photo.')
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const profilePhotoUrl = useMemo(() => {
    // Show temp preview first if available
    if (tempPhotoPreview) return tempPhotoPreview;

    if (!profile?.profilePhoto) return '';
    if (profile.profilePhoto.startsWith('http')) return profile.profilePhoto;
    return `${API_BASE_URL}/${profile.profilePhoto.replace(/^\/+/, '')}`;
  }, [profile, tempPhotoPreview]);

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
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
          <div className="shrink-0 w-full sm:w-auto">
            {/* Profile Photo with Upload Overlay */}
            <div className="relative inline-block group">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={`${profile.name} ${profile.surname}`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-300 group-hover:border-teal-400 transition-colors"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold border-2 border-slate-300 group-hover:border-teal-400 transition-colors">
                  {profile?.name?.[0]}
                  {profile?.surname?.[0]}
                </div>
              )}

              {/* Upload Overlay */}
              <input
                id="profile-photo-upload"
                key={photoInputKey}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <label
                htmlFor="profile-photo-upload"
                className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="text-white text-1xl opacity-0 group-hover:opacity-80 transition-opacity">
                  Add photo
                </span>
              </label>
            </div>

            {/* Upload Status Messages */}
            {uploadError && (
              <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 font-medium">
                ✓ Photo updated!
              </div>
            )}

            {/* Upload Controls - shown when file selected */}
            {selectedPhotoFile && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 space-y-2">
                <p className="text-xs font-medium text-amber-800">Selected: {selectedPhotoFile.name}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="flex-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:bg-emerald-300 transition-colors"
                  >
                    {isUploadingPhoto ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveSelectedPhoto}
                    className="flex-1 px-2 py-1 rounded border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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
              <p className="text-slate-900 font-medium">
                {profile.clientProfile.industry}
              </p>
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