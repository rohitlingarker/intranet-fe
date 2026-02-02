import React, { useEffect } from "react";

const ComplianceForm = ({ formData, setFormData }) => {
  // useEffect(() => {
  //   setFormData((prev) => ({
  //     mandatoryFlag: prev.mandatoryFlag ?? true,
  //     activeFlag: prev.activeFlag ?? true,
  //     ...prev,
  //   }));
  // }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

      {/* Flags */}
      <div className="flex items-center gap-2">
        <label htmlFor="mandatoryFlag" className="text-sm font-medium">
          Mandatory
        </label>
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
        />
        <label htmlFor="activeFlag" className="text-sm font-medium ml-4">
          Active
        </label>
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
        />
      </div>
    </div>
  );
};

export default ComplianceForm;
