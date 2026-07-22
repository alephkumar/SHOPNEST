import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate } from '../../utils/format';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: search ? { search } : {} });
      setUsers(data.users);
    } catch (err) {
      toast.error('Could not load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(loadUsers, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update user');
    }
  };

  const handleRoleChange = async (user, role) => {
    try {
      await api.put(`/users/${user._id}`, { role });
      toast.success('Role updated');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update role');
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Users</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="input-field !w-64 !py-2 text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-5 py-3 font-medium text-slate">Name</th>
              <th className="px-5 py-3 font-medium text-slate">Email</th>
              <th className="px-5 py-3 font-medium text-slate">Joined</th>
              <th className="px-5 py-3 font-medium text-slate">Role</th>
              <th className="px-5 py-3 font-medium text-slate">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-light">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-light">No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-t border-ink/5">
                  <td className="px-5 py-3 text-ink">{user.name}</td>
                  <td className="px-5 py-3 text-slate">{user.email}</td>
                  <td className="px-5 py-3 text-slate-light">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      className="text-xs border border-ink/15 rounded-full px-2.5 py-1 bg-white"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.isActive ? 'bg-sage/15 text-sage-dark' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
