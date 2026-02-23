import React from "react";

const ComplianceForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="border-t pt-4 space-y-4">
      {/* ===== REQUIREMENT DETAILS ===== */}
      <div className="grid grid-cols-3 gap-3 items-end">
        {/* Requirement Type */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            Requirement Type *
          </label>
          <select
            name="requirementType"
            value={formData.requirementType || ""}
            onChange={handleChange}
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
          >
            <option value="">Select</option>
            <option value="CERTIFICATION">Certification</option>
            <option value="CLEARANCE">Clearance</option>
            <option value="TOOL_ACCESS">Tool Access</option>
          </select>
        </div>

        {/* Requirement Name */}
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600">
            Requirement Name *
          </label>
          <input
            name="requirementName"
            value={formData.requirementName || ""}
            onChange={handleChange}
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* ===== FLAGS ===== */}
      <div className="flex items-center gap-6">
        {/* Mandatory */}
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            id="mandatoryFlag"
            checked={formData.mandatoryFlag}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                mandatoryFlag: e.target.checked,
              }))
            }
            className="h-4 w-4 text-indigo-600"
          />
          Mandatory
        </label>

        {/* Active */}
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            id="activeFlag"
            checked={formData.activeFlag}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                activeFlag: e.target.checked,
              }))
            }
            className="h-4 w-4 text-indigo-600"
          />
          Active
        </label>
      </div>
    </div>
  );
};

export default ComplianceForm;