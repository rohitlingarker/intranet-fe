import React, { useState, useEffect } from "react";
import LargeModal from "./LargeModal";
import Tabs from "./Tabs";
import ProfileForm from "./ProfileForm";
import JobForm from "./JobForm";
import Button from "../../../../components/Button/Button";

export default function EmployeeCreateModal({ isOpen, onClose , userUuid}) {
  const [activeTab, setActiveTab] = useState("Profile");
  const [form, setForm] = useState({});
  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  if (userUuid) {
    setForm((prev) => ({
      ...prev,
      userUuid: userUuid,
    }));
  }
}, [userUuid]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  
  // ✅ REAL GENERATE FUNCTION
  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");

      // Basic frontend validation
            if (
        !form.empFirstName ||
        !form.empLastName ||
        !form.empDob ||
        !form.contact ||
        !form.departmentUuid ||
        !form.designationUuid ||
        !form.employmentType ||
        !form.joiningDate
      ) {
        setError("Please fill all required Profile fields.");
        return;
      }

      const response = await fetch(
        "/permanent-employee/core-employee-details/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_uuid: userUuid,
            first_name: form.empName,
            middle_name: form.empMiddleName || "",
            last_name: form.empLastName || "",
            date_of_birth: form.empDob,
            contact_number: form.contact || "",
            department_uuid: form.departmentUuid || "",
            designation_uuid: form.designationUuid || "",
            reporting_manager_uuid: form.reportingManagerUuid || "",
            employment_type: form.employmentType || "Full-Time",
            joining_date: form.joiningDate || "",
            location: form.location || "",
            work_mode: form.workMode || "Office",
            employment_status: form.employmentStatus || "Probation",
            blood_group: form.bloodGroup || "",
            gender: form.gender,
            marital_status: form.maritalStatus || "Single",
            total_experience: Number(form.totalExperience) || 0,
          }),
        }
      );

      // Handle validation error from backend
      if (response.status === 422) {
        setError("Validation error. Please check required fields.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create employee");
      }

      const data = await response.json();

      // ✅ Prefill backend generated values
      setForm((prev) => ({
        ...prev,
        employeeUuid: data.employee_uuid,
        empId: data.employee_id,
        email: data.work_email,
      }));

      setIsGenerated(true);

      // Optional: auto move to Job tab after generate
      // setActiveTab("Job");

    } catch (err) {
      console.error(err);
      setError("Something went wrong while creating employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LargeModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Employee"
      subtitle="Fill out the form to create a new employee profile."
    >
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* PROFILE TAB */}
      {activeTab === "Profile" && (
        <ProfileForm
          form={form}
          handleChange={handleChange}
          isGenerated={isGenerated}
        />
      )}

      {/* JOB TAB */}
      {activeTab === "Job" && (
        <JobForm form={form} handleChange={handleChange} />
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <p className="text-red-600 mt-3 text-sm">{error}</p>
      )}

      {/* BUTTON SECTION */}
      <div className="flex justify-end mt-6 gap-3">
        {/* Generate Button */}
        {activeTab === "Job" && !isGenerated && (
          <Button
            varient="primary"
            size="small"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Credentials"}
          </Button>
        )}

        {/* Save Button */}
        {isGenerated && (
          <Button
            varient="primary"
            size="small"
            onClick={onClose}
          >
            Save
          </Button>
        )}
      </div>
    </LargeModal>
  );
}