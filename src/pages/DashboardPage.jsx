// DashboardPage shows quick stats and recent activity.
// Admin: system overview. Regular user: personal donor/request history & eligibility.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

function StatCard({ title, value, description }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex-1">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-semibold text-slate-900 mt-1">{value}</p>
      {description ? <p className="text-xs text-slate-500 mt-1">{description}</p> : null}
    </div>
  );
}

function DashboardPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({ donors: 0, donations: 0, institutions: 0 });
  const [recentDonors, setRecentDonors] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // User-specific
  const [myDonor, setMyDonor] = useState(null);
  const [myEligibility, setMyEligibility] = useState(null);
  const [myDonations, setMyDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [donorRes, donationRes, institutionRes] = await Promise.all([
          api.get("/donors"),
          api.get("/donations"),
          api.get("/institutions"),
        ]);

        setStats({
          donors: donorRes.data.data?.length || 0,
          donations: donationRes.data.data?.length || 0,
          institutions: institutionRes.data.data?.length || 0,
        });

        setRecentDonors(donorRes.data.data?.slice(0, 5) || []);
        setRecentDonations(donationRes.data.data?.slice(0, 5) || []);
      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const meRes = await api.get("/donors/me");
        const donor = meRes.data.data;
        setMyDonor(donor);

        const [eligibilityRes, donationsRes, requestsRes] = await Promise.all([
          api.get(`/donors/${donor._id}/eligibility`),
          api.get(`/donations/donor/${donor._id}`),
          api.get("/requests/me"),
        ]);

        setMyEligibility(eligibilityRes.data);
        setMyDonations(donationsRes.data.data || []);
        setMyRequests(requestsRes.data.data || []);
      } catch (error) {
        console.error("User dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchAdminData();
    } else {
      fetchUserData();
    }
  }, [isAdmin]);

  if (loading) {
    return <div className="text-slate-700">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-sm text-slate-500">Overview</p>
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        </div>
        {isAdmin ? (
          <Link
            to="/donors"
            className="px-4 py-2 rounded-md text-sm bg-red-500 text-white hover:bg-red-600 transition shadow-sm"
          >
            Add Donor
          </Link>
        ) : null}
      </div>

      {isAdmin ? (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard title="Total Donors" value={stats.donors} />
            <StatCard title="Total Donations" value={stats.donations} />
            <StatCard title="Institutions" value={stats.institutions} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900">Recent Donors</h2>
                <Link className="text-sm text-red-600 hover:text-red-700" to="/donors">
                  View all
                </Link>
              </div>
              {recentDonors.length === 0 ? (
                <p className="text-sm text-slate-600">No donors yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentDonors.map((donor) => (
                    <li key={donor._id} className="py-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{donor.fullName}</p>
                        <p className="text-xs text-slate-500">
                          {donor.bloodGroup} · {donor.address?.city || "N/A"}
                        </p>
                      </div>
                      <Link
                        to={`/donors/${donor._id}`}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900">Recent Donations</h2>
                <Link className="text-sm text-red-600 hover:text-red-700" to="/donations">
                  View all
                </Link>
              </div>
              {recentDonations.length === 0 ? (
                <p className="text-sm text-slate-600">No donations yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentDonations.map((donation) => (
                    <li key={donation._id} className="py-2">
                      <p className="font-medium text-slate-900">
                        {donation.donor?.fullName || "Donor"} donated {donation.units || 1} unit(s)
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(donation.donationDate).toLocaleDateString()} ·{" "}
                        {donation.institution?.name || donation.location || "No location"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              title="My Donations"
              value={myDonations.length}
              description="All recorded donations"
            />
            <StatCard
              title="My Open Requests"
              value={myRequests.filter((r) => r.status === "open").length}
              description="Active blood requests"
            />
            <StatCard
              title="Eligibility"
              value={myEligibility?.eligible ? "Eligible" : "Not eligible"}
              description={
                myEligibility?.eligible
                  ? "You can donate now."
                  : `Wait ${myEligibility?.daysUntilEligible ?? "?"} days`
              }
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-slate-900">My Donor Profile</h2>
                <Link className="text-sm text-red-600 hover:text-red-700" to="/donors">
                  View / Edit
                </Link>
              </div>
              {myDonor ? (
                <>
                  <p className="text-sm text-slate-700">
                    {myDonor.fullName} · {myDonor.bloodGroup} · {myDonor.address?.city || "N/A"}
                  </p>
                  <p className="text-sm text-slate-700">
                    Last donation:{" "}
                    {myDonor.lastDonationDate
                      ? new Date(myDonor.lastDonationDate).toLocaleDateString()
                      : "None"}
                  </p>
                  <p className="text-sm text-slate-700">
                    Total donations: {myDonor.totalDonations || 0}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  You do not have a donor profile yet. Create one to become a donor.
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-slate-900">My Requests</h2>
                <Link className="text-sm text-red-600 hover:text-red-700" to="/requests">
                  View all
                </Link>
              </div>
              {myRequests.length === 0 ? (
                <p className="text-sm text-slate-600">No requests yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {myRequests.slice(0, 5).map((req) => (
                    <li key={req._id} className="py-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {req.bloodGroup} - {req.city} ({req.unitsNeeded} unit)
                        </p>
                        <p className="text-xs text-slate-600">
                          Required:{" "}
                          {req.requiredDate ? new Date(req.requiredDate).toLocaleDateString() : "N/A"} -{" "}
                          Status: {req.status}
                        </p>
                      </div>
                      <Link
                        to={`/requests?focus=${req._id}`}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
