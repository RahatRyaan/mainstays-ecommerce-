import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  Crown, 
  Store, 
  User as UserIcon, 
  AlertTriangle, 
  UserCheck 
} from 'lucide-react';
import apiClient from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  createdAt: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editRoleUser, setEditRoleUser] = useState<UserRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'vendor' | 'admin'>('customer');
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const addToast = useToastStore((state) => state.addToast);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/users', {
        params: {
          search: search || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined
        }
      });
      setUsers(res.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateRole = async () => {
    if (!editRoleUser) return;
    try {
      await apiClient.patch(`/admin/users/${editRoleUser._id}/role`, {
        role: selectedRole
      });

      setUsers((prev) =>
        prev.map((u) => (u._id === editRoleUser._id ? { ...u, role: selectedRole } : u))
      );

      addToast({
        type: 'success',
        title: 'User Role Updated',
        message: `${editRoleUser.name} is now assigned the "${selectedRole}" role.`
      });

      setEditRoleUser(null);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.response?.data?.message || 'Failed to update user role.'
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await apiClient.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setDeleteModalId(null);
      addToast({
        type: 'success',
        title: 'User Deleted',
        message: 'The user account has been permanently removed.'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.response?.data?.message || 'Could not delete user account.'
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
            <Crown className="w-3 h-3" /> Administrator
          </span>
        );
      case 'vendor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <Store className="w-3 h-3" /> Merchant / Vendor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
            <UserIcon className="w-3 h-3" /> Shopper / Customer
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-textPrimary tracking-tight">
            User Accounts
          </h1>
          <p className="text-sm text-textMuted mt-1">
            Manage user roles, platform permissions, and registered accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-textMuted">
            Total Users: <strong className="text-textPrimary">{users.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-textMuted whitespace-nowrap">Filter Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-xs font-semibold text-textPrimary focus:outline-hidden focus:border-brand"
          >
            <option value="all">All Roles</option>
            <option value="customer">Shoppers (Customers)</option>
            <option value="vendor">Merchants (Vendors)</option>
            <option value="admin">Administrators</option>
          </select>

          <Button variant="secondary" size="sm" onClick={fetchUsers} className="rounded-xl text-xs">
            Refresh
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
            <p className="text-sm font-semibold text-textMuted">Loading user database...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 mx-auto flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-sora font-bold text-lg text-textPrimary">No Users Found</h3>
            <p className="text-xs text-textMuted">Try broadening your search query or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-textMuted text-xs font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Member Since</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const isSelf = currentUser?.id === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-textPrimary font-sora font-bold text-xs flex items-center justify-center shrink-0 border border-border">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-sora font-bold text-textPrimary text-sm flex items-center gap-1.5">
                              {u.name}
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 font-normal">
                                  You
                                </span>
                              )}
                            </p>
                            <span className="text-[11px] text-textMuted font-mono">ID: {u._id.substring(u._id.length - 8)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs text-textPrimary">
                        {u.email}
                      </td>

                      <td className="py-4 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="py-4 px-4 text-xs text-textMuted">
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditRoleUser(u);
                              setSelectedRole(u.role);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-textMuted hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Edit Role</span>
                          </button>

                          {!isSelf && (
                            <button
                              onClick={() => setDeleteModalId(u._id)}
                              className="p-1.5 text-textMuted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editRoleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/30 backdrop-blur-xs">
          <div className="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-editorial animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] text-[#9E6D08] border border-[#EBD69D] flex items-center justify-center mx-auto mb-2">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-textPrimary">Change User Role</h3>
              <p className="text-xs font-mono-tag text-textMuted">
                Modifying permissions for <strong className="text-textPrimary">{editRoleUser.name}</strong>
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  role: 'customer',
                  label: 'Customer / Shopper',
                  desc: 'Standard buying access, cart, order history',
                  icon: UserIcon,
                  color: 'blue'
                },
                {
                  role: 'vendor',
                  label: 'Vendor / Merchant',
                  desc: 'Can manage catalog, fulfill orders, request payouts',
                  icon: Store,
                  color: 'emerald'
                },
                {
                  role: 'admin',
                  label: 'Super Administrator',
                  desc: 'Full platform control over users, products, coupons & orders',
                  icon: Crown,
                  color: 'purple'
                },
              ].map((r) => {
                const isSelected = selectedRole === r.role;
                const Icon = r.icon;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setSelectedRole(r.role as any)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#D94E34] bg-[#FCEFEF] dark:bg-[#2E1D1D]'
                        : 'border-border hover:bg-surface-muted/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-[#D94E34] text-white' : 'bg-surface-muted text-textMuted'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${isSelected ? 'text-[#D94E34]' : 'text-textPrimary'}`}>
                        {r.label}
                      </p>
                      <p className="text-xs font-mono-tag text-textMuted mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setEditRoleUser(null)}
                className="rounded-full font-mono-tag text-xs uppercase tracking-wider font-semibold"
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleUpdateRole}
                className="bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] rounded-full font-mono-tag text-xs uppercase tracking-wider font-bold shadow-xs"
              >
                Save Role
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/30 backdrop-blur-xs">
          <div className="bg-surface border border-border/80 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-editorial animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-[#FCEFEF] text-[#D94E34] border border-[#F2C7C4] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-sora font-bold text-lg text-textPrimary">Delete Account?</h3>
              <p className="text-xs text-textMuted mt-1">
                Are you sure you want to permanently delete this user account? All associated records may be affected.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setDeleteModalId(null)}
                className="rounded-full font-mono-tag text-xs uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={() => handleDeleteUser(deleteModalId)}
                className="bg-[#D94E34] hover:bg-[#C03B22] text-[#FFF8E7] rounded-full font-mono-tag text-xs uppercase tracking-wider font-bold shadow-xs"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
