import React, { useState } from "react";
import LargeModal from "./LargeModal";
import Tabs from "./Tabs";
import ProfileForm from "./ProfileForm";
import JobForm from "./JobForm";

export default function EmployeeCreateModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("Profile");
  const [form, setForm] = useState({});

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <LargeModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Employee"
      subtitle="Fill out the form to create a new employee profile."
    >
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "Profile" && (
        <ProfileForm form={form} handleChange={handleChange} />
      )}

      {activeTab === "Job" && (
        <JobForm form={form} handleChange={handleChange} />
      )}
    </LargeModal>
  );
}
