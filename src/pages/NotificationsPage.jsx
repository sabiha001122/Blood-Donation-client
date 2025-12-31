// NotificationsPage lists recent notifications for the logged-in user and allows marking read.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import Button from "../components/UI/Button";

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageDetail, setMessageDetail] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (err) {
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      // ignore
    }
  };

  const viewRequest = (requestId) => {
    if (!requestId) return;
    navigate(`/requests?focus=${requestId}`);
  };

  const viewContact = async (contactId, requestId) => {
    if (!contactId) return;
    try {
      const res = await api.get(`/contact/${contactId}`);
      setMessageDetail({ type: "contact", data: res.data.data, requestId });
    } catch (err) {
      setMessageDetail({ type: "contact", error: "Could not load contact message." });
    }
  };

  const viewRequestMessage = async (messageId, requestId) => {
    if (!messageId) return;
    try {
      const res = await api.get(`/requests/messages/${messageId}`);
      setMessageDetail({ type: "request", data: res.data.data, requestId });
    } catch (err) {
      setMessageDetail({ type: "request", error: "Could not load request message." });
    }
  };

  if (loading) return <div className="text-slate-700">Loading notifications...</div>;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Inbox</p>
        <h1 className="text-3xl font-semibold text-slate-900">Notifications</h1>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {notifications.length === 0 ? (
        <p className="text-sm text-slate-600">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-3 rounded-md border ${
                n.read ? "border-slate-200" : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{n.type}</p>
                  <p className="text-base font-semibold text-slate-900">{n.title || "Notification"}</p>
                </div>
                {!n.read ? (
                  <Button size="sm" onClick={() => markRead(n._id)}>
                    Mark read
                  </Button>
                ) : null}
              </div>
              <p className="text-sm text-slate-700 mt-1">{n.message}</p>
              <p className="text-xs text-slate-500 mt-1">
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {n.meta?.requestId || n.meta?.request?.id ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => viewRequest(n.meta?.requestId || n.meta?.request?.id)}
                  >
                    View request
                  </Button>
                ) : null}
                {n.meta?.contactId ? (
                  <Button size="sm" variant="secondary" onClick={() => viewContact(n.meta.contactId, n.meta.requestId)}>
                    View message
                  </Button>
                ) : null}
                {n.meta?.requestMessageId ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => viewRequestMessage(n.meta.requestMessageId, n.meta.requestId)}
                  >
                    View message
                  </Button>
                ) : null}
              </div>
              {n.meta?.request ? (
                <div className="mt-2 text-sm text-slate-700 space-y-1">
                  <p>
                    Request: {n.meta.request.bloodGroup || ""} -{" "}
                    {n.meta.request.unitsNeeded || 0} unit(s) - {n.meta.request.city || "N/A"}
                  </p>
                  {n.meta.request.hospital ? <p>Hospital: {n.meta.request.hospital}</p> : null}
                  {n.meta.request.patientName ? <p>Patient: {n.meta.request.patientName}</p> : null}
                  {n.meta.request.requiredDate ? (
                    <p>Needed on: {new Date(n.meta.request.requiredDate).toLocaleDateString()}</p>
                  ) : null}
                  {n.meta.request.contactPhone ? <p>Requester phone: {n.meta.request.contactPhone}</p> : null}
                </div>
              ) : null}
              {n.meta?.donor ? (
                <div className="mt-2 text-sm text-slate-700 space-y-1">
                  <p>
                    Donor: {n.meta.donor.fullName || ""} - {n.meta.donor.bloodGroup || ""} -{" "}
                    {n.meta.donor.city || ""}
                  </p>
                  {n.meta.donor.phone ? <p>Phone: {n.meta.donor.phone}</p> : null}
                  {n.meta.donor.email ? <p>Email: {n.meta.donor.email}</p> : null}
                  {n.meta.donor.emergencyContactName ? (
                    <p>
                      Emergency: {n.meta.donor.emergencyContactName} (
                      {n.meta.donor.emergencyContactPhone || ""})
                    </p>
                  ) : null}
                  {n.meta.donor.contactPreference ? (
                    <p>Prefers: {n.meta.donor.contactPreference}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {messageDetail ? (
        <div className="p-3 rounded-md border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              {messageDetail.type === "request" ? "Request message" : "Contact message"}
            </h3>
            <button
              className="text-sm text-red-500 hover:underline"
              onClick={() => setMessageDetail(null)}
            >
              Close
            </button>
          </div>
          {messageDetail.error ? (
            <p className="text-sm text-red-500 mt-2">{messageDetail.error}</p>
          ) : (
            <div className="space-y-1 mt-2 text-sm text-slate-700">
              <p>
                <span className="font-semibold">From:</span>{" "}
                {messageDetail.data?.fromUser?.name || "Unknown"} (
                {messageDetail.data?.fromUser?.email || "N/A"})
              </p>
              <p>
                <span className="font-semibold">Message:</span> {messageDetail.data?.message}
              </p>
              {messageDetail.requestId ? (
                <Button size="sm" variant="secondary" onClick={() => viewRequest(messageDetail.requestId)}>
                  View related request
                </Button>
              ) : null}
              <p className="text-xs text-slate-500">
                {messageDetail.data?.createdAt ? new Date(messageDetail.data.createdAt).toLocaleString() : ""}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default NotificationsPage;
