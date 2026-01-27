import React from "react";

const EscalationForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target; // ✅ FIX
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4 border-t pt-4">
      {/* Contact Name */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Contact Name <span className="text-red-500">*</span>
        </label>
        <input
          name="contact_name"
          value={formData.contact_name || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Role */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Contact Role <span className="text-red-500">*</span>
        </label>
        <input
          name="contact_role"
          value={formData.contact_role || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Escalation Level */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Escalation Level <span className="text-red-500">*</span>
        </label>
        <select
          name="escalation_level"
          value={formData.escalation_level || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select level</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
        </select>
      </div>
    </div>
  );
};

export default EscalationForm;
