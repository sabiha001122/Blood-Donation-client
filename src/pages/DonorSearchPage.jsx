// Public donor search page for recipients/admins to find matching donors with details.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import Select from "../components/UI/Select";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import { useAuth } from "../context/AuthContext";

const BLOOD_GROUP_OPTIONS = [
  { label: "A+", value: "A+" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B-", value: "B-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
  { label: "O+", value: "O+" },
  { label: "O-", value: "O-" },
];

function DonorSearchPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [filters, setFilters] = useState({
    bloodGroup: "",
    city: "",
    willing: "true",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setSelectedDonor(null);
    try {
      const params = {};
      if (filters.bloodGroup) params.bloodGroup = filters.bloodGroup;
      if (filters.city) params.city = filters.city;
      if (filters.willing) params.willing = filters.willing;

      const res = await api.get("/donors/search", { params });
      setResults(res.data.data || []);
    } catch (err) {
      console.error("Search failed", err);
      setError("Could not search donors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">Find Donors</h1>
        <p className="text-sm text-slate-600 mb-4">
          Search publicly available donor profiles by blood group and city. Phone may be hidden unless
          the donor allows it; admins see all.
        </p>

        <div className="grid md:grid-cols-4 gap-4">
          <Select
            label="Blood Group"
            name="bloodGroup"
            value={filters.bloodGroup}
            onChange={handleChange}
            options={BLOOD_GROUP_OPTIONS}
            placeholder="Any"
          />
          <Input
            label="City"
            name="city"
            value={filters.city}
            onChange={handleChange}
            placeholder="e.g., Dhaka"
          />
          <Select
            label="Willing"
            name="willing"
            value={filters.willing}
            onChange={handleChange}
            options={[
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ]}
            placeholder="Any"
          />
          <div className="flex items-end md:col-span-1">
            <Button className="w-full" onClick={handleSearch}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {error ? <p className="text-sm text-red-500 mt-3">{error}</p> : null}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Results</h2>
          <span className="text-sm text-slate-500">{results.length} match(es)</span>
        </div>
        {results.length === 0 ? (
          <p className="text-sm text-slate-600 mt-3">
            {loading ? "Searching..." : "No donors found. Adjust filters and try again."}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {results.map((d) => (
              <button
                key={d._id || d.id}
                type="button"
                onClick={() => {
                  // If authenticated, /donors/:id is protected; otherwise router will redirect to login.
                  navigate(`/donors/${d._id || d.id}`);
                }}
                className="text-left p-4 rounded-lg border border-slate-100 bg-slate-50 hover:border-red-200 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{d.fullName}</p>
                    <p className="text-sm text-slate-600">
                      {d.bloodGroup} · {d.address?.city || "Unknown city"}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    {d.willingToDonate ? "Willing" : "Not willing"}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Phone: {d.phone && (isAuthenticated || isAdmin) ? d.phone : "Hidden (login to view if allowed)"}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    {d.eligibility?.eligible
                      ? "Eligible now"
                      : `Wait ${d.eligibility?.daysUntilEligible ?? "?"} days`}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    Donations: {d.totalDonations ?? 0}
                  </span>
                </div>
                {d.notes ? <p className="text-xs text-slate-500 mt-1">Note: {d.notes}</p> : null}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedDonor ? (
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-slate-900">Donor Details</h3>
            <button
              className="text-sm text-red-500 hover:underline"
              onClick={() => setSelectedDonor(null)}
            >
              Close
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <p className="text-lg font-semibold">{selectedDonor.fullName}</p>
              <p className="text-sm text-slate-600">
                {selectedDonor.bloodGroup} · {selectedDonor.address?.city || "Unknown city"}
              </p>
              <p className="text-sm text-slate-700 mt-1">
                Phone:{" "}
                {selectedDonor.phone
                  ? selectedDonor.phone
                  : "Hidden (privacy setting or not allowed)"}
              </p>
              <p className="text-sm text-slate-700">
                Total donations: {selectedDonor.totalDonations ?? 0}
              </p>
              <p className="text-sm text-slate-700">
                Last donation:{" "}
                {selectedDonor.lastDonationDate
                  ? new Date(selectedDonor.lastDonationDate).toLocaleDateString()
                  : "No records"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="px-3 py-2 rounded-md border bg-slate-50 text-sm">
                <p className="font-semibold text-slate-800 mb-1">Eligibility (90-day rule)</p>
                {selectedDonor.eligibility?.eligible ? (
                  <p className="text-green-700">Eligible to donate now.</p>
                ) : (
                  <p className="text-slate-700">
                    Not eligible yet. Wait {selectedDonor.eligibility?.daysUntilEligible ?? "?"} days.
                  </p>
                )}
              </div>
              {selectedDonor.notes ? (
                <div className="px-3 py-2 rounded-md border bg-slate-50 text-sm">
                  <p className="font-semibold text-slate-800 mb-1">Notes</p>
                  <p className="text-slate-700">{selectedDonor.notes}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DonorSearchPage;
