import React from "react";

const ComplianceForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target; // ✅ FIX
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4 border-t pt-4">
      {/* Requirement Type */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Requirement Type <span className="text-red-500">*</span>
        </label>
        <select
          name="requirement_type"
          value={formData.requirement_type || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select type</option>
          <option value="Certification">Certification</option>
          <option value="Clearance">Clearance</option>
          <option value="Tool Access">Tool Access</option>
        </select>
      </div>

      {/* Requirement Name */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Requirement Name <span className="text-red-500">*</span>
        </label>
        <input
          name="requirement_name"
          value={formData.requirement_name || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Mandatory Flag */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Mandatory
        </label>
        <select
          name="mandatory_flag"
          value={formData.mandatory_flag ?? true}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              mandatory_flag: e.target.value === "true",
            }))
          }
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="active_flag"
          value={formData.active_flag ?? true}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              active_flag: e.target.value === "true",
            }))
          }
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
    </div>
  );
};

export default ComplianceForm;
