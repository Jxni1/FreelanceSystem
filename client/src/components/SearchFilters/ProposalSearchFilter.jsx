import { useState } from 'react';

export default function ProposalSearchFilter({ onSearch }) {
  const [filters, setFilters] = useState({
    searchMessage: '',
    minBidAmount: '',
    maxBidAmount: '',
    minDeliveryDays: '',
    maxDeliveryDays: '',
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
      searchMessage: '',
      minBidAmount: '',
      maxBidAmount: '',
      minDeliveryDays: '',
      maxDeliveryDays: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Search Message</label>
          <input
            type="text"
            name="searchMessage"
            value={filters.searchMessage}
            onChange={handleInputChange}
            placeholder="Search..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Bid</label>
          <input
            type="number"
            name="minBidAmount"
            value={filters.minBidAmount}
            onChange={handleInputChange}
            placeholder="Min"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Bid</label>
          <input
            type="number"
            name="maxBidAmount"
            value={filters.maxBidAmount}
            onChange={handleInputChange}
            placeholder="Max"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Days</label>
          <input
            type="number"
            name="minDeliveryDays"
            value={filters.minDeliveryDays}
            onChange={handleInputChange}
            placeholder="Min"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Days</label>
          <input
            type="number"
            name="maxDeliveryDays"
            value={filters.maxDeliveryDays}
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
            <option value="bidamount">Bid Amount</option>
            <option value="deliverydays">Delivery Days</option>
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