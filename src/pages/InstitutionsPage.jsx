// InstitutionsPage lists institutions and shows ranking by total donations.
import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import Input from "../components/UI/Input";
import Select from "../components/UI/Select";
import Button from "../components/UI/Button";

const TYPE_OPTIONS = [
  { label: "Hospital", value: "hospital" },
  { label: "Clinic", value: "clinic" },
  { label: "NGO", value: "ngo" },
  { label: "Camp", value: "camp" },
  { label: "Other", value: "other" },
];

function InstitutionsPage() {
  const { user, isAdmin } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "",
    contactPerson: "",
    phone: "",
    email: "",
    city: "",
  });
  const [error, setError] = useState("");

  const loadInstitutions = async () => {
    try {
      const [listRes, rankRes] = await Promise.all([
        api.get("/institutions"),
        api.get("/institutions/ranking"),
      ]);
      setInstitutions(listRes.data.data || []);
      setRanking(rankRes.data.data || []);
    } catch (err) {
      console.error("Failed to load institutions", err);
      setError("Could not load institutions.");
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/institutions/${editingId}`, {
          name: form.name,
          type: form.type,
          contactPerson: form.contactPerson,
          phone: form.phone,
          email: form.email,
          address: { city: form.city },
        });
      } else {
        await api.post("/institutions", {
          name: form.name,
          type: form.type,
          contactPerson: form.contactPerson,
          phone: form.phone,
          email: form.email,
          address: { city: form.city },
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", type: "", contactPerson: "", phone: "", email: "", city: "" });
      loadInstitutions();
    } catch (err) {
      const msg = err.response?.data?.message || "Could not save institution.";
      setError(msg);
    }
  };

  const handleEdit = (ins) => {
    setShowForm(true);
    setEditingId(ins._id);
    setForm({
      name: ins.name || "",
      type: ins.type || "",
      contactPerson: ins.contactPerson || "",
      phone: ins.phone || "",
      email: ins.email || "",
      city: ins.address?.city || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this institution?");
    if (!confirmed) return;
    try {
      await api.delete(`/institutions/${id}`);
      loadInstitutions();
    } catch (err) {
      console.error("Failed to delete institution", err);
      alert("Could not delete institution. Please verify backend support.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-slate-500">Hospitals, clinics, NGOs</p>
          <h1 className="text-3xl font-semibold text-slate-900">Institutions</h1>
        </div>
        {isAdmin ? (
          <Button onClick={() => {
            setShowForm((p) => !p);
            setEditingId(null);
            setForm({ name: "", type: "", contactPerson: "", phone: "", email: "", city: "" });
          }}>
            {showForm ? "Close Form" : "Add Institution"}
          </Button>
        ) : null}
      </div>

      {showForm && isAdmin ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            {editingId ? "Edit Institution" : "New Institution"}
          </h2>
          {error ? <p className="text-sm text-red-500 mb-2">{error}</p> : null}
          <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Select
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              options={TYPE_OPTIONS}
              placeholder="Select type"
              required
            />
            <Input
              label="Contact Person"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
            />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <Input label="City" name="city" value={form.city} onChange={handleChange} />
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit">{editingId ? "Update" : "Save"}</Button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-md text-sm border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Institution List</h2>
        {institutions.length === 0 ? (
          <p className="text-sm text-slate-600">No institutions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-700">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">Total Donations</th>
                  {isAdmin ? <th className="px-3 py-2 text-right">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {institutions.map((i) => (
                  <tr key={i._id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{i.name}</td>
                    <td className="px-3 py-2 capitalize">{i.type}</td>
                    <td className="px-3 py-2">{i.address?.city || "—"}</td>
                    <td className="px-3 py-2">{i.totalDonations || 0}</td>
                    {isAdmin ? (
                      <td className="px-3 py-2 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(i)}
                          className="text-sm text-red-600 hover:text-red-700 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(i._id)}
                          className="text-sm text-slate-500 hover:text-slate-700"
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

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Ranking by Donations</h2>
        {ranking.length === 0 ? (
          <p className="text-sm text-slate-600">No ranking data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-700">
                <tr>
                  <th className="px-3 py-2">Institution</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Total Donations</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r._id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{r.name}</td>
                    <td className="px-3 py-2 capitalize">{r.type}</td>
                    <td className="px-3 py-2">{r.totalDonations || 0}</td>
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

export default InstitutionsPage;
