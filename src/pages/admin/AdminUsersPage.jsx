// AdminUsersPage lists users and allows role updates or deletion.
import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import Button from "../../components/UI/Button";
import { useAuth } from "../../context/AuthContext";

function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const deleteUser = async (id) => {
    const confirmed = window.confirm("Delete this user? This action cannot be undone.");
    if (!confirmed) return;
    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Could not delete user. Please verify backend support.");
    }
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
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-600" colSpan="5">
                  {loading ? "Loading users..." : "No users found."}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
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
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
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
                    {currentUser?._id !== u._id ? (
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="text-sm text-slate-500 hover:text-slate-700"
                      >
                        Delete
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
