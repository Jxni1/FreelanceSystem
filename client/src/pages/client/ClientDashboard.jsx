import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingProposals: 0,
    activeContracts: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch projects to calculate stats
        const projectsResponse = await apiClient.get('/api/projects', {
          params: { page: 1, pageSize: 100 }
        });
        
        if (projectsResponse.data?.items) {
          const projects = projectsResponse.data.items;
          const activeContracts = projects.filter(p => p.status === 'Active').length;
          const totalSpent = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
          
          setStats(prev => ({
            ...prev,
            totalSpent,
            activeContracts,
            totalProjects: projects.length,
            pendingProposals: Math.floor(Math.random() * 12) + 2, // Placeholder
          }));
        }

        // Fetch user profile including photo
        try {
          const response = await apiClient.get('/api/users/profile');
          if (response.data?.profilePhoto) {
            setProfilePhoto(response.data.profilePhoto);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result;

        try {
          // Upload to backend
          const response = await apiClient.put('/api/users/profile-photo', {
            profilePhoto: base64Data,
          });

          if (response.status === 200) {
            setProfilePhoto(base64Data);
            console.log('Profile photo uploaded successfully');
          } else {
            alert('Failed to upload photo');
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('Error uploading photo: ' + (error.response?.data?.error || error.message));
        } finally {
          setUploadingPhoto(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Error processing image: ' + error.message);
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0e6d8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#d4c5b9] border-t-[#122C4F] rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-600 uppercase tracking-widest">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0e6d8]">
      {/* Navigation Bar */}
      <div className="bg-[#122C4F] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Freelance System</h1>
          <div className="flex items-center gap-6">
            <NavLink
              to="/client/post-job"
              className={({ isActive }) =>
                `px-4 py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-teal-500 text-white'
                    : 'hover:bg-[#0f1f38]'
                }`
              }
            >
              Post a New Job
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `px-4 py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-teal-500 text-white'
                    : 'hover:bg-[#0f1f38]'
                }`
              }
            >
              My Projects
            </NavLink>
            <NavLink
              to="/contracts"
              className={({ isActive }) =>
                `px-4 py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-teal-500 text-white'
                    : 'hover:bg-[#0f1f38]'
                }`
              }
            >
              Hire & Contracts
            </NavLink>
            <NavLink
              to="/client/billing"
              className={({ isActive }) =>
                `px-4 py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-teal-500 text-white'
                    : 'hover:bg-[#0f1f38]'
                }`
              }
            >
              Billing & Invoices
            </NavLink>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-[#f9f3eb] rounded-2xl shadow-sm p-8 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-2">Hi Client</h2>
            <p className="text-slate-600">Welcome to your workspace</p>
          </div>
          <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 border-4 border-[#f0e6d8] shadow flex items-center justify-center overflow-hidden group-hover:opacity-75 transition-opacity">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white select-none">C</span>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            {uploadingPhoto && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
            disabled={uploadingPhoto}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/client/post-job')}
            className="bg-[#f0e6d8] text-slate-900 p-6 rounded-lg shadow-sm border border-[#e5d7c8] hover:shadow-md transition-shadow text-center font-semibold hover:bg-[#ebe0d5]"
          >
            📝 Post a New Job
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="bg-[#f0e6d8] text-slate-900 p-6 rounded-lg shadow-sm border border-[#e5d7c8] hover:shadow-md transition-shadow text-center font-semibold hover:bg-[#ebe0d5]"
          >
            📋 My Projects
          </button>
          <button
            onClick={() => navigate('/contracts')}
            className="bg-[#f0e6d8] text-slate-900 p-6 rounded-lg shadow-sm border border-[#e5d7c8] hover:shadow-md transition-shadow text-center font-semibold hover:bg-[#ebe0d5]"
          >
            🤝 Hire & Contracts
          </button>
          <button
            onClick={() => navigate('/client/billing')}
            className="bg-[#f0e6d8] text-slate-900 p-6 rounded-lg shadow-sm border border-[#e5d7c8] hover:shadow-md transition-shadow text-center font-semibold hover:bg-[#ebe0d5]"
          >
            💳 Billing & Invoices
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#f9f3eb] p-6 rounded-lg shadow-sm border border-[#f0e6d8] hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-slate-600 uppercase tracking-widest mb-4">
              Total Spent
            </div>
            <div className="text-3xl font-bold text-slate-900">
              ${stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-2">Across all projects</p>
          </div>

          <div className="bg-[#f9f3eb] p-6 rounded-lg shadow-sm border border-[#f0e6d8] hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-slate-600 uppercase tracking-widest mb-4">
              Pending Proposals
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.pendingProposals}</div>
            <p className="text-xs text-slate-500 mt-2">Awaiting your review</p>
          </div>

          <div className="bg-[#f9f3eb] p-6 rounded-lg shadow-sm border border-[#f0e6d8] hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-slate-600 uppercase tracking-widest mb-4">
              Active Contracts
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.activeContracts}</div>
            <p className="text-xs text-slate-500 mt-2">Currently in progress</p>
          </div>

          <div className="bg-[#f9f3eb] p-6 rounded-lg shadow-sm border border-[#f0e6d8] hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-slate-600 uppercase tracking-widest mb-4">
              Total Projects
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalProjects}</div>
            <p className="text-xs text-slate-500 mt-2">Lifetime total</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#f9f3eb] rounded-lg shadow-sm p-8 border border-[#f0e6d8] mb-12">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="p-4 bg-[#f0e6d8] hover:bg-[#ebe0d5] rounded-lg text-left transition-colors border border-[#e5d7c8]"
            >
              <div className="font-semibold text-slate-900 mb-1">👤 Update Profile</div>
              <p className="text-sm text-slate-600">Edit your profile information</p>
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="p-4 bg-[#f0e6d8] hover:bg-[#ebe0d5] rounded-lg text-left transition-colors border border-[#e5d7c8]"
            >
              <div className="font-semibold text-slate-900 mb-1">📊 View Analytics</div>
              <p className="text-sm text-slate-600">Track project performance</p>
            </button>
            <button
              onClick={() => navigate('/contracts')}
              className="p-4 bg-[#f0e6d8] hover:bg-[#ebe0d5] rounded-lg text-left transition-colors border border-[#e5d7c8]"
            >
              <div className="font-semibold text-slate-900 mb-1">📄 Manage Contracts</div>
              <p className="text-sm text-slate-600">Review active agreements</p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-[#e5d7c8] flex justify-between items-center">
          <p className="text-sm text-slate-600">Welcome back, {user?.email}!</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
