// DonationsPage lists donation records with basic filters.
import { useEffect, useState } from "react";
import api from "../api/apiClient";
import Select from "../components/UI/Select";
import Input from "../components/UI/Input";
import { useAuth } from "../context/AuthContext";

function DonationsPage() {
  const { isAdmin } = useAuth();
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [filters, setFilters] = useState({
    donorId: "",
    institutionId: "",
    fromDate: "",
    toDate: "",
  });
  const [loading, setLoading] = useState(true);

  // Initial load of donors, institutions, and donations.
  useEffect(() => {
    const load = async () => {
      try {
        const [donorsRes, institutionsRes] = await Promise.all([
          api.get("/donors"),
          api.get("/institutions"),
        ]);
        setDonors(donorsRes.data.data || []);
        setInstitutions(institutionsRes.data.data || []);
      } catch (err) {
        console.error("Failed to load donors/institutions", err);
      }
      fetchDonations();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.donorId) params.donorId = filters.donorId;
      if (filters.institutionId) params.institutionId = filters.institutionId;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;

      const res = await api.get("/donations", { params });
      setDonations(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch donations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this donation record?");
    if (!confirmed) return;
    try {
      await api.delete(`/donations/${id}`);
      fetchDonations();
    } catch (err) {
      console.error("Failed to delete donation", err);
      alert("Could not delete. Please confirm the backend supports deleting donations.");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">All recorded donations</p>
        <h1 className="text-3xl font-semibold text-slate-900">Donations</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="grid md:grid-cols-5 gap-3">
          <Select
            label="Donor"
            name="donorId"
            value={filters.donorId}
            onChange={handleFilterChange}
            options={donors.map((d) => ({ label: d.fullName, value: d._id }))}
            placeholder="Any donor"
          />
          <Select
            label="Institution"
            name="institutionId"
            value={filters.institutionId}
            onChange={handleFilterChange}
            options={institutions.map((i) => ({ label: i.name, value: i._id }))}
            placeholder="Any institution"
          />
          <Input
            label="From"
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
          />
          <Input
            label="To"
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
          />
          <div className="flex items-end">
            <button
              onClick={fetchDonations}
              className="w-full px-4 py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Donation List</h2>
          {loading ? <span className="text-sm text-slate-500">Loading...</span> : null}
        </div>
        {donations.length === 0 ? (
          <p className="text-sm text-slate-600">No donations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-700">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Donor</th>
                  <th className="px-3 py-2">Blood Group</th>
                  <th className="px-3 py-2">Institution</th>
                  <th className="px-3 py-2">Units</th>
                  <th className="px-3 py-2">Location</th>
                  {isAdmin ? <th className="px-3 py-2 text-right">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      {new Date(d.donationDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">{d.donor?.fullName || "—"}</td>
                    <td className="px-3 py-2">{d.donor?.bloodGroup || "—"}</td>
                    <td className="px-3 py-2">{d.institution?.name || "—"}</td>
                    <td className="px-3 py-2">{d.units || 1}</td>
                    <td className="px-3 py-2">{d.location || "—"}</td>
                    {isAdmin ? (
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonationsPage;
