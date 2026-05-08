import { useEffect, useState, useCallback } from 'react';
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
    deleteUser
  } = useUsers();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [formError, setFormError] = useState(null);

  const [createRole, setCreateRole] = useState('');
  const [createForm, setCreateForm] = useState(emptyCreateForm);

  const [editForm, setEditForm] = useState(emptyEditForm);

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

  const totalPages = Math.max(1, Math.ceil((users.totalCount || 0) / (users.pageSize || PAGE_SIZE)));

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
      setFormError('Please select Client or Freelancer.');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
          <p className="text-xs text-slate-500">
            View and manage all users registered in the platform.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            Total users: <span className="font-semibold text-slate-900">{users.totalCount}</span>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white transition-colors"
          >
            <span className="text-base leading-none">+</span>
            New User
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by name, username or email..."
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <select
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value);
            }}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Username</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Roles</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Created</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase">Actions</th>
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
                  <tr key={u.userId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-900">{u.name} {u.surname}<div className="text-xs text-slate-500">{u.email}</div></td>
                    <td className="px-4 py-3 text-sm text-slate-700">{u.username}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{u.roles?.join(', ')}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${u.isActive ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => openEditModal(u)} className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs hover:bg-slate-200">Edit</button>
                        <button type="button" onClick={() => handleDelete(u)} className="px-2 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-600 text-xs hover:bg-rose-100">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <p>
            Page <span className="font-semibold text-slate-700">{users.page}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {typeof error === 'string' ? error : 'An error occurred while loading users.'}
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">Create New User</h3>
              <button type="button" onClick={closeCreateModal} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form className="p-6 space-y-6" onSubmit={handleCreateSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="First name" value={createForm.name} onChange={(value) => setCreateForm((f) => ({ ...f, name: value }))} />
                <FormInput label="Last name" value={createForm.surname} onChange={(value) => setCreateForm((f) => ({ ...f, surname: value }))} />
              </div>

              <FormInput label="Username" value={createForm.username} onChange={(value) => setCreateForm((f) => ({ ...f, username: value }))} />
              <FormInput label="Email" type="email" value={createForm.email} onChange={(value) => setCreateForm((f) => ({ ...f, email: value }))} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="Password" type="password" value={createForm.password} onChange={(value) => setCreateForm((f) => ({ ...f, password: value }))} />
                <FormInput label="Confirm Password" type="password" value={createForm.confirmPassword} onChange={(value) => setCreateForm((f) => ({ ...f, confirmPassword: value }))} />
              </div>

              {createRole === ROLES.FREELANCER && (
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <p className="text-xs font-semibold text-teal-600 uppercase">Freelancer details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase">Experience level</label>
                      <select
                        value={createForm.experienceLevel}
                        onChange={(e) => setCreateForm((f) => ({ ...f, experienceLevel: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <p className="text-xs font-semibold text-teal-600 uppercase">Client details</p>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase">Bio</label>
                    <textarea
                      value={createForm.bio}
                      onChange={(e) => setCreateForm((f) => ({ ...f, bio: e.target.value }))}
                      className="w-full px-3 py-2.5 min-h-25 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 resize-y focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="Industry" value={createForm.industry} onChange={(value) => setCreateForm((f) => ({ ...f, industry: value }))} />
                    <FormInput label="Budget (USD)" type="number" value={createForm.budget} onChange={(value) => setCreateForm((f) => ({ ...f, budget: value }))} />
                  </div>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={closeCreateModal} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!createRole}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-sm font-semibold text-white"
                >
                  Create user
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">Edit User</h3>
              <button type="button" onClick={closeEditModal} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Name" value={editForm.name} onChange={(value) => setEditForm((prev) => ({ ...prev, name: value }))} />
                <FormInput label="Surname" value={editForm.surname} onChange={(value) => setEditForm((prev) => ({ ...prev, surname: value }))} />
                <FormInput label="Username" value={editForm.username} onChange={(value) => setEditForm((prev) => ({ ...prev, username: value }))} />
                <FormInput label="Email" value={editForm.email} onChange={(value) => setEditForm((prev) => ({ ...prev, email: value }))} />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-2">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {['Admin', 'Client', 'Freelancer'].map((role) => {
                    const active = editForm.roles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          active
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'
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
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white">
                  Save changes
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
      <label className="block text-[11px] font-semibold text-slate-500 uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}

function RoleCard({ value, selected, onSelect, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`relative flex flex-col items-center gap-2 p-5 border-2 rounded-xl transition-all text-center ${
        selected
          ? 'border-teal-600 bg-teal-50'
          : 'border-slate-200 bg-white hover:border-teal-300'
      }`}
    >
      <p className={`font-bold text-sm ${selected ? 'text-teal-700' : 'text-slate-700'}`}>{label}</p>
      <p className={`text-[11px] ${selected ? 'text-teal-600' : 'text-slate-500'}`}>{description}</p>
    </button>
  );
}
