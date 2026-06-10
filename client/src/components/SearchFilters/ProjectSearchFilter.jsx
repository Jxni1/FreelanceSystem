import { useState } from 'react';

export default function ProjectSearchFilter({ onSearch }) {
  const [filters, setFilters] = useState({
    fullTextSearch: '',
    searchIn: 'title,description',
    minBudget: '',
    maxBudget: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      fullTextSearch: '',
      searchIn: 'title,description',
      minBudget: '',
      maxBudget: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
          <input
            type="text"
            name="fullTextSearch"
            value={filters.fullTextSearch}
            onChange={handleInputChange}
            placeholder="Search..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Budget</label>
          <input
            type="number"
            name="minBudget"
            value={filters.minBudget}
            onChange={handleInputChange}
            placeholder="Min"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Budget</label>
          <input
            type="number"
            name="maxBudget"
            value={filters.maxBudget}
            onChange={handleInputChange}
            placeholder="Max"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="createdAt">Newest</option>
            <option value="budget">Budget</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
}