import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/apiClient';
import { useAuthorization } from '../../hooks/useAuthorization';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { isFreelancer } = useAuthorization();

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

  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [skillsSearch, setSkillsSearch] = useState('');
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [skillsMessage, setSkillsMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        const res = await apiClient.get('/api/users/me');
        const data = res.data?.value ?? res.data;

        setForm({
          name: data?.name || '',
          surname: data?.surname || '',
          username: data?.username || '',
          email: data?.email || '',
          profilePhoto: data?.profilePhoto || '',
        });

        if (isFreelancer) {
          const currentSkillNames = data?.freelancerProfile?.skills ?? [];
          const [skillsRes] = await Promise.all([
            apiClient.get('/api/skills?pageSize=100'),
          ]);
          const skills = skillsRes.data?.items ?? skillsRes.data ?? [];
          setAllSkills(skills);
          const matchedIds = skills
            .filter(s => currentSkillNames.includes(s.name))
            .map(s => s.skillsID);
          setSelectedSkillIds(matchedIds);
        }
      } catch (err) {
        setFormError(err?.response?.data?.message || 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isFreelancer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    try {
      await apiClient.put('/api/users/me', {
        name: form.name.trim(),
        surname: form.surname.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        profilePhoto: form.profilePhoto.trim() || null,
      });
      navigate('/profile');
    } catch (err) {
      const raw = err?.response?.data;
      setFormError(
        raw?.error || raw?.message || raw?.title ||
        (typeof raw === 'string' ? raw : 'Failed to update profile.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkill = (id) => {
    setSelectedSkillIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSaveSkills = async () => {
    setIsSavingSkills(true);
    setSkillsMessage(null);
    try {
      await apiClient.put('/api/users/me/skills', { skillIds: selectedSkillIds });
      setSkillsMessage({ type: 'success', text: 'Skills updated.' });
    } catch (err) {
      const raw = err?.response?.data;
      setSkillsMessage({
        type: 'error',
        text: raw?.message || (typeof raw === 'string' ? raw : 'Failed to save skills.'),
      });
    } finally {
      setIsSavingSkills(false);
    }
  };

  const filteredSkills = allSkills.filter(s =>
    s.name.toLowerCase().includes(skillsSearch.toLowerCase())
  );

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
    <div className="max-w-2xl mx-auto p-6 lg:p-10 text-slate-100 space-y-6">
      {/* Profile info card */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
        <div className="p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Edit Profile</h1>
          <p className="text-slate-500 mb-8 text-sm">Update your personal account information.</p>

          {formError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input type="text" name="surname" value={form.surname} onChange={handleChange} className={inputClass} required />
              </div>
            </div>

            <div>
              <label className={labelClass}>Username</label>
              <input type="text" name="username" value={form.username} onChange={handleChange} className={inputClass} required />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} required />
            </div>

            <div>
              <label className={labelClass}>Profile Photo URL</label>
              <input type="text" name="profilePhoto" value={form.profilePhoto} onChange={handleChange} className={inputClass} placeholder="Optional" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => navigate('/profile')} className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white disabled:bg-teal-300">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Skills card — freelancers only */}
      {isFreelancer && (
        <div className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-400" />
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">My Skills</h2>
            <p className="text-slate-500 text-sm mb-6">
              Select the skills that match your expertise. These are used to match you with relevant projects.
            </p>

            {skillsMessage && (
              <div className={`mb-4 p-3 rounded-xl text-sm border ${
                skillsMessage.type === 'success'
                  ? 'bg-teal-50 border-teal-200 text-teal-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {skillsMessage.text}
              </div>
            )}

            <input
              type="text"
              placeholder="Search skills..."
              value={skillsSearch}
              onChange={e => setSkillsSearch(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
            />

            {allSkills.length === 0 ? (
              <p className="text-slate-400 text-sm">No skills available yet. Ask an admin to add skills to the platform.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {filteredSkills.map(skill => {
                  const selected = selectedSkillIds.includes(skill.skillsID);
                  return (
                    <button
                      key={skill.skillsID}
                      type="button"
                      onClick={() => toggleSkill(skill.skillsID)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        selected
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-purple-400 hover:text-purple-600'
                      }`}
                    >
                      {selected ? '✓ ' : ''}{skill.name}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">
                {selectedSkillIds.length} skill{selectedSkillIds.length !== 1 ? 's' : ''} selected
              </span>
              <button
                type="button"
                onClick={handleSaveSkills}
                disabled={isSavingSkills}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-semibold text-white disabled:bg-purple-300 transition-colors"
              >
                {isSavingSkills ? 'Saving...' : 'Save Skills'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
