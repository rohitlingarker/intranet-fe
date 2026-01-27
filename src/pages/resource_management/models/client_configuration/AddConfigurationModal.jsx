import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// Forms
import SLAForm from "./forms/SLAForm";
import EscalationForm from "./forms/EscalationForm";
import ComplianceForm from "./forms/ComplianceForm";

const AddConfigurationModal = ({ open, onClose, onSave }) => {
  const [configType, setConfigType] = useState("");
  const [formData, setFormData] = useState({});

  // reset when modal opens/closes
  useEffect(() => {
    if (!open) {
      setConfigType("");
      setFormData({});
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!configType) return;

    onSave({
      type: configType, // "slas" | "escalations" | "compliances"
      data: formData,
    });

    onClose();
  };

  const isSaveDisabled = () => {
    if (!configType) return true;

    switch (configType) {
      case "slas":
        return (
          !formData.sla_type ||
          !formData.sla_duration_days ||
          !formData.warning_threshold_days
        );

      case "escalations":
        return (
          !formData.contact_name ||
          !formData.contact_role ||
          !formData.email ||
          !formData.escalation_level
        );

      case "compliances":
        return (
          !formData.requirement_type ||
          !formData.requirement_name
        );

      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">

        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Client Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* ===== BODY ===== */}
        <div className="px-6 py-5 space-y-6">

          {/* Configuration Type Dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Configuration Type <span className="text-red-500">*</span>
            </label>
            <select
              value={configType}
              onChange={(e) => {
                setConfigType(e.target.value);
                setFormData({});
              }}
              className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select configuration</option>
              <option value="slas">SLA Configuration</option>
              <option value="escalations">Escalation Matrix</option>
              <option value="compliances">Compliance Requirements</option>
            </select>
          </div>

          {/* ===== DYNAMIC FORM AREA ===== */}
          {configType === "slas" && (
            <SLAForm formData={formData} setFormData={setFormData} />
          )}

          {configType === "escalations" && (
            <EscalationForm
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {configType === "compliances" && (
            <ComplianceForm
              formData={formData}
              setFormData={setFormData}
            />
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled()}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddConfigurationModal;
