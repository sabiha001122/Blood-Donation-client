// RequestFeedPage shows open blood requests like a feed with an "Offer help" contact flow.
import { useEffect, useState } from "react";
import api from "../api/apiClient";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";

function RequestFeedPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactingId, setContactingId] = useState(null);
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");

  const loadFeed = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/requests/feed");
      setRequests(res.data.data || []);
    } catch (err) {
      setError("Could not load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleContact = async (requestId) => {
    try {
      setContactStatus("");
      setContactingId(requestId);
      await api.post(`/requests/${requestId}/contact`, { message: contactMessage });
      setContactStatus("Message sent to requester.");
      setContactMessage("");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not send message.";
      setContactStatus(msg);
    } finally {
      setContactingId(null);
    }
  };

  if (loading) return <div className="text-slate-700">Loading feed...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm text-slate-500">Help others</p>
          <h1 className="text-3xl font-semibold text-slate-900">Blood Requests Feed</h1>
        </div>
        <Button variant="secondary" onClick={loadFeed}>
          Refresh
        </Button>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {requests.length === 0 ? (
        <p className="text-sm text-slate-600">No open requests right now.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req._id} className="p-4 rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {req.bloodGroup} · {req.city} ({req.unitsNeeded} unit{req.unitsNeeded > 1 ? "s" : ""})
                  </p>
                  <p className="text-sm text-slate-600">
                    Required: {req.requiredDate ? new Date(req.requiredDate).toLocaleDateString() : "N/A"}{" "}
                    · Status: {req.status}
                  </p>
                  <p className="text-xs text-slate-500">
                    Contact phone: {req.contactPhone} {req.hospital ? `· ${req.hospital}` : ""}
                  </p>
                  {req.patientName ? (
                    <p className="text-xs text-slate-500">Patient: {req.patientName}</p>
                  ) : null}
                </div>
                <Button
                  onClick={() => setContactingId(req._id === contactingId ? null : req._id)}
                  variant="secondary"
                >
                  {req._id === contactingId ? "Cancel" : "Offer help"}
                </Button>
              </div>

              {req._id === contactingId ? (
                <div className="mt-3 space-y-2">
                  <Input
                    label="Message"
                    name="contactMessage"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Explain how you can help; include your contact."
                  />
                  <Button onClick={() => handleContact(req._id)} disabled={!contactMessage}>
                    Send to requester
                  </Button>
                  {contactStatus ? (
                    <p className="text-sm text-slate-600">{contactStatus}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RequestFeedPage;
