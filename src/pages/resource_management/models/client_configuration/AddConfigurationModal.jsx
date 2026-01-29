import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import SLAForm from "./forms/SLAForm";
import EscalationForm from "./forms/EscalationForm";
import ComplianceForm from "./forms/ComplianceForm";

const CONFIG_OPTIONS = [
  {
    key: "slas",
    label: "SLA Configuration",
    enabled: (d) => d?.SLA,
  },
  {
    key: "escalations",
    label: "Escalation Matrix",
    enabled: (d) => d?.escalationContact,
  },
  {
    key: "compliances",
    label: "Compliance Requirements",
    enabled: (d) => d?.compliance,
  },
];

const AddConfigurationModal = ({
  open,
  onClose,
  onSave,
  clientDetails,
  loading,
}) => {
  const DEFAULT_FORM_STATE = {
    activeFlag: true,
  };

  const [configType, setConfigType] = useState("");
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  const allowedConfigs = useMemo(
    () => CONFIG_OPTIONS.filter((c) => c.enabled(clientDetails)),
    [clientDetails],
  );

  useEffect(() => {
    if (!open) {
      setConfigType("");
      setFormData(DEFAULT_FORM_STATE);
      return;
    }

    // Auto-select if only one option
    if (allowedConfigs.length === 1) {
      setConfigType(allowedConfigs[0].key);
    } else {
      setConfigType("");
    }

    setFormData(DEFAULT_FORM_STATE);
  }, [open, allowedConfigs]);

  if (!open) return null;

  // No configurations allowed → don’t show modal
  if (allowedConfigs.length === 0) return null;

  const handleSave = () => {
    if (!configType) return "Select a configuration type";

    const payload = {
      client: {
        clientId: clientDetails.clientId,
      },
      ...formData,
    };

    onSave({
      type: configType,
      data: payload,
    });
  };

  const isSaveDisabled = () => {
    if (!configType) return true;

    switch (configType) {
      case "slas":
        return (
          !formData.slaType ||
          !formData.slaDurationDays ||
          !formData.warningThresholdDays
        );

      case "escalations":
        return (
          !formData.contactName ||
          !formData.contactRole ||
          !formData.email ||
          !formData.escalationLevel
        );

      case "compliances":
        return !formData.requirementType || !formData.requirementName;

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

        <div className="px-6 py-5 space-y-6">
          {allowedConfigs.length > 1 && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Configuration Type <span className="text-red-500">*</span>
              </label>
              <select
                value={configType}
                onChange={(e) => {
                  setConfigType(e.target.value);
                  setFormData(DEFAULT_FORM_STATE);
                }}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select configuration</option>
                {allowedConfigs.map((cfg) => (
                  <option key={cfg.key} value={cfg.key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ===== FORMS ===== */}
          {configType === "slas" && (
            <SLAForm formData={formData} setFormData={setFormData} />
          )}

          {configType === "escalations" && (
            <EscalationForm formData={formData} setFormData={setFormData} />
          )}

          {configType === "compliances" && (
            <ComplianceForm formData={formData} setFormData={setFormData} />
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
            disabled={isSaveDisabled() || loading}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddConfigurationModal;
