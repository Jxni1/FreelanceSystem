import { useEffect, useState, useCallback, useRef } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { ROLES } from '../../constants/roles';

const PAGE_SIZE = 10;
const EXPERIENCE_LEVELS = ['Junior', 'Mid', 'Senior', 'Expert'];

const emptyCreateForm = {
  name: '',
  surname: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  experienceLevel: '',
  hourlyRate: '',
  bio: '',
  industry: '',
  budget: ''
};

const emptyEditForm = {
  name: '',
  surname: '',
  username: '',
  email: '',
  isActive: true,
  roles: []
};

export default function AdminUsersPage() {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    exportUsers,
    importUsers
  } = useUsers();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [formError, setFormError] = useState(null);

  const [createRole, setCreateRole] = useState('');
  const [createForm, setCreateForm] = useState(emptyCreateForm);

  const [editForm, setEditForm] = useState(emptyEditForm);

  const [importFormat, setImportFormat] = useState('csv');
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const exportMenuRef = useRef(null);

  const loadUsers = useCallback(() => {
    return fetchUsers({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      role: roleFilter || undefined,
      isActive:
        statusFilter === ''
          ? undefined
          : statusFilter === 'active'
            ? true
            : false
    });
  }, [fetchUsers, page, search, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsExportOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil((users.totalCount || 0) / (users.pageSize || PAGE_SIZE)));

  const currentFilters = {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    role: roleFilter || undefined,
    isActive:
      statusFilter === ''
        ? undefined
        : statusFilter === 'active'
          ? true
          : false
  };

  const openCreateModal = () => {
    setCreateRole('');
    setCreateForm(emptyCreateForm);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setCreateRole('');
    setCreateForm(emptyCreateForm);
    setFormError(null);
    setIsCreateOpen(false);
  };

  async function handleCreateSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!createRole) {
      setFormError('Please select a role (Admin, Client, or Freelancer).');
      return;
    }

    const body = {
      name: createForm.name,
      surname: createForm.surname,
      username: createForm.username,
      email: createForm.email,
      password: createForm.password,
      confirmPassword: createForm.confirmPassword,
      role: createRole
    };

    if (createRole === ROLES.FREELANCER) {
      body.experienceLevel = createForm.experienceLevel;
      body.hourlyRate = parseFloat(createForm.hourlyRate) || null;
    }

    if (createRole === ROLES.CLIENT) {
      body.bio = createForm.bio;
      body.industry = createForm.industry;
      body.budget = parseFloat(createForm.budget) || null;
    }

    try {
      await createUser(body);
      closeCreateModal();
      await loadUsers();
    } catch (err) {
      const apiError =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Failed to create user.';
      setFormError(apiError);
    }
  }

  const openEditModal = (u) => {
    setSelectedUser(u);
    setEditForm({
      name: u.name || '',
      surname: u.surname || '',
      username: u.username || '',
      email: u.email || '',
      isActive: u.isActive ?? true,
      roles: u.roles || []
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setEditForm(emptyEditForm);
    setFormError(null);
    setIsEditOpen(false);
  };

  const openImportModal = () => {
    setImportFormat('csv');
    setImportFile(null);
    setImportResult(null);
    setFormError(null);
    setIsImportOpen(true);
    setIsExportOpen(false);
  };

  const closeImportModal = () => {
    setImportFormat('csv');
    setImportFile(null);
    setImportResult(null);
    setFormError(null);
    setIsImportOpen(false);
  };

  const toggleRole = (role) => {
    setEditForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    try {
      await updateUser(selectedUser.userId, editForm);
      closeEditModal();
      await loadUsers();
    } catch (err) {
      const apiError =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Failed to update user.';
      setFormError(apiError);
    }
  };

  const handleDelete = async (u) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${u.name} ${u.surname}?`
    );

    if (!confirmed) return;

    try {
      await deleteUser(u.userId);
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadBlob = (response, fallbackName) => {
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    const disposition = response.headers['content-disposition'];
    let fileName = fallbackName;

    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) {
        fileName = match[1];
      }
    }

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    try {
      setIsExportOpen(false);
      const response = await exportUsers(currentFilters, format);
      const extension = format === 'excel' ? 'xlsx' : format;
      downloadBlob(response, `users-export.${extension}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!importFile) {
      setFormError('Please choose a file to import.');
      return;
    }

    try {
      const result = await importUsers(importFile, importFormat);
      setImportResult(result?.data ?? result?.value ?? result);
      await loadUsers();
    } catch (err) {
      const apiError =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Failed to import users.';
      setFormError(apiError);
    }
  };

  const getImportAccept = () => {
    if (importFormat === 'csv') return '.csv';
    if (importFormat === 'excel') return '.xlsx';
    return '.json';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
          <p className="text-xs text-slate-500">
            View and manage all users registered in the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5">
            Total users: <span className="font-semibold text-slate-900">{users.totalCount}</span>
          </div>

          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              aria-haspopup="menu"
              aria-expanded={isExportOpen}
            >
               ↓ Export
              <svg
                className={`h-4 w-4 transition-transform ${isExportOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isExportOpen && (
              <div
                className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  <span>Export as CSV</span>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">.csv</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport('excel')}
                  className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  <span>Export as Excel</span>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">.xlsx</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport('json')}
                  className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  <span>Export as JSON</span>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">.json</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={openImportModal}
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 hover:bg-amber-100"
          >
           ↑ Import
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            <span className="text-base leading-none">+</span>
            New User
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by name, username or email..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <select
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All roles</option>
            <option value="Admin">Admin</option>
            <option value="Client">Client</option>
            <option value="Freelancer">Freelancer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">User</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Username</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Roles</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-500">Created</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase text-slate-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                    Loading users...
                  </td>
                </tr>
              )}

              {!isLoading && users.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                users.items.map((u) => (
                  <tr key={u.userId} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {u.name} {u.surname}
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{u.username}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{u.roles?.join(', ')}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          u.isActive
                            ? 'border-teal-200 bg-teal-50 text-teal-700'
                            : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-600 hover:bg-rose-100"
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

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <p>
            Page <span className="font-semibold text-slate-700">{users.page}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {typeof error === 'string' ? error : 'An error occurred while loading users.'}
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Create New User</h3>
              <button type="button" onClick={closeCreateModal} className="text-sm text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form className="space-y-6 p-6" onSubmit={handleCreateSubmit} noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <RoleCard
                  value={ROLES.ADMIN}
                  selected={createRole === ROLES.ADMIN}
                  onSelect={setCreateRole}
                  label="Admin"
                  description="Manage system & users"
                />
                <RoleCard
                  value={ROLES.FREELANCER}
                  selected={createRole === ROLES.FREELANCER}
                  onSelect={setCreateRole}
                  label="Freelancer"
                  description="Offer services & get hired"
                />
                <RoleCard
                  value={ROLES.CLIENT}
                  selected={createRole === ROLES.CLIENT}
                  onSelect={setCreateRole}
                  label="Client"
                  description="Post projects & hire talent"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput label="First name" value={createForm.name} onChange={(value) => setCreateForm((f) => ({ ...f, name: value }))} />
                <FormInput label="Last name" value={createForm.surname} onChange={(value) => setCreateForm((f) => ({ ...f, surname: value }))} />
              </div>

              <FormInput label="Username" value={createForm.username} onChange={(value) => setCreateForm((f) => ({ ...f, username: value }))} />
              <FormInput label="Email" type="email" value={createForm.email} onChange={(value) => setCreateForm((f) => ({ ...f, email: value }))} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput label="Password" type="password" value={createForm.password} onChange={(value) => setCreateForm((f) => ({ ...f, password: value }))} />
                <FormInput label="Confirm Password" type="password" value={createForm.confirmPassword} onChange={(value) => setCreateForm((f) => ({ ...f, confirmPassword: value }))} />
              </div>

              {createRole === ROLES.FREELANCER && (
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold uppercase text-teal-600">Freelancer details</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase text-slate-500">Experience level</label>
                      <select
                        value={createForm.experienceLevel}
                        onChange={(e) => setCreateForm((f) => ({ ...f, experienceLevel: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select level</option>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <FormInput label="Hourly Rate (USD)" type="number" value={createForm.hourlyRate} onChange={(value) => setCreateForm((f) => ({ ...f, hourlyRate: value }))} />
                  </div>
                </div>
              )}

              {createRole === ROLES.CLIENT && (
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold uppercase text-teal-600">Client details</p>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase text-slate-500">Bio</label>
                    <textarea
                      value={createForm.bio}
                      onChange={(e) => setCreateForm((f) => ({ ...f, bio: e.target.value }))}
                      className="min-h-25 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormInput label="Industry" value={createForm.industry} onChange={(value) => setCreateForm((f) => ({ ...f, industry: value }))} />
                    <FormInput label="Budget (USD)" type="number" value={createForm.budget} onChange={(value) => setCreateForm((f) => ({ ...f, budget: value }))} />
                  </div>
                </div>
              )}

              {formError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={closeCreateModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!createRole}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Create user
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Edit User</h3>
              <button type="button" onClick={closeEditModal} className="text-sm text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput label="Name" value={editForm.name} onChange={(value) => setEditForm((prev) => ({ ...prev, name: value }))} />
                <FormInput label="Surname" value={editForm.surname} onChange={(value) => setEditForm((prev) => ({ ...prev, surname: value }))} />
                <FormInput label="Username" value={editForm.username} onChange={(value) => setEditForm((prev) => ({ ...prev, username: value }))} />
                <FormInput label="Email" value={editForm.email} onChange={(value) => setEditForm((prev) => ({ ...prev, email: value }))} />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase text-slate-500">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {['Admin', 'Client', 'Freelancer'].map((role) => {
                    const active = editForm.roles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          active
                            ? 'border-teal-600 bg-teal-600 text-white'
                            : 'border-slate-300 bg-white text-slate-600 hover:border-teal-400'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Active
              </label>

              {formError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={closeEditModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Import Users</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Upload a supported file and import users in bulk.
                </p>
              </div>
              <button type="button" onClick={closeImportModal} className="text-sm text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 p-6">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase text-slate-500">Format</label>
                <select
                  value={importFormat}
                  onChange={(e) => {
                    setImportFormat(e.target.value);
                    setImportFile(null);
                    setImportResult(null);
                    setFormError(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Accepted file type: <span className="font-semibold text-slate-800">{getImportAccept()}</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase text-slate-500">File</label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-teal-400 hover:bg-teal-50/40">
                  <span className="text-sm font-medium text-slate-700">
                    {importFile ? importFile.name : 'Choose a file'}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Click to browse {getImportAccept()} file
                  </span>
                  <input
                    type="file"
                    accept={getImportAccept()}
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Expected fields: Name, Surname, Username, Email, Password, ConfirmPassword, Role, ExperienceLevel, HourlyRate, Bio, Industry, Budget
              </div>

              {importResult && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-emerald-200 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase text-emerald-600">Total</div>
                      <div className="mt-1 text-lg font-semibold text-emerald-900">{importResult.totalRows}</div>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase text-emerald-600">Imported</div>
                      <div className="mt-1 text-lg font-semibold text-emerald-900">{importResult.importedRows}</div>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase text-emerald-600">Failed</div>
                      <div className="mt-1 text-lg font-semibold text-emerald-900">{importResult.failedRows}</div>
                    </div>
                  </div>

                  {importResult.errors?.length > 0 && (
                    <div className="mt-3 rounded-lg border border-rose-200 bg-white p-3 text-xs text-rose-700">
                      {importResult.errors.slice(0, 5).map((err, idx) => (
                        <div key={idx}>- {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {formError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeImportModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  Import users
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormInput({ label, value, onChange, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}

function RoleCard({ value, selected, onSelect, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all ${
        selected
          ? 'border-teal-600 bg-teal-50'
          : 'border-slate-200 bg-white hover:border-teal-300'
      }`}
    >
      <p className={`text-sm font-bold ${selected ? 'text-teal-700' : 'text-slate-700'}`}>{label}</p>
      <p className={`text-[11px] ${selected ? 'text-teal-600' : 'text-slate-500'}`}>{description}</p>
    </button>
  );
}