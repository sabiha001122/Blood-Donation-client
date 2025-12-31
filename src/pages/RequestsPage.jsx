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

const STATUS_LABELS = {
  open: "Open",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

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

  const statusCounts = requests.reduce(
    (acc, req) => {
      const status = req.status || "open";
      if (acc[status] !== undefined) {
        acc[status] += 1;
      }
      return acc;
    },
    { open: 0, fulfilled: 0, cancelled: 0 }
  );

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
          <h1 className="text-3xl font-semibold text-slate-900 font-display">
            {isAdmin ? "All Requests" : "My Requests"}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="rounded-full bg-white/80 border border-white/70 px-4 py-2 text-xs text-slate-500 shadow-sm">
            Total: <span className="font-semibold text-slate-900">{requests.length}</span>
          </div>
          <div className="rounded-full bg-emerald-50 border border-emerald-100 px-4 py-2 text-xs text-emerald-700">
            Open: <span className="font-semibold">{statusCounts.open}</span>
          </div>
          <div className="rounded-full bg-amber-50 border border-amber-100 px-4 py-2 text-xs text-amber-700">
            Fulfilled: <span className="font-semibold">{statusCounts.fulfilled}</span>
          </div>
          <div className="rounded-full bg-slate-100 border border-slate-200 px-4 py-2 text-xs text-slate-600">
            Cancelled: <span className="font-semibold">{statusCounts.cancelled}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)] gap-6">
        <div className="space-y-6">
          <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Create Request</h2>
                <p className="text-sm text-slate-500">Add a new blood request for matching.</p>
              </div>
            </div>
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
                label="Hospital"
                name="hospital"
                value={form.hospital}
                onChange={handleChange}
                placeholder="Hospital/clinic name"
              />
              <Input
                label="Patient Name"
                name="patientName"
                value={form.patientName}
                onChange={handleChange}
                placeholder="Patient name"
              />
              <Input
                label="Notes"
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

          <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Request List</h2>
                <p className="text-sm text-slate-500">Select a request to view matching donors.</p>
              </div>
              {loading ? <span className="text-sm text-slate-500">Loading...</span> : null}
            </div>
            {error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : requests.length === 0 ? (
              <p className="text-sm text-slate-600">No requests yet.</p>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req._id}
                    className={`rounded-2xl border p-4 space-y-3 transition ${
                      selectedRequestId === req._id
                        ? "border-red-200 bg-red-50/60"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Request {req.requestNumber ? `#${req.requestNumber}` : ""}
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {req.bloodGroup} - {req.unitsNeeded} unit{req.unitsNeeded > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-slate-600">
                          {req.city} | Needed {req.requiredDate ? new Date(req.requiredDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            req.status === "fulfilled"
                              ? "bg-emerald-100 text-emerald-700"
                              : req.status === "cancelled"
                              ? "bg-slate-200 text-slate-600"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {STATUS_LABELS[req.status || "open"]}
                        </span>
                        <Button onClick={() => handleViewMatches(req._id)} className="px-3 py-2">
                          View Matches
                        </Button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                      <div>Contact: {req.contactPhone}</div>
                      <div>Hospital: {req.hospital || "Not specified"}</div>
                      <div>Patient: {req.patientName || "Not specified"}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-500">Update status:</span>
                      {Object.keys(STATUS_LABELS).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(req._id, status)}
                          className={`px-3 py-1 rounded-full border text-xs font-semibold transition ${
                            req.status === status
                              ? "bg-slate-900 text-white border-slate-900"
                              : "border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {STATUS_LABELS[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div
            ref={matchesSectionRef}
            className="bg-white/90 border border-slate-200 rounded-2xl shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <p className="text-xs text-slate-500">Matches</p>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedRequest
                    ? `${selectedRequest.bloodGroup} in ${selectedRequest.city} (${selectedRequest.unitsNeeded} unit${
                        selectedRequest.unitsNeeded > 1 ? "s" : ""
                      })`
                    : "Select a request to view matches"}
                </h2>
              </div>
              <span className="text-sm text-slate-500">
                {matchesLoading ? "Loading..." : `${Array.isArray(matches) ? matches.length : 0} match(es)`}
                {selectedRequestId ? " for selected request" : ""}
              </span>
            </div>
            {!Array.isArray(matches) || matches.length === 0 ? (
              <p className="text-sm text-slate-600">
                {matchesLoading ? "Looking up donors..." : "No matches yet. Create or select a request."}
              </p>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <button
                    key={m._id || m.id}
                    type="button"
                    onClick={() => setSelectedDonor(m)}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-red-200 hover:bg-white transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{m.fullName}</p>
                        <p className="text-sm text-slate-600">
                          {m.bloodGroup} - {m.address?.city || "Unknown city"}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-900 text-white">
                        {m.willingToDonate ? "Willing" : "Not willing"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Phone: {m.phone ? m.phone : "Hidden (privacy setting)"}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
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
            <div className="bg-white/95 border border-red-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <h3 className="text-lg font-semibold text-slate-900">Donor Details</h3>
                <button
                  className="text-sm text-slate-500 hover:text-red-500"
                  onClick={() => setSelectedDonor(null)}
                >
                  Close
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{selectedDonor.fullName}</p>
                  <p className="text-sm text-slate-600">
                    {selectedDonor.bloodGroup} - {selectedDonor.address?.city || "Unknown city"}
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    Phone: {selectedDonor.phone ? selectedDonor.phone : "Hidden (privacy setting)"}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
                  <div>Total donations: {selectedDonor.totalDonations ?? 0}</div>
                  <div>
                    Last donation:{" "}
                    {selectedDonor.lastDonationDate
                      ? new Date(selectedDonor.lastDonationDate).toLocaleDateString()
                      : "No records"}
                  </div>
                </div>
                <div className="px-3 py-2 rounded-xl border bg-slate-50 text-sm">
                  <p className="font-semibold text-slate-800 mb-1">Eligibility (90-day rule)</p>
                  {selectedDonor.eligibility?.eligible ? (
                    <p className="text-emerald-700">Eligible to donate now.</p>
                  ) : (
                    <p className="text-slate-700">
                      Not eligible yet. Wait {selectedDonor.eligibility?.daysUntilEligible ?? "?"} days.
                    </p>
                  )}
                </div>
                {selectedDonor.notes ? (
                  <div className="px-3 py-2 rounded-xl border bg-slate-50 text-sm">
                    <p className="font-semibold text-slate-800 mb-1">Notes</p>
                    <p className="text-slate-700">{selectedDonor.notes}</p>
                  </div>
                ) : null}
                <Button onClick={() => navigate(`/donors/${selectedDonor._id || selectedDonor.id}`)}>
                  Open full profile
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default RequestsPage;
