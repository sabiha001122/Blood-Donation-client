// DonorDetailPage shows donor information, eligibility, donation history, and contact form.
// Admins can record donations; all authenticated users can view full donor profiles.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/apiClient";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Select from "../components/UI/Select";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 text-right">{value || "N/A"}</span>
    </div>
  );
}

function DonorDetailPage() {
  const { id } = useParams();
  const [donor, setDonor] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [donations, setDonations] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    donationDate: "",
    units: 1,
    location: "",
    institutionId: "",
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");

  // Load donor details, eligibility, history, and institutions.
  useEffect(() => {
    const loadData = async () => {
      try {
        const [donorRes, eligibilityRes, donationsRes, institutionsRes] = await Promise.all([
          api.get(`/donors/${id}`),
          api.get(`/donors/${id}/eligibility`),
          api.get(`/donations/donor/${id}`),
          api.get("/institutions"),
        ]);

        setDonor(donorRes.data.data);
        setEligibility(eligibilityRes.data);
        setDonations(donationsRes.data.data || []);
        setInstitutions(institutionsRes.data.data || []);
      } catch (err) {
        console.error("Failed to load donor details", err);
        const msg = "Could not load donor information.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecordDonation = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.post("/donations", {
        donorId: id,
        institutionId: form.institutionId || undefined,
        donationDate: form.donationDate || undefined,
        units: form.units,
        location: form.location,
        notes: form.notes,
      });
      setMessage("Donation recorded.");
      // Refresh history and eligibility.
      const [eligibilityRes, donationsRes, donorRes] = await Promise.all([
        api.get(`/donors/${id}/eligibility`),
        api.get(`/donations/donor/${id}`),
        api.get(`/donors/${id}`),
      ]);
      setEligibility(eligibilityRes.data);
      setDonations(donationsRes.data.data || []);
      setDonor(donorRes.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || "Could not record donation. Please check eligibility.";
      setError(msg);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus("");
    try {
      await api.post("/contact", { donorId: id, message: contactMessage });
      setContactStatus("Message sent to donor.");
      setContactMessage("");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not send message.";
      setContactStatus(msg);
    }
  };

  if (loading) {
    return <div className="text-slate-700">Loading donor...</div>;
  }

  if (!donor) {
    return <div className="text-red-600">{error || "Donor not found."}</div>;
  }

  const eligible = eligibility?.eligible;
  const avatarSeed = donor.fullName || donor.email || "donor";
  const avatarUrl = donor.profilePicture || `https://i.pravatar.cc/150?u=${encodeURIComponent(avatarSeed)}`;

  return (
    <div className="space-y-6">
      <div className="bg-white/90 border border-slate-200 rounded-3xl shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden border border-white/60 shadow-sm">
              <img src={avatarUrl} alt={donor.fullName || "Donor profile"} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Donor profile</p>
              <h1 className="text-3xl font-semibold text-slate-900 font-display">{donor.fullName}</h1>
              <p className="text-sm text-slate-600">
                {donor.bloodGroup} | {donor.address?.city || "Unknown city"}
              </p>
              {donor.email ? <p className="text-sm text-slate-500">{donor.email}</p> : null}
            </div>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              eligible ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {eligible ? "Eligible to donate" : "Not eligible"}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6">
        <div className="space-y-6">
          <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Profile Details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <InfoRow label="Blood Group" value={donor.bloodGroup} />
              <InfoRow label="City" value={donor.address?.city} />
              <InfoRow label="Phone" value={donor.phone} />
              <InfoRow label="Contact preference" value={donor.contactPreference} />
              <InfoRow label="Emergency Contact" value={donor.emergencyContactName} />
              <InfoRow label="Emergency Phone" value={donor.emergencyContactPhone} />
              <InfoRow label="Willing" value={donor.willingToDonate ? "Yes" : "No"} />
              <InfoRow
                label="Contact allowed"
                value={donor.allowRequestContact === false ? "No" : "Yes"}
              />
              <InfoRow label="Total Donations" value={donor.totalDonations || 0} />
              <InfoRow
                label="Last Donation"
                value={donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "None"}
              />
              <InfoRow
                label="Deferral until"
                value={donor.deferralUntil ? new Date(donor.deferralUntil).toLocaleDateString() : "None"}
              />
            </div>
          </div>

          <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-slate-900">Donation History</h2>
              <span className="text-sm text-slate-500">{donations.length} record(s)</span>
            </div>
            {donations.length === 0 ? (
              <p className="text-sm text-slate-600">No donations recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-700">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Institution</th>
                      <th className="px-3 py-2">Units</th>
                      <th className="px-3 py-2">Location</th>
                      <th className="px-3 py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d._id} className="border-t border-slate-100">
                        <td className="px-3 py-2">{new Date(d.donationDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2">{d.institution?.name || "N/A"}</td>
                        <td className="px-3 py-2">{d.units || 1}</td>
                        <td className="px-3 py-2">{d.location || "N/A"}</td>
                        <td className="px-3 py-2">{d.notes || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {eligibility ? (
            <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Eligibility</h2>
              <p className="text-sm text-slate-700">
                {eligibility.message || (eligible ? "Donor can donate now." : "Donor cannot donate.")}
              </p>
              {!eligible && eligibility.daysUntilEligible != null ? (
                <p className="text-sm text-slate-600 mt-1">
                  Days until eligible: {eligibility.daysUntilEligible}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Record Donation</h2>
            {error ? <p className="text-sm text-red-500 mb-2">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600 mb-2">{message}</p> : null}
            <form className="space-y-3" onSubmit={handleRecordDonation}>
              <Input
                label="Donation Date"
                type="date"
                name="donationDate"
                value={form.donationDate}
                onChange={handleFormChange}
              />
              <Input
                label="Units"
                type="number"
                name="units"
                min={1}
                value={form.units}
                onChange={handleFormChange}
              />
              <Input
                label="Location"
                name="location"
                value={form.location}
                onChange={handleFormChange}
                placeholder="Hospital or city"
              />
              <Select
                label="Institution"
                name="institutionId"
                value={form.institutionId}
                onChange={handleFormChange}
                options={institutions.map((ins) => ({ label: ins.name, value: ins._id }))}
                placeholder="Optional"
              />
              <Input
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                placeholder="Any notes..."
              />
              <Button type="submit" className="w-full">
                Record Donation
              </Button>
            </form>
          </div>

          <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Contact Donor</h2>
            <p className="text-sm text-slate-600 mb-2">
              Send a message without exposing phone/email. Donor contact preference: {donor.contactPreference || "message"}.
              Contact allowed: {donor.allowRequestContact === false ? "No" : "Yes"}.
            </p>
            <form className="space-y-3" onSubmit={handleContactSubmit}>
              <Input
                label="Message"
                name="contactMessage"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Explain your request and how to reach you."
              />
              <Button
                type="submit"
                className="w-full"
                disabled={donor.allowRequestContact === false}
              >
                Send Message
              </Button>
            </form>
            {contactStatus ? <p className="text-sm text-slate-700 mt-2">{contactStatus}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonorDetailPage;
