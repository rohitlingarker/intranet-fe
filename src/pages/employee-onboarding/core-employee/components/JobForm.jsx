import React from "react";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";

export default function JobForm({ form, handleChange }) {

  // 🔹 Mock Dropdown Data
  const departments = [
    { id: 1, name: "Engineering" },
    { id: 2, name: "Human Resources" },
    { id: 3, name: "Finance" },
    { id: 4, name: "Sales" },
    { id: 5, name: "Marketing" }
  ];

  const roles = [
    { id: 1, name: "Admin" },
    { id: 2, name: "HR" },
    { id: 3, name: "Manager" },
    { id: 4, name: "Employee" }
  ];

  const employeeTypes = ["Full-Time", "Intern", "Contract"];

  const workModes = ["Remote", "Hybrid", "Office"];

  const experienceOptions = ["0", "0.5", "1"];

  return (
    <div className="grid grid-cols-2 gap-4">

      {/* Role Dropdown */}
      <FormSelect
        label="Role"
        name="role"
        value={form.role || ""}
        onChange={handleChange}
        options={roles}
      />

      {/* Department Dropdown */}
      <FormSelect
        label="Department"
        name="department"
        value={form.department || ""}
        onChange={handleChange}
        options={departments}
      />

      {/* Employee Type */}
      <FormSelect
        label="Employee Type"
        name="employeeType"
        value={form.employeeType || ""}
        onChange={handleChange}
        options={employeeTypes}
      />

      {/* Work Mode */}
      <FormSelect
        label="Work Mode"
        name="workMode"
        value={form.workMode || ""}
        onChange={handleChange}
        options={workModes}
      />

      {/* Location */}
      <FormInput
        label="Location"
        name="location"
        value={form.location || ""}
        onChange={handleChange}
      />

      {/* Date of Join */}
      <FormInput
        label="Date of Join"
        type="date"
        name="dateOfJoin"
        value={form.dateOfJoin || ""}
        onChange={handleChange}
      />

      {/* Reporting Manager */}
      <FormInput
        label="Reporting Manager"
        name="manager"
        value={form.manager || ""}
        onChange={handleChange}
      />

      {/* Experience */}
      <FormSelect
        label="Experience Years"
        name="experience"
        value={form.experience || ""}
        onChange={handleChange}
        options={experienceOptions}
      />
    </div>
  );
}
