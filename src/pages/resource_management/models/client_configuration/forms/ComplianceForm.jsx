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
          name="requirementType"
          value={formData.requirementType || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select type</option>
          <option value="CERTIFICATION">Certification</option>
          <option value="CLEARANCE">Clearance</option>
          <option value="TOOL_ACCESS">Tool Access</option>
        </select>
      </div>

      {/* Requirement Name */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Requirement Name <span className="text-red-500">*</span>
        </label>
        <input
          name="requirementName"
          value={formData.requirementName || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Compliance Flag's */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="mandatoryFlag"
          className="text-sm font-medium text-gray-700"
        >
          Mandatory
        </label>
        <input
          type="checkbox"
          id="mandatoryFlag"
          checked={formData.mandatoryFlag ?? true}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              mandatoryFlag: e.target.checked,
            }))
          }
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />

        <label
          htmlFor="activeFlag"
          className="text-sm font-medium text-gray-700"
        >
          Active
        </label>
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
      </div>
    </div>
  );
};

export default ComplianceForm;
