// DonorForm is used for creating or updating donors.
// It collects basic details and calls onSubmit with the form data.
import { useState } from "react";
import Input from "../UI/Input";
import Select from "../UI/Select";
import Button from "../UI/Button";

const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

function DonorForm({ initialValues = {}, onSubmit, onCancel, allowUserId = false }) {
  const [formData, setFormData] = useState({
    user: initialValues.user || "",
    fullName: initialValues.fullName || "",
    email: initialValues.email || "",
    phone: initialValues.phone || "",
    emergencyContactName: initialValues.emergencyContactName || "",
    emergencyContactPhone: initialValues.emergencyContactPhone || "",
    bloodGroup: initialValues.bloodGroup || "",
    address: {
      city: initialValues.address?.city || "",
    },
    willingToDonate: initialValues.willingToDonate ?? true,
    visibility: initialValues.visibility || "public",
    phoneVisibility: initialValues.phoneVisibility || "public",
    notes: initialValues.notes || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation for required fields.
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.emergencyContactName ||
      !formData.emergencyContactPhone ||
      !formData.bloodGroup
    ) {
      alert("Please fill all required fields.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {allowUserId ? (
        <Input
          label="User ID (admin only)"
          name="user"
          value={formData.user}
          onChange={handleChange}
          placeholder="Optional: user ID to create on behalf"
        />
      ) : null}

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="donor@example.com"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Phone *"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+8801..."
          required
        />
        <Input
          label="City"
          name="city"
          value={formData.address.city}
          onChange={handleAddressChange}
          placeholder="Dhaka"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Emergency Contact Name *"
          name="emergencyContactName"
          value={formData.emergencyContactName}
          onChange={handleChange}
          placeholder="Contact person"
          required
        />
        <Input
          label="Emergency Contact Phone *"
          name="emergencyContactPhone"
          value={formData.emergencyContactPhone}
          onChange={handleChange}
          placeholder="Phone"
          required
        />
      </div>

      <Select
        label="Blood Group *"
        name="bloodGroup"
        value={formData.bloodGroup}
        onChange={handleChange}
        options={BLOOD_GROUP_OPTIONS.map((bg) => ({ label: bg, value: bg }))}
        placeholder="Choose blood group"
        required
      />

      <div className="flex items-center gap-2">
        <input
          id="willingToDonate"
          type="checkbox"
          checked={formData.willingToDonate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, willingToDonate: e.target.checked }))
          }
          className="h-4 w-4 text-red-500 border-slate-300 rounded"
        />
        <label htmlFor="willingToDonate" className="text-sm text-slate-700">
          Willing to donate
        </label>
      </div>

      <Select
        label="Profile visibility"
        name="visibility"
        value={formData.visibility}
        onChange={handleChange}
        options={[
          { label: "Public (searchable)", value: "public" },
          { label: "Registered only", value: "registered" },
          { label: "Admin only", value: "admin" },
        ]}
      />

      <Select
        label="Phone visibility"
        name="phoneVisibility"
        value={formData.phoneVisibility}
        onChange={handleChange}
        options={[
          { label: "Show to everyone", value: "public" },
          { label: "Show to logged-in only", value: "registered" },
          { label: "Admins only", value: "admin" },
        ]}
      />

      <Input
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Any notes..."
      />

      <div className="flex gap-3">
        <Button type="submit">Save Donor</Button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default DonorForm;
