// RequestsPage handles blood requests creation, listing, and donor matches with inline detail view.
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Select from "../components/UI/Select";

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

function RequestsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchesSectionRef = useRef(null);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [form, setForm] = useState({
    bloodGroup: "",
    city: "",
    unitsNeeded: 1,
    requiredDate: "",
    contactPhone: "",
    hospital: "",
    patientName: "",
    notes: "",
  });

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(isAdmin ? "/requests" : "/requests/me");
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Failed to load requests", err);
      setError("Could not load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // If focus query param is present, auto-load matches for that request after requests load.
  useEffect(() => {
    const focusId = searchParams.get("focus");
    if (focusId && requests.length > 0) {
      handleViewMatches(focusId);
    }
  }, [searchParams, requests]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/requests", form);
      const payload = res.data?.data || {};
      const payloadMatches = payload.matches || payload.safeDonors || res.data?.matches || [];
      const reqData = payload.request || null;
      setSelectedRequestId(reqData?._id || null);
      setSelectedRequest(reqData);
      const matchArray = Array.isArray(payloadMatches)
        ? payloadMatches
        : Array.isArray(payloadMatches?.safeDonors)
        ? payloadMatches.safeDonors
        : [];
      setMatches(matchArray);
      setSelectedDonor(null);
      setForm({
        bloodGroup: "",
        city: "",
        unitsNeeded: 1,
        requiredDate: "",
        contactPhone: "",
        hospital: "",
        patientName: "",
        notes: "",
      });
      loadRequests();
      if (matchesSectionRef.current) {
        matchesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Could not create request.";
      setError(msg);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/requests/${id}/status`, { status });
      loadRequests();
    } catch (err) {
      alert("Could not update status.");
    }
  };

  const handleViewMatches = async (id) => {
    try {
      setMatchesLoading(true);
      setSelectedRequestId(id);
      const reqObj = requests.find((r) => r._id === id) || null;
      setSelectedRequest(reqObj);
      const res = await api.get(`/requests/${id}/matches`);
      const payload = res.data?.data || {};
      const payloadMatches = payload.safeDonors || payload.matches || payload || [];
      setMatches(
        Array.isArray(payloadMatches)
          ? payloadMatches
          : Array.isArray(payloadMatches?.safeDonors)
          ? payloadMatches.safeDonors
          : []
      );
      setSelectedDonor(null);
      if (matchesSectionRef.current) {
        matchesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err) {
      alert("Could not fetch matches.");
    } finally {
      setMatchesLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-slate-500">Blood requests</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {isAdmin ? "All Requests" : "My Requests"}
          </h1>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Create Request</h2>
        {error ? <p className="text-sm text-red-500 mb-2">{error}</p> : null}
        <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <Select
            label="Blood Group"
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            options={BLOOD_GROUP_OPTIONS}
            placeholder="Select blood group"
            required
          />
          <Input
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City"
            required
          />
          <Input
            label="Units Needed"
            name="unitsNeeded"
            type="number"
            min={1}
            value={form.unitsNeeded}
            onChange={handleChange}
            required
          />
          <Input
            label="Required Date"
            name="requiredDate"
            type="date"
            value={form.requiredDate}
            onChange={handleChange}
            required
          />
          <Input
            label="Contact Phone"
            name="contactPhone"
            value={form.contactPhone}
            onChange={handleChange}
            placeholder="Contact number for coordination"
            required
          />
          <Input
            label="Hospital (optional)"
            name="hospital"
            value={form.hospital}
            onChange={handleChange}
            placeholder="Hospital/clinic name"
          />
          <Input
            label="Patient Name (optional)"
            name="patientName"
            value={form.patientName}
            onChange={handleChange}
            placeholder="Patient name"
          />
          <Input
            label="Notes (optional)"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any notes..."
          />
          <div className="md:col-span-2">
            <Button type="submit">Create Request</Button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Requests</h2>
          {loading ? <span className="text-sm text-slate-500">Loading...</span> : null}
        </div>
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-600">No requests yet.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className={`p-4 rounded-lg border flex flex-col gap-2 ${
                  selectedRequestId === req._id ? "border-red-300 bg-red-50/50" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {req.bloodGroup} needed ({req.unitsNeeded} unit(s))
                    </p>
                    <p className="text-sm text-slate-600">
                      {req.city} · Required:{" "}
                      {req.requiredDate ? new Date(req.requiredDate).toLocaleDateString() : "N/A"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Contact: {req.contactPhone} {req.hospital ? `· ${req.hospital}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs capitalize bg-slate-100 text-slate-700">
                      {req.status || "open"}
                    </span>
                    <Button onClick={() => handleViewMatches(req._id)} className="px-3 py-2">
                      Matches
                    </Button>
                  </div>
                </div>
                {req.notes ? <p className="text-xs text-slate-500">Notes: {req.notes}</p> : null}
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="text-slate-500">Update status:</span>
                  {["open", "fulfilled", "cancelled"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(req._id, status)}
                      className={`px-3 py-1 rounded-md border text-xs ${
                        req.status === status
                          ? "bg-red-500 text-white border-red-500"
                          : "border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        ref={matchesSectionRef}
        className="bg-white border border-slate-200 rounded-xl shadow-sm p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-slate-500">Matches</p>
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedRequest
                ? `For ${selectedRequest.bloodGroup} in ${selectedRequest.city} (${selectedRequest.unitsNeeded} unit${
                    selectedRequest.unitsNeeded > 1 ? "s" : ""
                  })`
                : "Select a request to view matches"}
            </h2>
          </div>
          <span className="text-sm text-slate-500">
            {matchesLoading ? "Loading..." : `${Array.isArray(matches) ? matches.length : 0} match(es)`}{" "}
            {selectedRequestId ? "for selected request" : ""}
          </span>
        </div>
        {!Array.isArray(matches) || matches.length === 0 ? (
          <p className="text-sm text-slate-600">
            {matchesLoading ? "Looking up donors..." : "No matches yet. Create or select a request."}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {matches.map((m) => (
              <button
                key={m._id || m.id}
                type="button"
                onClick={() => setSelectedDonor(m)}
                className="text-left p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-red-200 hover:shadow-sm transition"
              >
                <p className="text-lg font-semibold text-slate-900">{m.fullName}</p>
                <p className="text-sm text-slate-600">
                  {m.bloodGroup} · {m.address?.city || "Unknown city"}
                </p>
                <p className="text-sm text-slate-700">
                  Phone: {m.phone ? m.phone : "Hidden (privacy setting)"}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {m.willingToDonate ? "Willing" : "Not willing"}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    {m.eligibility?.eligible
                      ? "Eligible now"
                      : `Wait ${m.eligibility?.daysUntilEligible ?? "?"} days`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedDonor ? (
        <div className="bg-white border border-red-200 rounded-xl shadow p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
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

export default RequestsPage;
