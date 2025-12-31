// Public donor search page for recipients/admins to find matching donors with details.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import Select from "../components/UI/Select";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import { useAuth } from "../context/AuthContext";
import { BD_CITIES } from "../data/bdCities";

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

const getAvatarUrl = (donor) => {
  const seed = donor?.fullName || donor?.email || "donor";
  return donor?.profilePicture || `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;
};

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
  const [hasSearched, setHasSearched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setHasSearched(true);
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

  const handleReset = () => {
    setFilters({ bloodGroup: "", city: "", willing: "true" });
    setResults([]);
    setError("");
    setHasSearched(false);
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-white/90 rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-amber-100/80 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-rose-100/80 blur-2xl" />
        <div className="relative">
          <p className="text-sm text-slate-500">Donor directory</p>
          <h1 className="text-3xl font-semibold text-slate-900 font-display">Find Donors</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Search publicly visible donor profiles by blood group and city. Admins can view every
            profile, and donors decide if their phone number is public.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600">
              Live availability
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600">
              90-day eligibility rule
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600">
              Privacy-respecting contact
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-6">
        <aside className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5 lg:sticky lg:top-28 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Search Filters</h2>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Reset
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Use filters to narrow down the best donors for your request.
          </p>
          <div className="mt-4 grid gap-4">
            <Select
              label="Blood Group"
              name="bloodGroup"
              value={filters.bloodGroup}
              onChange={handleChange}
              options={BLOOD_GROUP_OPTIONS}
              placeholder="Any"
            />
            <div>
              <Input
                label="City"
                name="city"
                value={filters.city}
                onChange={handleChange}
                placeholder="e.g., Dhaka"
                list="bd-cities"
              />
              <datalist id="bd-cities">
                {BD_CITIES.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            <Select
              label="Willing to donate"
              name="willing"
              value={filters.willing}
              onChange={handleChange}
              options={[
                { label: "Yes", value: "true" },
                { label: "No", value: "false" },
                { label: "Any", value: "" },
              ]}
              placeholder="Any"
            />
            <Button className="w-full" onClick={handleSearch}>
              {loading ? "Searching..." : "Search donors"}
            </Button>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
          </div>
        </aside>

        <section className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Results</h2>
              <p className="text-xs text-slate-500">
                {hasSearched
                  ? "Showing the latest matches based on your filters."
                  : "Run a search to see matching donors."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {results.length} donors
              </span>
              {loading ? (
                <span className="text-xs text-slate-500">Searching...</span>
              ) : null}
            </div>
          </div>

          {results.length === 0 ? (
            <div className="mt-6 text-sm text-slate-600">
              {loading
                ? "Searching for donors..."
                : hasSearched
                ? "No donors found. Try adjusting your filters."
                : "Use the filters on the left to start searching."}
            </div>
          ) : (
            <div className="mt-5 grid md:grid-cols-2 gap-4">
              {results.map((d) => {
                const avatarUrl = getAvatarUrl(d);
                const showPhone = d.phone && (isAuthenticated || isAdmin);
                return (
                  <button
                    key={d._id || d.id}
                    type="button"
                    onClick={() => navigate(`/donors/${d._id || d.id}`)}
                    className="text-left p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-red-200 hover:bg-white transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#d62828] to-[#f08c3b] text-white flex items-center justify-center overflow-hidden border border-white/60 shadow-sm">
                          <img
                            src={avatarUrl}
                            alt={d.fullName ? `${d.fullName} profile` : "Donor profile"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-slate-900">{d.fullName}</p>
                          <p className="text-sm text-slate-600">
                            {d.bloodGroup} - {d.address?.city || "Unknown city"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          d.willingToDonate
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {d.willingToDonate ? "Willing" : "Not willing"}
                      </span>
                    </div>

                    <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                      <div>Phone: {showPhone ? d.phone : "Hidden (login to view if allowed)"}</div>
                      <div>
                        Eligibility:{" "}
                        {d.eligibility?.eligible
                          ? "Eligible now"
                          : `Wait ${d.eligibility?.daysUntilEligible ?? "?"} days`}
                      </div>
                      <div>Donations: {d.totalDonations ?? 0}</div>
                      <div>Visibility: {d.visibility || "public"}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DonorSearchPage;
