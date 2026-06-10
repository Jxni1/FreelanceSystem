import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../../hooks/useCategories';



export default function CategoriesListPage() {
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    deleteCategory,
    exportCategories,
    importCategories,
  } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [format, setFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories({ page, search: searchTerm });
  }, [page, searchTerm]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      fetchCategories({ page, search: searchTerm });
    } catch {}
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const response = await exportCategories(
        { page, pageSize: categories.pageSize, search: searchTerm },
        format
      );

      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const disposition = response.headers['content-disposition'];
      const match = disposition?.match(/filename="?([^"]+)"?/);
      a.download = match?.[1] || `categories.${format === 'excel' ? 'xlsx' : format}`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export categories.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const result = await importCategories(file, format);

      alert(
        `Import finished.\nTotal: ${result.totalRows}\nImported: ${result.importedRows}\nFailed: ${result.failedRows}`
      );

      await fetchCategories({ page, search: searchTerm });
    } catch (err) {
      console.error(err);
      alert('Failed to import categories.');
    } finally {
      e.target.value = '';
      setIsImporting(false);
    }
  };

  if (isLoading && categories.items.length === 0) {
    return <div className="p-8 text-center text-slate-500">Loading categories...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="excel">Excel</option>
          </select>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>

          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept={format === 'excel' ? '.xlsx' : format === 'json' ? '.json' : '.csv'}
            className="hidden"
            onChange={handleImportFileChange}
          />

          <Link
            to="/admin/categories/new"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
          >
            + New Category
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {categories.items.length === 0 && !isLoading ? (
        <div className="text-center py-16 text-slate-400">No categories found.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.items.map((c) => (
                <tr key={c.categoryID} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-900">{c.name}</td>
                  <td className="px-6 py-3 text-slate-600 max-w-xs truncate">{c.description}</td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/categories/${c.categoryID}/edit`}
                        className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(c.categoryID)}
                        className="px-3 py-1.5 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {categories.totalCount > categories.pageSize && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-600">Page {page}</span>
          <button
            disabled={page * categories.pageSize >= categories.totalCount}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}