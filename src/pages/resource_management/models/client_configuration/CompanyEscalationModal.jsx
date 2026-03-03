<<<<<<< HEAD
import React, { useEffect, useState } from "react";
=======
import React, { useState, useEffect } from "react";
>>>>>>> c3ecc328752006e06f37366d3594910cc20ebf26
import Button from "../../../../components/Button/Button";
import { toast } from "react-toastify";

const CompanyEscalationContactModal = ({
  initialData,
  onClose,
  onSave,
  loading,
}) => {
  const isEditMode = Boolean(initialData);

<<<<<<< HEAD
const CompanyEscalationModal = ({
  mode = "create",        // "create" | "edit"
  initialData = null,     // contact data for edit
  onSave,
  onClose,
  loading,
}) => {
=======
>>>>>>> c3ecc328752006e06f37366d3594910cc20ebf26
  const [formData, setFormData] = useState({
    contactName: "",
    contactRole: "",
    email: "",
    phone: "",
    escalationLevel: "Level-1",
    activeFlag: true,
  });

<<<<<<< HEAD
  // ✅ Populate form in EDIT mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        contactId: initialData.contactId,   // needed for update
=======
  // 🔹 Prefill data in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
>>>>>>> c3ecc328752006e06f37366d3594910cc20ebf26
        contactName: initialData.contactName || "",
        contactRole: initialData.contactRole || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
<<<<<<< HEAD
        escalationLevel: initialData.escalationLevel || "L1",
        activeFlag: initialData.activeFlag ?? true,
      });
    }
  }, [mode, initialData]);
=======
        escalationLevel: initialData.escalationLevel || "Level-1",
        activeFlag:
          initialData.activeFlag !== undefined
            ? initialData.activeFlag
            : true,
      });
    }
  }, [initialData]);
>>>>>>> c3ecc328752006e06f37366d3594910cc20ebf26

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.contactName || !formData.contactRole || !formData.email) {
      toast.warning("Contact Name, Role and Email are mandatory");
      return;
    }
<<<<<<< HEAD

    onSave(formData);
=======
    if (isEditMode) {
      onSave({ ...initialData, ...formData });
    } else {
      onSave(formData);
    }
>>>>>>> c3ecc328752006e06f37366d3594910cc20ebf26
  };

  return (
    <div className="space-y-4">
<<<<<<< HEAD
=======
      <h3 className="text-lg font-semibold">
        {isEditMode ? "Edit Escalation Contact" : "Add Escalation Contact"}
      </h3>

>>>>>>> c3ecc328752006e06f37366d3594910cc20ebf26
      {/* Contact Name */}
      <input
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Contact Name"
        value={formData.contactName}
        onChange={(e) => handleChange("contactName", e.target.value)}
      />

      {/* Role */}
      <select
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        type="email"
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />

      {/* Phone */}
      <input
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
      />

      {/* Escalation Level */}
      <select
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={formData.escalationLevel}
        onChange={(e) =>
          handleChange("escalationLevel", e.target.value)
        }
      >
        <option value="Level-1">Level 1</option>
        <option value="Level-2">Level 2</option>
        <option value="Level-3">Level 3</option>
      </select>

<<<<<<< HEAD
      {/* Active */}
      <label className="flex items-center gap-2">
=======
      {/* Active Flag */}
      <label className="flex items-center gap-2 text-sm">
>>>>>>> c3ecc328752006e06f37366d3594910cc20ebf26
        <input
          type="checkbox"
          checked={formData.activeFlag}
          onChange={(e) =>
            handleChange("activeFlag", e.target.checked)
          }
        />
        Active
      </label>

<<<<<<< HEAD
      {/* Actions */}
=======
      {/* Buttons */}
>>>>>>> c3ecc328752006e06f37366d3594910cc20ebf26
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
<<<<<<< HEAD
        <Button variant="primary" loading={loading} onClick={handleSubmit}>
          {mode === "edit" ? "Update" : "Save"}
=======
        <Button
          variant="primary"
          disabled={loading}
          onClick={handleSubmit}
        >
          {isEditMode ? loading ? "Updating..." : "Update" : loading ? "Saving..." : "Save"}
>>>>>>> c3ecc328752006e06f37366d3594910cc20ebf26
        </Button>
      </div>
    </div>
  );
};

export default CompanyEscalationModal;