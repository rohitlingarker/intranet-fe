import React from "react";

const SLAForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="border-t pt-4 space-y-4">
      {/* ===== SLA CONFIG (COMPACT GRID) ===== */}
      <div className="grid grid-cols-3 gap-3">
        {/* SLA Type */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            SLA Type *
          </label>
          <select
            name="slaType"
            value={formData.slaType || ""}
            onChange={handleChange}
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
          >
            <option value="">Select</option>
            <option value="NEW_DEMAND">New Demand</option>
            <option value="REPLACEMENT">Replacement</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>

        {/* SLA Duration */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            SLA Duration (Days) *
          </label>
          <input
            type="number"
            name="slaDurationDays"
            value={formData.slaDurationDays || ""}
            onChange={handleChange}
            placeholder="15"
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm"
          />
        </div>

        {/* Warning Threshold */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            Warning Threshold (Days)*
          </label>
          <input
            type="number"
            name="warningThresholdDays"
            value={formData.warningThresholdDays || ""}
            onChange={handleChange}
            placeholder="5"
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* ===== STATUS ===== */}
      <div className="flex items-center gap-2">
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
          className="h-4 w-4 text-indigo-600"
        />
        <label htmlFor="activeFlag" className="text-sm text-gray-700">
          Active
        </label>
      </div>
    </div>
  );
};

export default SLAForm;