import React, { useState } from "react";
import LargeModal from "./LargeModal";
import Tabs from "./Tabs";
import ProfileForm from "./ProfileForm";
import JobForm from "./JobForm";
import Button from "../../../../components/Button/Button";

export default function EmployeeCreateModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("Profile");
  const [form, setForm] = useState({});
  const [isGenerated, setIsGenerated] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleGenerate = () => {
    if (!form.empName) {
      alert("Please enter Employee Name first");
      return;
    }

    const generatedId = `EMP${Date.now().toString().slice(-5)}`;
    const generatedEmail =
      `${form.empName.toLowerCase().replace(/\s/g, "")}@pavestechnologies.com`;

    setForm({
      ...form,
      empId: generatedId,
      email: generatedEmail,
    });

    setIsGenerated(true);
  };

  return (
    <LargeModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Employee"
      subtitle="Fill out the form to create a new employee profile."
    >
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

       

      {activeTab === "Profile" && (
        <ProfileForm form={form} handleChange={handleChange} isGenerated={isGenerated}/>
      )}

      {activeTab === "Job" && (
        <JobForm form={form} handleChange={handleChange} />
      )}
      {activeTab === "Profile" && !isGenerated && (
        <div className="flex justify-end">
          <Button
            varient="primary"
            size="small"
            onClick={handleGenerate}
          >
            Generate Credentials
          </Button>
        </div>
      )}
    </LargeModal>
    
  );
}
