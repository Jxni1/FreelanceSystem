import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSkills } from '../../../hooks/useSkills';

export default function SkillsListPage() {
  const { skills, isLoading, error, fetchSkills, deleteSkill } = useSkills();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSkills({ page, pageSize: 10, search: searchTerm });
  }, [page, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      await deleteSkill(id);
      fetchSkills({ page, pageSize: 10, search: searchTerm });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSkills({ page: 1, pageSize: 10, search: searchTerm });
  };

  if (isLoading && skills.items.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4" />
        <p>Loading skills...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Skills Management</h1>
          <p className="text-slate-500 mt-1">Manage available skills for the platform.</p>
        </div>
        <Link
          to="/admin/skills/new"
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl leading-none">+</span> New Skill
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search skills..."
              className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              🔍
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">
            {typeof error === 'string' ? error : 'Error loading skills'}
          </div>
        )}

        {skills.items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-lg mb-4">No skills found</p>
            <Link to="/admin/skills/new" className="text-teal-600 font-semibold hover:underline">
              Create the first skill
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {skills.items.map((skill) => (
                  <tr key={skill.skillsID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-medium">{skill.name}</td>
                    <td className="px-6 py-4 text-right space-x-3 flex justify-end">
                      <Link
                        to={`/admin/skills/${skill.skillsID}/edit`}
                        className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(skill.skillsID)}
                        className="text-red-600 hover:text-red-700 font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {skills.totalCount > skills.pageSize && (
          <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="text-sm text-slate-600">
              Showing {(page - 1) * skills.pageSize + 1} to {Math.min(page * skills.pageSize, skills.totalCount)} of {skills.totalCount}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => (p * skills.pageSize < skills.totalCount ? p + 1 : p))}
                disabled={page * skills.pageSize >= skills.totalCount}
                className="px-3 py-1 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}