// AdminDashboard shows high-level stats and quick actions for admins.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/apiClient";

const cards = [
  { title: "Add Donor", to: "/donors", description: "Create and manage donors." },
  { title: "Add Institution", to: "/institutions", description: "Manage hospitals and clinics." },
  { title: "View Donations", to: "/donations", description: "See all recorded donations." },
  { title: "User Management", to: "/admin/users", description: "Promote, deactivate, or review users." },
  { title: "Reports & Audit", to: "/admin/reports", description: "Export data and review audit logs." },
];

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    donors: 0,
    donations: 0,
    institutions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load counts from backend endpoints.
    const loadStats = async () => {
      try {
        const [usersRes, donorsRes, donationsRes, institutionsRes] = await Promise.all([
          api.get("/users").catch(() => ({ data: { data: [] } })),
          api.get("/donors"),
          api.get("/donations"),
          api.get("/institutions"),
        ]);
        setStats({
          users: usersRes.data.data?.length || 0,
          donors: donorsRes.data.data?.length || 0,
          donations: donationsRes.data.data?.length || 0,
          institutions: institutionsRes.data.data?.length || 0,
        });
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-lg">
        <p className="text-sm uppercase tracking-wide text-slate-200">Admin Panel</p>
        <h1 className="text-3xl font-semibold mt-2">Welcome, Admin</h1>
        <p className="text-slate-200 mt-2 max-w-2xl">
          Manage users, donors, donations, and institutions from one place. Quick actions below help
          you get started.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Users" value={loading ? "..." : stats.users} />
        <Stat label="Donors" value={loading ? "..." : stats.donors} />
        <Stat label="Donations" value={loading ? "..." : stats.donations} />
        <Stat label="Institutions" value={loading ? "..." : stats.institutions} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="block bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{card.description}</p>
            <span className="inline-flex items-center mt-3 text-sm text-red-600 font-semibold">
              Go <span className="ml-1">-&gt;</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
