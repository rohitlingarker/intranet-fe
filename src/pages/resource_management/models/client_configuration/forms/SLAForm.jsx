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
          name="sla_type"
          value={formData.sla_type || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select SLA type</option>
          <option value="New Demand">New Demand</option>
          <option value="Replacement">Replacement</option>
          <option value="Emergency">Emergency</option>
        </select>
      </div>

      {/* SLA Duration */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          SLA Duration (Days) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="sla_duration_days"
          value={formData.sla_duration_days || ""}
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
          name="warning_threshold_days"
          value={formData.warning_threshold_days || ""}
          onChange={handleChange}
          placeholder="e.g. 5"
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
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

export default SLAForm;
