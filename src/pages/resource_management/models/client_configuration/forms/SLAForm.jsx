import React from "react";

const SLAForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4 border-t pt-4">
      {/* SLA Type */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          SLA Type <span className="text-red-500">*</span>
        </label>
        <select
          name="slaType"
          value={formData.slaType || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select SLA type</option>
          <option value="NEW_DEMAND">New Demand</option>
          <option value="REPLACEMENT">Replacement</option>
          <option value="EMERGENCY">Emergency</option>
        </select>
      </div>

      {/* SLA Duration */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          SLA Duration (Days) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="slaDurationDays"
          value={formData.slaDurationDays || ""}
          onChange={handleChange}
          placeholder="e.g. 15"
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Warning Threshold */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Warning Threshold (Days) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="warningThresholdDays"
          value={formData.warningThresholdDays || ""}
          onChange={handleChange}
          placeholder="e.g. 5"
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Status */}
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

export default SLAForm;
