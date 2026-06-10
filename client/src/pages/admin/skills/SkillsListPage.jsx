import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSkills } from '../../../hooks/useSkills';
import SkillSearchFilter from '../../../components/SearchFilters/SkillSearchFilter';

export default function SkillsListPage() {
  const { skills, isLoading, error, fetchSkills, deleteSkill } = useSkills();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchSkills({
      page,
      pageSize: 10,
      ...filters,
    });
  }, [page, filters, fetchSkills]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await deleteSkill(id);
      fetchSkills({ page, pageSize: 10, ...filters });
    } catch {
      alert('Failed to delete skill. Please try again.');
    }
  };

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    setPage(1);
  };

  if (isLoading && skills.items.length === 0)
    return <div className="p-8 text-center text-slate-500">Loading skills...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Skills</h1>
        <Link
          to="/admin/skills/new"
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
        >
          + New Skill
        </Link>
      </div>

      {/* ADD SKILL SEARCH FILTER HERE */}
      <SkillSearchFilter onSearch={handleSearch} />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {skills.items.length === 0 && !isLoading ? (
        <div className="text-center py-16 text-slate-400">No skills found.</div>
      ) : (
        <div className="space-y-4">
          {skills.items.map((skill) => (
            <div
              key={skill.skillsID}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{skill.name}</h3>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/skills/${skill.skillsID}/edit`}
                    className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(skill.skillsID)}
                    className="px-3 py-1.5 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {skills.totalCount > skills.pageSize && (
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
            disabled={page * skills.pageSize >= skills.totalCount}
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