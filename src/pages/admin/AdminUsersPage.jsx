// AdminUsersPage lists users and allows role updates or deletion.
import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import Button from "../../components/UI/Button";
import { useAuth } from "../../context/AuthContext";

function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?._id || currentUser?.id;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const setUserStatus = async (id, isActive) => {
    const label = isActive ? "activate" : "deactivate";
    const confirmed = isActive
      ? true
      : window.confirm("Deactivate this user? They will not be able to log in.");
    if (!confirmed) return;

    try {
      await api.put(`/users/${id}/status`, { isActive });
      loadUsers();
    } catch (err) {
      console.error(`Failed to ${label} user`, err);
      alert(`Could not ${label} user. Please verify backend support.`);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to load users", err);
      setError("Could not load users. Ensure backend supports /api/users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const promoteToAdmin = async (id) => {
    try {
      await api.put(`/users/${id}/role`, { role: "admin" });
      loadUsers();
    } catch (err) {
      console.error("Failed to promote user", err);
      alert("Could not update role. Please verify backend support.");
    }
  };

  const getAvatarUrl = (user) => {
    const seed = user?.name || user?.email || "User";
    return (
      user?.profilePicture ||
      `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm text-slate-500">Admin tools</p>
          <h1 className="text-3xl font-semibold text-slate-900">User Management</h1>
        </div>
        <Button onClick={loadUsers}>{loading ? "Refreshing..." : "Refresh"}</Button>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-600" colSpan="6">
                  {loading ? "Loading users..." : "No users found."}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(u)}
                        alt={u.name ? `${u.name} profile` : "User profile"}
                        className="h-9 w-9 rounded-full object-cover border border-slate-200"
                        loading="lazy"
                      />
                      <span className="font-medium text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        u.role === "admin"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        u.isActive === false
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {u.isActive === false ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {u.role !== "admin" ? (
                      <button
                        onClick={() => promoteToAdmin(u._id)}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Promote to Admin
                      </button>
                    ) : null}
                    {currentUserId !== u._id ? (
                      <button
                        onClick={() => setUserStatus(u._id, u.isActive === false)}
                        className="text-sm text-slate-500 hover:text-slate-700"
                      >
                        {u.isActive === false ? "Activate" : "Deactivate"}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsersPage;
