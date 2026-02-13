"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

/* ------------------ VALIDATION SCHEMA ------------------ */
const schema = yup.object().shape({
  personalDetails: yup.object().shape({
    firstName: yup.string().required("First Name is required"),
    lastName: yup.string().required("Last Name is required"),
    personalEmail: yup.string().email("Invalid Email").required("Email is required"),
  }),
  professionalDetails: yup.object().shape({
    department: yup.string().required("Department is required"),
    designation: yup.string().required("Designation is required"),
  }),
});

/* ------------------ MOCK DATA ------------------ */
const mockEmployee = {
  personalDetails: {
    firstName: "Mounika",
    lastName: "Pothamsetty",
    personalEmail: "mounika@email.com",
    alternatePhones: ["9876543210"],
    addresses: ["Hyderabad"],
  },
  professionalDetails: {
    department: "Engineering",
    designation: "Software Developer",
    skills: ["React", "Spring Boot"],
    projectsHandled: ["Project A"],
  },
  educationDetails: [
    { degree: "B.Tech", institution: "JNTU", specialization: "CSE", startYear: "2016", endYear: "2020", percentage: "78" },
  ],
  identityDocuments: [
    { documentType: "AADHAAR", documentNumber: "1234-5678-9012" },
  ],
  emergencyContacts: [
    { name: "Ravi", relation: "Father", phone: "9876543211" },
  ],
  socialProfiles: [
    { platform: "LinkedIn", url: "https://linkedin.com/in/mounika" },
  ],
};

/* ------------------ COMPONENT ------------------ */
export default function EmployeeProfile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: mockEmployee,
    resolver: yupResolver(schema),
  });

  // Dynamic arrays
  const { fields: altPhones, append: addPhone, remove: removePhone } = useFieldArray({ control, name: "personalDetails.alternatePhones" });
  const { fields: addresses, append: addAddress, remove: removeAddress } = useFieldArray({ control, name: "personalDetails.addresses" });
  const { fields: skills, append: addSkill, remove: removeSkill } = useFieldArray({ control, name: "professionalDetails.skills" });
  const { fields: projects, append: addProject, remove: removeProject } = useFieldArray({ control, name: "professionalDetails.projectsHandled" });
  const { fields: educationFields, append: addEducation, remove: removeEducation } = useFieldArray({ control, name: "educationDetails" });
  const { fields: identityFields, append: addIdentity, remove: removeIdentity } = useFieldArray({ control, name: "identityDocuments" });
  const { fields: emergencyFields, append: addEmergency, remove: removeEmergency } = useFieldArray({ control, name: "emergencyContacts" });
  const { fields: socialFields, append: addSocial, remove: removeSocial } = useFieldArray({ control, name: "socialProfiles" });

  const onSubmit = (data) => {
    console.log("API PAYLOAD:", data);
    alert("Profile Saved! Check console.");
    setEditMode(false);
  };

  const tabs = ["personal", "professional", "education", "identity", "emergency", "social"];

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{mockEmployee.personalDetails.firstName} {mockEmployee.personalDetails.lastName}</h2>
          <p className="text-gray-500">{mockEmployee.professionalDetails.designation}</p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-2 rounded-lg text-white ${editMode ? "bg-gray-500" : "bg-indigo-600"}`}
        >
          {editMode ? "Cancel ✏️" : "Edit ✏️"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-3 capitalize border-b-2 ${activeTab === tab ? "border-indigo-600 text-indigo-600 font-semibold" : "border-transparent text-gray-500"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ------------------ PERSONAL ------------------ */}
        {activeTab === "personal" && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input {...register("personalDetails.firstName")} disabled={!editMode} className="input" placeholder="First Name" />
              <input {...register("personalDetails.lastName")} disabled={!editMode} className="input" placeholder="Last Name" />
              <input {...register("personalDetails.personalEmail")} disabled={!editMode} className="input" placeholder="Email" />
              {altPhones.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input {...register(`personalDetails.alternatePhones.${i}`)} disabled={!editMode} className="input flex-1" placeholder="Alternate Phone" />
                  {editMode && <button type="button" onClick={() => removePhone(i)} className="text-red-500">🗑️</button>}
                </div>
              ))}
              {editMode && <button type="button" onClick={() => addPhone("")} className="text-indigo-600">+ Add Phone</button>}
              {addresses.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input {...register(`personalDetails.addresses.${i}`)} disabled={!editMode} className="input flex-1" placeholder="Address" />
                  {editMode && <button type="button" onClick={() => removeAddress(i)} className="text-red-500">🗑️</button>}
                </div>
              ))}
              {editMode && <button type="button" onClick={() => addAddress("")} className="text-indigo-600">+ Add Address</button>}
            </div>
          </div>
        )}

        {/* ------------------ PROFESSIONAL ------------------ */}
        {activeTab === "professional" && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Professional Details</h3>
            <input {...register("professionalDetails.department")} disabled={!editMode} className="input" placeholder="Department" />
            <input {...register("professionalDetails.designation")} disabled={!editMode} className="input" placeholder="Designation" />
            <div className="space-y-2">
              {skills.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input {...register(`professionalDetails.skills.${i}`)} disabled={!editMode} className="input flex-1" placeholder="Skill" />
                  {editMode && <button type="button" onClick={() => removeSkill(i)} className="text-red-500">🗑️</button>}
                </div>
              ))}
              {editMode && <button type="button" onClick={() => addSkill("")} className="text-indigo-600">+ Add Skill</button>}
            </div>
            <div className="space-y-2 mt-2">
              {projects.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input {...register(`professionalDetails.projectsHandled.${i}`)} disabled={!editMode} className="input flex-1" placeholder="Project Handled" />
                  {editMode && <button type="button" onClick={() => removeProject(i)} className="text-red-500">🗑️</button>}
                </div>
              ))}
              {editMode && <button type="button" onClick={() => addProject("")} className="text-indigo-600">+ Add Project</button>}
            </div>
          </div>
        )}

        {/* ------------------ EDUCATION ------------------ */}
        {activeTab === "education" && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Education</h3>
            {educationFields.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-2 items-center border p-2 rounded">
                <input {...register(`educationDetails.${index}.degree`)} disabled={!editMode} className="input flex-1" placeholder="Degree" />
                <input {...register(`educationDetails.${index}.institution`)} disabled={!editMode} className="input flex-1" placeholder="Institution" />
                <input {...register(`educationDetails.${index}.specialization`)} disabled={!editMode} className="input flex-1" placeholder="Specialization" />
                <input {...register(`educationDetails.${index}.startYear`)} disabled={!editMode} className="input" placeholder="Start Year" />
                <input {...register(`educationDetails.${index}.endYear`)} disabled={!editMode} className="input" placeholder="End Year" />
                <input {...register(`educationDetails.${index}.percentage`)} disabled={!editMode} className="input" placeholder="Percentage" />
                {editMode && <button type="button" onClick={() => removeEducation(index)} className="text-red-500">🗑️</button>}
              </div>
            ))}
            {editMode && <button type="button" onClick={() => addEducation({ degree: "", institution: "", specialization: "", startYear: "", endYear: "", percentage: "" })} className="text-indigo-600">+ Add Education</button>}
          </div>
        )}

        {/* ------------------ SAVE BUTTON ------------------ */}
        {editMode && <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg mt-4 hover:bg-green-700 transition">Save Changes</button>}
      </form>

      {/* ------------------ STYLES ------------------ */}
      <style>{`
        .input { width: 100%; border: 1px solid #e5e7eb; padding: 8px 12px; border-radius: 8px; margin-bottom: 6px; }
        .input:focus { border-color: #6366f1; outline: none; }
      `}</style>
    </div>
  );
}
