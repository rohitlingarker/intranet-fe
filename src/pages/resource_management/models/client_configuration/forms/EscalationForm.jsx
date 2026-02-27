import React, { useEffect } from "react";
import { useEnums } from "@/pages/resource_management/hooks/useEnums";

const EscalationForm = ({ formData, setFormData }) => {
  const { getEnumValues } = useEnums();
  const CONTACT_ROLES = getEnumValues("ContactRole");
  const ESCALATION_LEVELS = getEnumValues("EscalationLevel");
  const ESCALATION_TRIGGERS = getEnumValues("EscalationTriggerType");

  useEffect(() => {
    if (!formData.triggers) {
      setFormData((prev) => ({ ...prev, triggers: [] }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTriggerChange = (trigger) => {
    setFormData((prev) => {
      const exists = prev.triggers?.includes(trigger);
      return {
        ...prev,
        triggers: exists
          ? prev.triggers.filter((t) => t !== trigger)
          : [...(prev.triggers || []), trigger],
      };
    });
  };

  return (
    <div className="border-t pt-4 space-y-4">
      {/* ===== CONTACT & LEVEL (COMPACT GRID) ===== */}
      <div className="grid grid-cols-3 gap-3">
        {/* Contact Name */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            Contact Name *
          </label>
          <input
            name="contactName"
            value={formData.contactName || ""}
            onChange={handleChange}
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm"
          />
        </div>

        {/* Contact Role */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            Contact Role *
          </label>
          <select
            name="contactRole"
            value={formData.contactRole || ""}
            onChange={handleChange}
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
          >
            <option value="">Select</option>
            {CONTACT_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Escalation Level */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            Escalation Level *
          </label>
          <select
            name="escalationLevel"
            value={formData.escalationLevel || ""}
            onChange={handleChange}
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
          >
            <option value="">Select</option>
            {ESCALATION_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== EMAIL / PHONE / ACTIVE ===== */}
      <div className="grid grid-cols-3 gap-3 items-end">
        {/* Email */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            Phone
          </label>
          <input
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm"
          />
        </div>

        {/* Active */}
        <div className="flex items-center gap-2 mb-1">
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

      {/* ===== TRIGGERS (PILL STYLE) ===== */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-2">
          Escalation Triggers
        </label>

        <div className="flex gap-3">
          {ESCALATION_TRIGGERS.map((trigger) => (
            <label
              key={trigger}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs cursor-pointer
                ${formData.triggers?.includes(trigger)
                  ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                  : "bg-white border-gray-300 text-gray-600"
                }`}
            >
              <input
                type="checkbox"
                checked={formData.triggers?.includes(trigger)}
                onChange={() => handleTriggerChange(trigger)}
                className="hidden"
              />
              {trigger.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EscalationForm;
