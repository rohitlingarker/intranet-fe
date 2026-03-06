import React, { useState, useEffect } from "react";
import LargeModal from "./LargeModal";
import Tabs from "./Tabs";
import ProfileForm from "./ProfileForm";
import JobForm from "./JobForm";
import Button from "../../../../components/Button/Button";
import { showStatusToast } from "../../../../components/toastfy/toast";


export default function EmployeeCreateModal({ isOpen, onClose , userUuid}) {
  const [activeTab, setActiveTab] = useState("Profile");
  const [form, setForm] = useState({});
  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const token = localStorage.getItem("token");

 const fetchDepartments = async () => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/masters/departments/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    console.log("Departments API response:", data);

    // Ensure array
    setDepartments(Array.isArray(data) ? data : data.data || []);
    
  } catch (err) {
    console.error("Failed to fetch departments", err);
  }
};
const fetchDesignations = async (departmentUuid) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/masters/designations/department/${departmentUuid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await res.json();
    setDesignations(data);
  } catch (err) {
    console.error("Failed to fetch designations", err);
  }
};

useEffect(() => {
  fetchDepartments();
}, []);

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
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value
  }));

  if (name === "departmentUuid") {
    fetchDesignations(value);
  }
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
        !form.employeeType ||
        !form.joiningDate ||
        !form.employmentStatus
      ) {
        setError("Please fill all required Profile fields.");
        showStatusToast("Please fill all required fields", "info");
        return;
      }

    const response = await fetch(
    `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/permanent-employee/core-employee-details/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        user_uuid: userUuid,

        first_name: form.empFirstName,
        middle_name: form.empMiddleName || "",
        last_name: form.empLastName || "",

        date_of_birth: form.empDob,
        contact_number: form.contact,

        department_uuid: form.departmentUuid,
        designation_uuid: form.designationUuid,

        reporting_manager_uuid: form.reportingManagerUuid || "",

        employment_type: form.employeeType || "Full-Time",
        joining_date: form.joiningDate,

        location: form.location || "",
        work_mode: form.workMode || "Office",

        employment_status: form.employmentStatus || "Probation",

        blood_group: form.bloodGroup || "",
        gender: form.gender || "",
        marital_status: form.maritalStatus || "",

        total_experience: Number(form.totalExperience) || 0,

      }
    ),
      

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
      showStatusToast("Employee crentials generated successfully", "success");

    } catch (err) {
      console.error(err);
      setError("Something went wrong while creating employee.");
      showStatusToast("Failed to generate employee credentials","error");
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
        <>
        <ProfileForm
          form={form}
          handleChange={handleChange}
          isGenerated={isGenerated}
        />
        <div className="flex justify-end mt-6">
      <Button
        varient="primary"
        size="small"
        onClick={() => setActiveTab("Job")}
      >
        Next
      </Button>
    </div>
    </>
      )}
      {activeTab === "Job" && (
  <>
    <JobForm
      form={form}
      handleChange={handleChange}
      departments={departments}
      designations={designations}
    />

    <div className="flex justify-end gap-3 mt-6">

      {!isGenerated && (
        <Button
          varient="primary"
          size="small"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Credentials"}
        </Button>
      )}

      {isGenerated && (
        <>
          <Button
            varient="secondary"
            size="small"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            varient="primary"
            size="small"
            onClick={onClose}
          >
            Save
          </Button>
        </>
      )}

    </div>
  </>
)}

      {/* ERROR MESSAGE */}
      {error && (
        <p className="text-red-600 mt-3 text-sm">{error}</p>
      )}

    </LargeModal>
  );
}