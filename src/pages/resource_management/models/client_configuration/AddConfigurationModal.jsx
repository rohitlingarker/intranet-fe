import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { X, Check, ChevronDown } from "lucide-react";
import SLAForm from "./forms/SLAForm";
import EscalationForm from "./forms/EscalationForm";
import ComplianceForm from "./forms/ComplianceForm";

const CONFIG_OPTIONS = [
  { key: "slas", label: "SLA Configuration", enabled: (d) => d?.SLA },
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
  const DEFAULT_FORM_STATE = { activeFlag: true };

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

    // ✅ Default only on open (do NOT force after)
    setConfigType((prev) => prev || "escalations");
    setFormData(DEFAULT_FORM_STATE);
  }, [open]);

  if (!open || allowedConfigs.length === 0) return null;

  const handleSave = () => {
    if (!configType) return;

    onSave({
      type: configType,
      data: {
        client: { clientId: clientDetails.clientId },
        ...formData,
      },
    });
  };

  const isSaveDisabled = () => {
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
      <div className="bg-white w-[60%] max-w-3xl rounded-xl shadow-xl">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-xl">
          <h2 className="text-base font-semibold text-gray-900">
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
        <div className="px-6 py-4 space-y-4">
          {allowedConfigs.length > 1 && (
            <div>
              <label className="text-xs font-medium text-gray-600">
                Configuration Type <span className="text-red-500">*</span>
              </label>

              <Listbox
                value={configType}
                onChange={(val) => {
                  setConfigType(val);
                  setFormData(DEFAULT_FORM_STATE);
                }}
              >
                <div className="relative mt-1">
                  <Listbox.Button className="w-full border rounded-md px-3 py-2 text-sm text-left bg-white focus:ring-2 focus:ring-indigo-500/20">
                    <span
                      className={configType ? "text-gray-900" : "text-gray-400"}
                    >
                      {allowedConfigs.find((c) => c.key === configType)
                        ?.label || "Select configuration"}
                    </span>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </Listbox.Button>

                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg text-sm">
                      {allowedConfigs.map((cfg) => (
                        <Listbox.Option
                          key={cfg.key}
                          value={cfg.key}
                          className={({ active }) =>
                            `cursor-pointer px-3 py-2 ${
                              active
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-gray-700"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <div className="flex items-center justify-between">
                              {cfg.label}
                              {selected && (
                                <Check className="h-4 w-4 text-indigo-600" />
                              )}
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          )}

          {/* ===== FORM AREA ===== */}
          {/* ===== FORM AREA ===== */}
          <div className="bg-gray-50 rounded-lg px-4 py-3">
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
        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex justify-end gap-3 px-6 py-3 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm border rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled() || loading}
            className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddConfigurationModal;
