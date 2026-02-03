import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { X, Check, ChevronDown } from "lucide-react";
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
              <Listbox
                value={configType}
                onChange={(val) => {
                  // Listbox returns the value directly, not an event object
                  setConfigType(val);
                  setFormData(DEFAULT_FORM_STATE);
                }}
                className="z-2"
              >
                <div className="relative">
                  {/* Button (The Display) */}
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg border bg-white py-2 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <span
                      className={`block truncate ${!configType ? "text-gray-500" : "text-gray-900"}`}
                    >
                      {/* Find the label for the currently selected key */}
                      {allowedConfigs.find((c) => c.key === configType)
                        ?.label || "Select configuration"}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown
                        className="h-4 w-4 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>

                  {/* Options Dropdown */}
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                      {/* Optional: Add a 'Clear/Select' option if you need to unselect */}
                      <Listbox.Option
                        value=""
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-gray-900"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${selected ? "font-medium" : "font-normal"} text-gray-500`}
                            >
                              Select configuration
                            </span>
                          </>
                        )}
                      </Listbox.Option>

                      {/* Map your configs */}
                      {allowedConfigs.map((cfg) => (
                        <Listbox.Option
                          key={cfg.key}
                          value={cfg.key}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-gray-900"
                            }`
                          }
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                              >
                                {cfg.label}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                  <Check
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
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
