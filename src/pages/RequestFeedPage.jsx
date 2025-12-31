// RequestFeedPage shows open blood requests like a feed with an "Offer help" contact flow.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import { BD_CITIES } from "../data/bdCities";

function RequestFeedPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [city, setCity] = useState("");
  const [activeTab, setActiveTab] = useState("requests");
  const [contactingId, setContactingId] = useState(null);
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [sharingIds, setSharingIds] = useState(() => new Set());
  const [lastChatId, setLastChatId] = useState("");

  const loadFeed = async (cityOverride) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      const nextCity = (cityOverride ?? city).trim();
      if (nextCity) params.city = nextCity;
      const res = await api.get("/requests/feed", { params });
      setRequests((res.data.data || []).filter((r) => (r.status || "open") === "open"));
      const metaCity = res.data?.meta?.city;
      if (!nextCity && metaCity) {
        setCity(metaCity);
      }
    } catch (err) {
      setError("Could not load requests.");
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (err) {
      // Notifications should not block the feed.
    }
  };

  useEffect(() => {
    loadFeed();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (activeTab === "notifications") {
      loadNotifications();
    }
  }, [activeTab]);

  const handleContact = async (requestId) => {
    try {
      setContactStatus("");
      setContactingId(requestId);
      const res = await api.post(`/requests/${requestId}/contact`, { message: contactMessage });
      setContactStatus("Message sent to requester.");
      setLastChatId(res.data?.data?.chatId || "");
      setContactMessage("");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not send message.";
      setContactStatus(msg);
    } finally {
      setContactingId(null);
    }
  };

  const handleShareInfo = async (requestId) => {
    if (sharingIds.has(requestId)) return;
    setShareStatus("");
    setSharingIds((prev) => {
      const next = new Set(prev);
      next.add(requestId);
      return next;
    });
    try {
      const res = await api.post(`/requests/${requestId}/share-info`, {});
      setShareStatus(res.data?.message || "Shared contact details with requester.");
      await loadNotifications();
    } catch (err) {
      const msg = err.response?.data?.message || "Could not share info right now.";
      setShareStatus(msg);
    } finally {
      setSharingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      // Ignore delete errors for now.
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
        <div className="flex items-center gap-2">
          <Input
            label="City"
            name="feedCity"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Any city"
            list="feed-bd-cities"
          />
          <datalist id="feed-bd-cities">
            {BD_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <button
            onClick={() => loadFeed(city)}
            className="mt-6 px-4 py-2 rounded-md text-sm border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
          >
            Apply
          </button>
          <button
            onClick={() => {
              loadFeed(city);
              loadNotifications();
            }}
            className="mt-6 px-4 py-2 rounded-md text-sm bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            activeTab === "requests"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Request offers
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {requests.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            activeTab === "notifications"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Notifications
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {notifications.length}
          </span>
        </button>
      </div>

      {activeTab === "notifications" ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-600">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const request = notif?.meta?.request || {};
                const donor = notif?.meta?.donor || {};
                return (
                  <div key={notif._id} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-slate-500">{notif.type || "notification"}</p>
                        <p className="text-base font-semibold text-slate-900">
                          {notif.title || "New notification"}
                        </p>
                        <p className="text-sm text-slate-700">{notif.message || ""}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notif._id)}
                        className="text-xs text-slate-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-slate-700 space-y-1">
                      {request?.bloodGroup ? (
                        <p>
                          Request: {request.bloodGroup} - {request.unitsNeeded || 0} unit(s) -{" "}
                          {request.city || "N/A"}
                        </p>
                      ) : null}
                      {request?.hospital ? <p>Hospital: {request.hospital}</p> : null}
                      {request?.patientName ? <p>Patient: {request.patientName}</p> : null}
                      {request?.requiredDate ? (
                        <p>Needed on: {new Date(request.requiredDate).toLocaleDateString()}</p>
                      ) : null}
                      {request?.contactPhone ? <p>Requester phone: {request.contactPhone}</p> : null}
                      {donor?.fullName ? (
                        <p>
                          Donor: {donor.fullName} - {donor.bloodGroup || ""} - {donor.city || ""}
                        </p>
                      ) : null}
                      {donor?.phone ? <p>Phone: {donor.phone}</p> : null}
                      {donor?.email ? <p>Email: {donor.email}</p> : null}
                      {donor?.emergencyContactName ? (
                        <p>
                          Emergency: {donor.emergencyContactName} ({donor.emergencyContactPhone || ""})
                        </p>
                      ) : null}
                      {donor?.contactPreference ? <p>Prefers: {donor.contactPreference}</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {shareStatus ? <p className="text-sm text-slate-600">{shareStatus}</p> : null}

          {requests.length === 0 ? (
            <p className="text-sm text-slate-600">No open requests right now.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req._id} className="p-4 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {req.bloodGroup} A? {req.city} ({req.unitsNeeded} unit{req.unitsNeeded > 1 ? "s" : ""})
                      </p>
                      <p className="text-sm text-slate-600">
                        Required: {req.requiredDate ? new Date(req.requiredDate).toLocaleDateString() : "N/A"} A?
                        Status: {req.status}
                      </p>
                      <p className="text-xs text-slate-500">
                        Contact phone: {req.contactPhone} {req.hospital ? `A? ${req.hospital}` : ""}
                      </p>
                      {req.patientName ? (
                        <p className="text-xs text-slate-500">Patient: {req.patientName}</p>
                      ) : null}
                    </div>
                    <Button onClick={() => setContactingId(req._id === contactingId ? null : req._id)}>
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
                        <div className="text-sm text-slate-600 flex items-center gap-2 flex-wrap">
                          <span>{contactStatus}</span>
                          {lastChatId ? (
                            <button
                              type="button"
                              onClick={() => navigate(`/inbox?chat=${lastChatId}`)}
                              className="text-sm text-red-600 hover:text-red-700 font-semibold"
                            >
                              Open inbox
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-xs text-slate-500">
                      Share info sends your phone/email to this requester instantly (even if your profile is hidden).
                    </p>
                    <button
                      onClick={() => handleShareInfo(req._id)}
                      disabled={sharingIds.has(req._id)}
                      className="px-3 py-2 rounded-md text-sm border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                    >
                      {sharingIds.has(req._id) ? "Sharing..." : "Share info"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RequestFeedPage;
