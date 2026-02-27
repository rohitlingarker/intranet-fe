import React, { useEffect, useState } from "react";
import Button from "../../../../components/Button/Button";

const CompanyEscalationModal = ({
  mode = "create",        // "create" | "edit"
  initialData = null,     // contact data for edit
  onSave,
  onClose,
  loading,
}) => {
  const [formData, setFormData] = useState({
    contactName: "",
    contactRole: "",
    email: "",
    phone: "",
    escalationLevel: "L1",
    activeFlag: true,
  });

  // ✅ Populate form in EDIT mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        contactId: initialData.contactId,   // needed for update
        contactName: initialData.contactName || "",
        contactRole: initialData.contactRole || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        escalationLevel: initialData.escalationLevel || "L1",
        activeFlag: initialData.activeFlag ?? true,
      });
    }
  }, [mode, initialData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.contactName || !formData.contactRole || !formData.email) {
      alert("Contact Name, Role and Email are mandatory");
      return;
    }

    onSave(formData);
  };

  return (
    <div className="space-y-4">
      {/* Contact Name */}
      <input
        className="w-full border rounded-lg p-2"
        placeholder="Contact Name"
        value={formData.contactName}
        onChange={(e) => handleChange("contactName", e.target.value)}
      />

      {/* Role */}
      <select
        className="w-full border rounded-lg p-2"
        value={formData.contactRole}
        onChange={(e) => handleChange("contactRole", e.target.value)}
      >
        <option value="">Select Role</option>
        <option value="PROJECT_MANAGER">Project Manager</option>
        <option value="DELIVERY_MANAGER">Delivery Manager</option>
        <option value="BU_HEAD">BU Head</option>
        <option value="RESOURCE_MANAGER">Resource Manager</option>
      </select>

      {/* Email */}
      <input
        className="w-full border rounded-lg p-2"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />

      {/* Phone */}
      <input
        className="w-full border rounded-lg p-2"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
      />

      {/* Escalation Level */}
      <select
        className="w-full border rounded-lg p-2"
        value={formData.escalationLevel}
        onChange={(e) =>
          handleChange("escalationLevel", e.target.value)
        }
      >
        <option value="L1">Level 1</option>
        <option value="L2">Level 2</option>
        <option value="L3">Level 3</option>
      </select>

      {/* Active */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.activeFlag}
          onChange={(e) =>
            handleChange("activeFlag", e.target.checked)
          }
        />
        Active
      </label>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" loading={loading} onClick={handleSubmit}>
          {mode === "edit" ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default CompanyEscalationModal;