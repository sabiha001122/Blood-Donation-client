// DonorsPage lists donors, provides filters, and lets users add new donors.
import { useEffect, useState } from "react";
import api from "../api/apiClient";
import DonorTable from "../components/Donors/DonorTable";
import DonorForm from "../components/Donors/DonorForm";
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

function DonorsPage() {
  const { isAdmin } = useAuth();
  const [donors, setDonors] = useState([]);
  const [myDonor, setMyDonor] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ bloodGroup: "", city: "", willing: "" });
  const [showForm, setShowForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState("");

  // Admin: fetch all donors; User: fetch own profile.
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      if (isAdmin) {
        const params = {};
        if (filters.bloodGroup) params.bloodGroup = filters.bloodGroup;
        if (filters.city) params.city = filters.city;
        if (filters.willing) params.willing = filters.willing;

        const res = await api.get("/donors", { params });
        setDonors(res.data.data || []);
      } else {
        const res = await api.get("/donors/me");
        setMyDonor(res.data.data || res.data);
      }
    } catch (err) {
      // If user has no donor profile yet, /donors/me may 404.
      if (!isAdmin) {
        setMyDonor(null);
      } else {
        setError("Could not load donors. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDonor = async (data) => {
    try {
      await api.post("/donors", data);
      setShowForm(false);
      fetchData();
    } catch (err) {
      const message = err.response?.data?.message || "Unable to add donor.";
      alert(message);
    }
  };

  const handleUpdateDonor = async (data) => {
    if (!myDonor?._id) return;
    try {
      await api.put(`/donors/${myDonor._id}`, data);
      setShowEdit(false);
      fetchData();
    } catch (err) {
      const message = err.response?.data?.message || "Unable to update donor.";
      alert(message);
    }
  };

  const fetchEligibility = async () => {
    if (!myDonor?._id) return;
    try {
      const res = await api.get(`/donors/${myDonor._id}/eligibility`);
      setEligibility(res.data);
    } catch (err) {
      alert("Could not fetch eligibility.");
    }
  };

  // --- Admin view ---
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm text-slate-500">Manage donors</p>
            <h1 className="text-3xl font-semibold text-slate-900">Donors (admin)</h1>
          </div>
          <Button onClick={() => setShowForm((p) => !p)}>
            {showForm ? "Close Form" : "Add Donor"}
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Select
              label="Blood Group"
              name="bloodGroup"
              value={filters.bloodGroup}
              onChange={handleFilterChange}
              options={BLOOD_GROUP_OPTIONS}
              placeholder="Any"
            />
            <Input
              label="City"
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              placeholder="Dhaka"
            />
            <Select
              label="Willing"
              name="willing"
              value={filters.willing}
              onChange={handleFilterChange}
              options={[
                { label: "Yes", value: "true" },
                { label: "No", value: "false" },
              ]}
              placeholder="Any"
            />
            <div className="flex items-end">
              <Button className="w-full" onClick={fetchData}>
                Filter
              </Button>
            </div>
          </div>
          {showForm ? (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <DonorForm allowUserId onSubmit={handleAddDonor} onCancel={() => setShowForm(false)} />
              <p className="text-xs text-slate-500 mt-2">
                One donor profile per user. Leave User ID empty to create for yourself; fill to create
                on behalf of a user.
              </p>
            </div>
          ) : null}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Donor List</h2>
            {loading ? <span className="text-sm text-slate-500">Loading...</span> : null}
          </div>
          {error ? <p className="text-sm text-red-500 mb-2">{error}</p> : null}
          <DonorTable donors={donors} />
        </div>
      </div>
    );
  }

  // --- User view ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-slate-500">Your donor profile</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {myDonor ? "My Donor Profile" : "Become a Donor"}
          </h1>
        </div>
        {myDonor ? (
          <Button onClick={fetchEligibility}>Check Eligibility</Button>
        ) : null}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
        {loading ? <p className="text-sm text-slate-600">Loading...</p> : null}

        {!myDonor && !loading ? (
          <>
            <p className="text-sm text-slate-600">
              You have not created a donor profile yet. Create one to make yourself available for
              matches.
            </p>
            <DonorForm onSubmit={handleAddDonor} />
          </>
        ) : null}

        {myDonor ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{myDonor.fullName}</h2>
                <p className="text-sm text-slate-600">
                  {myDonor.bloodGroup} · {myDonor.address?.city || "No city set"}
                </p>
                <p className="text-xs text-slate-500">
                  Visibility: {myDonor.visibility || "public"} · Phone:{" "}
                  {myDonor.phoneVisibility || "public"}
                </p>
              </div>
              <Button onClick={() => setShowEdit((p) => !p)}>
                {showEdit ? "Cancel" : "Edit Profile"}
              </Button>
            </div>

            {eligibility ? (
              <div
                className={`px-4 py-3 rounded-lg border ${
                  eligibility.eligible
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                <p className="font-semibold">
                  {eligibility.eligible ? "You are eligible to donate" : "Not eligible yet"}
                </p>
                {eligibility.daysUntilEligible != null && !eligibility.eligible ? (
                  <p className="text-sm">
                    Days until eligible: {eligibility.daysUntilEligible} — {eligibility.reason}
                  </p>
                ) : null}
              </div>
            ) : null}

            {!showEdit ? (
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <p className="text-slate-500">Phone</p>
                  <p className="font-semibold text-slate-900">{myDonor.phone}</p>
                  <p className="text-xs text-slate-500">
                    Phone visibility: {myDonor.phoneVisibility || "public"}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <p className="text-slate-500">Emergency Contact</p>
                  <p className="font-semibold text-slate-900">
                    {myDonor.emergencyContactName} ({myDonor.emergencyContactPhone})
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <p className="text-slate-500">Willing</p>
                  <p className="font-semibold text-slate-900">
                    {myDonor.willingToDonate ? "Yes" : "No"}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <p className="text-slate-500">Total Donations</p>
                  <p className="font-semibold text-slate-900">{myDonor.totalDonations || 0}</p>
                </div>
              </div>
            ) : (
              <DonorForm initialValues={myDonor} onSubmit={handleUpdateDonor} />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DonorsPage;
