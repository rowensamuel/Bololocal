import React, { useState, useEffect } from 'react';
import {
  Search,
  User as UserPlus,
  Shield,
  User,
  CheckCircle,
  XCircle,
  Key as KeyRound,
  Trash2,
  Edit2,
  BarChart2,
  Flame,
  Zap,
  BookOpen,
  Filter,
  RefreshCw,
  AlertTriangle,
} from '../../components/common/Icons';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { userService } from '../../services/userService';
import { UserProfile, UserRole, UserStatus } from '../../types/user';
import { mockLanguages } from '../../data/mockLanguages';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected user for action
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'user' as UserRole,
    native_language_id: 'hi',
    learning_language_id: 'mr',
    level: 'Beginner',
    status: 'active' as UserStatus,
    tempPassword: '',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch {
      showNotice('error', 'Failed to load user accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesLang =
      languageFilter === 'all' ||
      u.learning_language_id === languageFilter ||
      u.learningLanguage?.toLowerCase() === languageFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;

    return matchesSearch && matchesRole && matchesLang && matchesStatus;
  });

  // Action handlers
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      username: '',
      role: 'user',
      native_language_id: 'hi',
      learning_language_id: 'mr',
      level: 'Beginner',
      status: 'active',
      tempPassword: 'Bolo' + Math.floor(1000 + Math.random() * 9000) + '!',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showNotice('error', 'Name and Email are required.');
      return;
    }

    try {
      await userService.createUser({
        name: formData.name,
        full_name: formData.name,
        email: formData.email,
        username: formData.username || formData.email.split('@')[0],
        role: formData.role,
        native_language_id: formData.native_language_id,
        learning_language_id: formData.learning_language_id,
        level: formData.level as any,
        status: formData.status,
      });

      showNotice('success', `User account for ${formData.name} created successfully.`);
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create user account.');
    }
  };

  const handleOpenEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      name: user.full_name || user.name || '',
      email: user.email,
      username: user.username || user.email.split('@')[0],
      role: user.role,
      native_language_id: user.native_language_id || 'hi',
      learning_language_id: user.learning_language_id || 'mr',
      level: user.level || 'Beginner',
      status: user.status || 'active',
      tempPassword: '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await userService.updateUser(selectedUser.id, {
        full_name: formData.name,
        name: formData.name,
        email: formData.email,
        username: formData.username,
        role: formData.role,
        native_language_id: formData.native_language_id,
        learning_language_id: formData.learning_language_id,
        level: formData.level as any,
        status: formData.status,
      });

      showNotice('success', `User ${formData.name} updated successfully.`);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update user profile.');
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await userService.updateUser(user.id, { status: newStatus });
      showNotice('success', `User status updated to ${newStatus}.`);
      fetchUsers();
    } catch {
      showNotice('error', 'Failed to change status.');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser.id);
      showNotice('success', `User ${selectedUser.full_name || selectedUser.email} deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch {
      showNotice('error', 'Failed to delete user.');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    const res = await userService.resetPassword(selectedUser.id);
    showNotice('success', res.message);
    setIsResetPwdModalOpen(false);
  };

  // Metrics calculation
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const totalXP = users.reduce((acc, u) => acc + (u.totalXp || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-xs underline hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-black">Learner & Admin Directory</h1>
          <p className="text-xs text-[#555555] font-medium mt-0.5">
            Manage student records, administrator credentials, languages, and activity metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_#000]">
          <div className="text-[11px] text-[#555555] font-black uppercase tracking-wider">Total Registered</div>
          <div className="text-2xl font-black text-black mt-1">{totalCount}</div>
          <div className="text-[11px] text-[#555555] mt-1 font-medium">Learners & Staff</div>
        </Card>

        <Card className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_#000]">
          <div className="text-[11px] text-[#555555] font-black uppercase tracking-wider">Administrators</div>
          <div className="text-2xl font-black text-[#E26D24] mt-1">{adminCount}</div>
          <div className="text-[11px] text-[#555555] mt-1 font-medium">Full management access</div>
        </Card>

        <Card className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_#000]">
          <div className="text-[11px] text-[#555555] font-black uppercase tracking-wider">Active Learners</div>
          <div className="text-2xl font-black text-[#2C6E49] mt-1">{activeCount}</div>
          <div className="text-[11px] text-[#2C6E49] mt-1 font-bold">
            {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% active
          </div>
        </Card>

        <Card className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_#000]">
          <div className="text-[11px] text-[#555555] font-black uppercase tracking-wider">Accumulated XP</div>
          <div className="text-2xl font-black text-black mt-1">{totalXP.toLocaleString()}</div>
          <div className="text-[11px] text-[#555555] mt-1 font-medium">Across all languages</div>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card padding="md" className="border-2 border-black bg-white shadow-[4px_4px_0px_#000]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or username..."
              leftIcon={<Search className="w-4 h-4 text-black" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-black font-bold">
              <Filter className="w-3.5 h-3.5 text-black" />
              <span>Filters:</span>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="text-xs py-2 px-3 bg-white border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] text-black focus:outline-none font-bold"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins only</option>
              <option value="user">Users (Students)</option>
            </select>

            {/* Language Filter */}
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-white border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] text-black focus:outline-none font-bold"
            >
              <option value="all">All Learning Languages</option>
              {mockLanguages.map((l) => (
                <option key={l.id} value={l.code}>
                  {l.name} ({l.native_name})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs py-2 px-3 bg-white border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] text-black focus:outline-none font-bold"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>

            {(search || roleFilter !== 'all' || languageFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('all');
                  setLanguageFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <div className="border-2 border-black rounded-[4px] shadow-[4px_4px_0px_#000] bg-white overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[760px]">
          <thead className="bg-[#ECEAE4] border-b-2 border-black text-black uppercase tracking-wider font-black">
            <tr>
              <th className="px-5 py-3">Learner Profile</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Languages</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Activity & XP</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black text-black font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400 font-medium">
                    Loading accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">
                    No users found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const targetLang = mockLanguages.find(
                    (l) => l.code === user.learning_language_id || l.name === user.learningLanguage
                  );
                  const nativeLang = mockLanguages.find(
                    (l) => l.code === user.native_language_id || l.name === user.nativeLanguage
                  );

                  return (
                    <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 text-xs overflow-hidden shrink-0">
                            {user.avatar_url || user.avatarUrl ? (
                              <img
                                src={user.avatar_url || user.avatarUrl}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (user.name || user.full_name || 'U')[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-1.5">
                              <span>{user.full_name || user.name}</span>
                              {user.role === 'admin' && (
                                <span className="inline-flex items-center text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            user.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {user.role === 'admin' ? (
                            <Shield className="w-3 h-3 text-amber-700" />
                          ) : (
                            <User className="w-3 h-3 text-stone-500" />
                          )}
                          <span className="capitalize">{user.role}</span>
                        </span>
                      </td>

                      {/* Languages */}
                      <td className="px-4 py-4">
                        <div className="text-stone-900 font-semibold text-[11px]">
                          Learning:{' '}
                          <span className="text-amber-800 font-bold">
                            {targetLang?.name || user.learningLanguage || 'Marathi'}
                          </span>
                        </div>
                        <div className="text-stone-400 text-[10px]">
                          Native: {nativeLang?.name || user.nativeLanguage || 'Hindi'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            user.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-500 border border-stone-200'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-stone-400" />
                          )}
                          <span className="capitalize">{user.status || 'active'}</span>
                        </span>
                      </td>

                      {/* Stats */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-bold text-amber-700 text-xs">
                            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {user.streakDays || 0}d
                          </span>
                          <span className="flex items-center gap-1 font-mono font-bold text-stone-900 text-xs">
                            <Zap className="w-3 h-3 text-amber-600" />
                            {user.totalXp || 0} XP
                          </span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="View Statistics"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsStatsModalOpen(true);
                            }}
                            className="p-1.5 bg-[#A6FAFF] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] hover:bg-cyan-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer"
                          >
                            <BarChart2 className="w-3.5 h-3.5 text-black" />
                          </button>

                          <button
                            type="button"
                            title="Edit User"
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 bg-white border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] hover:bg-neutral-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-black" />
                          </button>

                          <button
                            type="button"
                            title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer ${
                              user.status === 'active' ? 'bg-[#FFE57F] hover:bg-amber-200' : 'bg-[#B8FF9F] hover:bg-emerald-200'
                            }`}
                          >
                            {user.status === 'active' ? (
                              <XCircle className="w-3.5 h-3.5 text-black" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5 text-black" />
                            )}
                          </button>

                          <button
                            type="button"
                            title="Reset Credentials"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsResetPwdModalOpen(true);
                            }}
                            className="p-1.5 bg-[#FFC29F] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] hover:bg-orange-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-black" />
                          </button>

                          <button
                            type="button"
                            title="Delete User"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 bg-[#FFA6F6] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] hover:bg-pink-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-black" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      {/* ADD USER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Learner or Administrator"
        description="Create an account record ready for Supabase Auth and User Profile tables."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Anand Kulkarni"
                required
              />
            </div>
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Email Address</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. anand@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Username (Optional)</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. anand_k"
              />
            </div>
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Account Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full py-2.5 px-3 bg-white border-2 border-black rounded-[4px] text-black text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#A6FAFF]"
              >
                <option value="user">Student / Learner (USER)</option>
                <option value="admin">Administrator (ADMIN)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Native Language</label>
              <select
                value={formData.native_language_id}
                onChange={(e) => setFormData({ ...formData, native_language_id: e.target.value })}
                className="w-full py-2.5 px-3 bg-white border-2 border-black rounded-[4px] text-black text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#A6FAFF]"
              >
                {mockLanguages.map((l) => (
                  <option key={l.id} value={l.code}>
                    {l.name} ({l.native_name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Learning Language</label>
              <select
                value={formData.learning_language_id}
                onChange={(e) => setFormData({ ...formData, learning_language_id: e.target.value })}
                className="w-full py-2.5 px-3 bg-white border-2 border-black rounded-[4px] text-black text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#A6FAFF]"
              >
                {mockLanguages.map((l) => (
                  <option key={l.id} value={l.code}>
                    {l.name} ({l.native_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Proficiency Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full py-2.5 px-3 bg-white border-2 border-black rounded-[4px] text-black text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#A6FAFF]"
              >
                <option value="Beginner">Beginner (Level A1)</option>
                <option value="Intermediate">Intermediate (Level B1)</option>
                <option value="Advanced">Advanced (Level C1)</option>
              </select>
            </div>
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Temporary Initial Password</label>
              <Input
                value={formData.tempPassword}
                onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                className="font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t-2 border-black">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Profile"
        description="Update profile metadata, role assignment, or languages."
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full py-2.5 px-3 bg-white border-2 border-black rounded-[4px] text-black text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#A6FAFF]"
              >
                <option value="user">User (Student)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="w-full py-2.5 px-3 bg-white border-2 border-black rounded-[4px] text-black text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#A6FAFF]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full py-2.5 px-3 bg-white border-2 border-black rounded-[4px] text-black text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#A6FAFF]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Learning Language</label>
              <select
                value={formData.learning_language_id}
                onChange={(e) => setFormData({ ...formData, learning_language_id: e.target.value })}
                className="w-full py-2.5 px-3 bg-white border-2 border-black rounded-[4px] text-black text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#A6FAFF]"
              >
                {mockLanguages.map((l) => (
                  <option key={l.id} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-black font-bold uppercase tracking-wider text-[11px] mb-1.5">Native Language</label>
              <select
                value={formData.native_language_id}
                onChange={(e) => setFormData({ ...formData, native_language_id: e.target.value })}
                className="w-full py-2.5 px-3 bg-white border-2 border-black rounded-[4px] text-black text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#A6FAFF]"
              >
                {mockLanguages.map((l) => (
                  <option key={l.id} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t-2 border-black">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* USER STATISTICS MODAL */}
      <Modal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title={`Statistics for ${selectedUser?.full_name || selectedUser?.name || 'Learner'}`}
        description="Comprehensive learning analytics and milestones."
        maxWidth="md"
      >
        {selectedUser && (
          <div className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#FFE57F] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000]">
                <div className="text-black font-bold uppercase text-[10px] tracking-wider">Total Experience</div>
                <div className="text-xl font-black text-black mt-1">
                  {selectedUser.totalXp || 0} XP
                </div>
              </div>
              <div className="p-3 bg-[#FFC29F] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000]">
                <div className="text-black font-bold uppercase text-[10px] tracking-wider">Daily Streak</div>
                <div className="text-xl font-black text-black mt-1">
                  {selectedUser.streakDays || 0} Days
                </div>
              </div>
              <div className="p-3 bg-[#A6FAFF] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000]">
                <div className="text-black font-bold uppercase text-[10px] tracking-wider">Completed Lessons</div>
                <div className="text-xl font-black text-black mt-1">
                  {selectedUser.lessonsCompletedCount || 0}
                </div>
              </div>
              <div className="p-3 bg-[#B8FF9F] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000]">
                <div className="text-black font-bold uppercase text-[10px] tracking-wider">Daily Goal</div>
                <div className="text-xl font-black text-black mt-1">
                  {selectedUser.daily_goal || selectedUser.dailyGoalMinutes || 15} mins/day
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] space-y-1.5 font-mono text-[11px]">
              <div>
                <span className="font-bold text-neutral-500">User ID:</span> {selectedUser.id}
              </div>
              <div>
                <span className="font-bold text-neutral-500">Auth UID:</span> {selectedUser.auth_user_id || 'supabase-auth-link'}
              </div>
              <div>
                <span className="font-bold text-neutral-500">Target Language:</span>{' '}
                {selectedUser.learning_language_id?.toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-neutral-500">Created:</span>{' '}
                {new Date(selectedUser.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={() => setIsStatsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* RESET PASSWORD MODAL */}
      <Modal
        isOpen={isResetPwdModalOpen}
        onClose={() => setIsResetPwdModalOpen(false)}
        title="Reset User Credentials"
        description="Generate temporary login credentials or trigger Supabase password recovery."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs font-medium">
          <p className="text-black leading-relaxed font-semibold">
            Are you sure you want to reset credentials for{' '}
            <span className="font-black bg-[#FFE57F] px-1 py-0.5 border border-black rounded">{selectedUser?.email}</span>?
          </p>

          <div className="p-3 bg-[#FFC29F] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] text-black text-xs font-bold leading-relaxed">
            In production, this calls the Supabase Auth Admin API endpoint to send a password reset email or set a temporary credential.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsResetPwdModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleResetPassword}>
              Generate Reset Token
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User Account"
        description="Permanent removal of user records."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs font-medium">
          <div className="p-3 bg-[#FFA6F6] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] text-black flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-black shrink-0 mt-0.5" />
            <div>
              <div className="font-black uppercase tracking-wider text-black">Irreversible Action</div>
              <div className="text-[11px] font-bold mt-0.5">
                This will delete user <span className="underline">{selectedUser?.full_name || selectedUser?.name}</span> and all associated progress records from Supabase.
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteUser}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
