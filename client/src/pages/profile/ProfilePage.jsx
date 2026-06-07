import { useEffect, useState, useMemo } from 'react';
import { RefreshCw, Pencil, LogOut, Camera } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { PageHeading } from '../../components/ui/PageHeading';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';

const API_BASE_URL = 'https://localhost:7244';

export default function ProfilePage() {
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [tempPhotoPreview, setTempPhotoPreview] = useState('');
  const [photoInputKey, setPhotoInputKey] = useState(Date.now());
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = await apiClient.get('/api/users/me');
      setProfile(res.data?.value ?? res.data?.data ?? res.data);
    } catch (err) {
      setLoadError(err?.response?.data?.error || err?.response?.data?.message || 'Error loading profile.');
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
      return undefined;
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
      const uploadedPath = uploaded?.file_Path || uploaded?.filePath || uploaded?.path || uploaded?.url;
      if (!uploadedPath) {
        setUploadError('Upload succeeded but no file path was returned.');
        return;
      }

      await apiClient.put('/api/users/me', {
        name: (profile.name || '').trim(),
        surname: (profile.surname || '').trim(),
        username: (profile.username || '').trim(),
        email: (profile.email || '').trim(),
        profilePhoto: uploadedPath,
      });

      setProfile((prev) => ({ ...prev, profilePhoto: uploadedPath }));
      setSelectedPhotoFile(null);
      setTempPhotoPreview('');
      setPhotoInputKey(Date.now());
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      const raw = err?.response?.data;
      setUploadError(raw?.error || raw?.message || raw?.title || (typeof raw === 'string' ? raw : 'Failed to upload profile photo.'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const profilePhotoUrl = useMemo(() => {
    if (tempPhotoPreview) return tempPhotoPreview;
    if (!profile?.profilePhoto) return '';
    if (profile.profilePhoto.startsWith('http')) return profile.profilePhoto;
    return `${API_BASE_URL}/${profile.profilePhoto.replace(/^\/+/, '')}`;
  }, [profile, tempPhotoPreview]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" aria-hidden="true" />
      </div>
    );
  }

  if (loadError) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <p className="font-semibold text-rose-700">Error loading profile</p>
        <p className="mt-1 text-sm text-rose-600">{loadError}</p>
        <Button as="button" type="button" variant="outline" size="sm" className="mt-3" onClick={loadProfile}>
          Try again
        </Button>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeading
        title="Profile"
        actions={
          <>
            <Button as="button" type="button" variant="outline" icon={RefreshCw} onClick={loadProfile}>
              Refresh
            </Button>
            <Button to="/profile/edit" icon={Pencil}>
              Edit profile
            </Button>
            <Button as="button" type="button" variant="outline" icon={LogOut} onClick={logout}>
              Sign out
            </Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <div className="shrink-0">
            <div className="group relative inline-block">
              <Avatar name={`${profile.name ?? ''} ${profile.surname ?? ''}`} src={profilePhotoUrl || undefined} size="lg" className="h-20 w-20 text-2xl" />
              <input id="profile-photo-upload" key={photoInputKey} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handlePhotoSelect} className="hidden" />
              <label htmlFor="profile-photo-upload" className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-slate-900/0 transition-colors group-hover:bg-slate-900/50">
                <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-90" aria-hidden="true" />
              </label>
            </div>

            {uploadError ? <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{uploadError}</p> : null}
            {uploadSuccess ? <p className="mt-3 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">Photo updated</p> : null}
            {selectedPhotoFile ? (
              <div className="mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs font-medium text-amber-800">Selected: {selectedPhotoFile.name}</p>
                <div className="flex gap-2">
                  <Button as="button" type="button" size="sm" onClick={handlePhotoUpload} disabled={isUploadingPhoto}>
                    {isUploadingPhoto ? 'Uploading…' : 'Upload'}
                  </Button>
                  <Button as="button" type="button" size="sm" variant="outline" onClick={handleRemoveSelectedPhoto}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900">{profile.name} {profile.surname}</h2>
            <p className="font-medium text-slate-500">@{profile.username}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.roles?.map((role) => (
                <Badge key={role} tone="brand">{role}</Badge>
              ))}
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 font-medium text-slate-500">Email</dt>
                <dd className="text-slate-700">{profile.email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 font-medium text-slate-500">User ID</dt>
                <dd className="font-mono text-xs text-slate-500">{profile.userId}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      {profile.clientProfile ? (
        <Card title="Client details">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500">Industry</p>
              <p className="mt-0.5 font-medium text-slate-900">{profile.clientProfile.industry || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Average budget</p>
              <p className="mt-0.5 font-medium text-slate-900">${Number(profile.clientProfile.budget || 0).toLocaleString()}</p>
            </div>
          </div>
          {profile.clientProfile.bio ? (
            <div className="mt-5">
              <p className="text-xs font-medium text-slate-500">Bio</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{profile.clientProfile.bio}</p>
            </div>
          ) : null}
        </Card>
      ) : null}

      {profile.freelancerProfile ? (
        <Card title="Freelancer details">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500">Experience level</p>
              <p className="mt-0.5 font-medium text-slate-900">{profile.freelancerProfile.experienceLevel || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Hourly rate</p>
              <p className="mt-0.5 font-medium text-slate-900">${Number(profile.freelancerProfile.hourlyRate || 0).toFixed(2)} / hr</p>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
