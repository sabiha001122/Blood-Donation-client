// AdminReportsPage exposes audit logs and data exports.
import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import Button from "../../components/UI/Button";

function AdminReportsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/audit");
      setLogs(res.data.data || []);
    } catch (err) {
      console.error("Failed to load audit logs", err);
      setError("Could not load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const downloadExport = async (type) => {
    try {
      const res = await api.get(`/admin/export/${type}`, { responseType: "blob" });
      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to export ${type}`, err);
      alert("Export failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm text-slate-500">Admin reports</p>
          <h1 className="text-3xl font-semibold text-slate-900">Exports & Audit</h1>
        </div>
        <Button onClick={loadLogs}>{loading ? "Refreshing..." : "Refresh Logs"}</Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Data Exports</h2>
        <p className="text-sm text-slate-600">
          Download CSVs for compliance, backups, or offline analysis.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => downloadExport("donors")}>Export Donors</Button>
          <Button onClick={() => downloadExport("donations")}>Export Donations</Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Audit Log</h2>
          <span className="text-sm text-slate-500">
            Showing latest {logs.length} entries
          </span>
        </div>

        {error ? <p className="text-sm text-red-500 mt-2">{error}</p> : null}

        <div className="overflow-x-auto mt-3">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-700">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-600" colSpan="5">
                    {loading ? "Loading audit logs..." : "No audit entries yet."}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}
                    </td>
                    <td className="px-3 py-2">
                      {log.user?.email || log.user?.name || "System"}
                    </td>
                    <td className="px-3 py-2">{log.action}</td>
                    <td className="px-3 py-2">
                      {log.targetType}
                      {log.targetId ? ` (${log.targetId})` : ""}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {log.details ? JSON.stringify(log.details) : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminReportsPage;
