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
          name="contactName"
          value={formData.contactName || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Role */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Contact Role <span className="text-red-500">*</span>
        </label>
        <select
          name="contactRole"
          value={formData.contactRole || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select level</option>
          <option value="DELIVERY_HEAD">Delivery Head</option>
          <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
          <option value="PROJECT_MANAGER">Project Manager</option>
          <option value="ACCOUNT_MANAGER">Account Manager</option>
          <option value="TECHNICAL_LEAD">Technical Lead</option>
        </select>
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
          name="escalationLevel"
          value={formData.escalationLevel || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select level</option>
          <option value="Level-1">Level 1</option>
          <option value="Level-2">Level 2</option>
          <option value="Level-3">Level 3</option>
        </select>
      </div>
      {/* Active Flag */}
      <div>
        <input
          type="checkbox"
          id="activeFlag"
          checked={formData.activeFlag ?? true}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              activeFlag: e.target.checked,
            }))
          }
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="activeFlag" className="text-sm text-gray-700 ml-2">
          Active
        </label>
      </div>
    </div>
  );
};

export default EscalationForm;
