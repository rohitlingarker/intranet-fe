"use client";

import React, { useState } from "react";
import { Pencil, X } from "lucide-react";

export default function ProfilePage({ activeTab }) {

  if (activeTab !== "profile") return null;

  const [editSection, setEditSection] = useState(null);

  /* ---------------- PRIMARY STATE ---------------- */

  const [primaryData, setPrimaryData] = useState({
    first_name: "Lokeswari",
    middle_name: "",
    last_name: "Busam",
    display_name: "Busam Lokeswari",
    gender: "Female",
    dob: "2002-12-16",
    marital_status: "Single",
    blood_group: "AB+",
    physically_handicapped: "No",
    nationality: "India",
  });

  /* ---------------- CONTACT STATE ---------------- */

  const [contactData, setContactData] = useState({
    work_email: "lokeswari.busam@pavestechnologies.com",
    personal_email: "lokeswari.busam@gmail.com",
    country_code: "+91",
    mobile_number: "8074718830",
    emergency_number: "9876543210",
    work_number: "",
    residence_number: "",
  });

  /* ---------------- ADDRESS STATE ---------------- */

  const [addressData, setAddressData] = useState({
    current: {
      country: "India",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    },
    permanent: {
      country: "India",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    },
    sameAsCurrent: false,
  });

  /* ---------------- RELATIONS STATE ---------------- */

  const [relationData, setRelationData] = useState({
    father: "Srinivas Busam",
    spouse: "Not Applicable",
  });

  /* ---------------- EDUCATION STATE ---------------- */

  const [educationData, setEducationData] = useState({
    degree: "B.Tech",
    specialization: "Computer Science and Engineering",
    institution: "Padmavati College of Engineering",
    year: "2024",
  });

  /* ---------------- EXPERIENCE STATE ---------------- */

  const [experienceData, setExperienceData] = useState({
    company: "ABC Technologies",
    role: "Intern",
    duration: "Feb 2023 - May 2023",
  });

  /* ---------------- IDENTITY STATE ---------------- */

  const [identityData, setIdentityData] = useState({
    aadhaar: "XXXX-XXXX-1234",
    pan: "ABCDE1234F",
  });
  
  /* ---------------- SOCIAL MEDIA STATE ---------------- */

  const [socialData, setSocialData] = useState({
    github: "https://github.com/username",
    linkedin: "https://linkedin.com/in/username",
  });

  return (
    <div className="space-y-6">

      {/* ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">

        <Section title="Primary Details" onEdit={() => setEditSection("primary")}>
          <Row label="First Name" value={primaryData.first_name} />
          <Row label="Last Name" value={primaryData.last_name} />
          <Row label="Gender" value={primaryData.gender} />
          <Row label="Date of Birth" value={primaryData.dob} />
          <Row label="Blood Group" value={primaryData.blood_group} />
          <Row label="Marital Status" value={primaryData.marital_status} />
          <Row label="Nationality" value={primaryData.nationality} />
        </Section>

        <Section title="Contact Details" onEdit={() => setEditSection("contact")}>
          <Row label="Work Email" value={contactData.work_email} />
          <Row label="Personal Email" value={contactData.personal_email} />
          <Row label="Mobile Number" value={`${contactData.country_code} ${contactData.mobile_number}`} />
          <Row label="Emergency Number" value={`${contactData.country_code} ${contactData.emergency_number}`} />
        </Section>

      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">

        <Section title="Addresses" onEdit={() => setEditSection("address")}>
          <Row label="Current Address" value={`${addressData.current.line1}, ${addressData.current.city}`} />
          <Row label="Permanent Address" value={`${addressData.permanent.line1}, ${addressData.permanent.city}`} />
        </Section>

        <Section title="Relations" onEdit={() => setEditSection("relations")}>
          <Row label="Father" value={relationData.father} />
          <Row label="Spouse" value={relationData.spouse} />
        </Section>

      </div>

      {/* ROW 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">

        <Section title="Education" onEdit={() => setEditSection("education")}>
          <Row label="Degree" value={educationData.degree} />
          <Row label="Specialization" value={educationData.specialization} />
          <Row label="Institution/College" value={educationData.institution} />
          <Row label="Year" value={educationData.year} />

        </Section>

        <Section title="Experience" onEdit={() => setEditSection("experience")}>
          <Row label="Company" value={experienceData.company} />
          <Row label="Role" value={experienceData.role} />
          <Row label="Duration" value={experienceData.duration} />
        </Section>

      </div>

      {/* ROW 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">

        <Section title="Identity Information" onEdit={() => setEditSection("identity")}>
          <Row label="Aadhaar" value={identityData.aadhaar} />
          <Row label="PAN" value={identityData.pan} />
        </Section>
        
        <Section title="Social Media" onEdit={() => setEditSection("social")}>
          <Row label="GitHub" value={socialData.github} />
          <Row label="LinkedIn" value={socialData.linkedin} />
        </Section>

      </div>

      {/* MODALS */}
      {editSection === "primary" && <PrimaryModal data={primaryData} setData={setPrimaryData} onClose={() => setEditSection(null)} />}
      {editSection === "contact" && <ContactModal data={contactData} setData={setContactData} onClose={() => setEditSection(null)} />}
      {editSection === "address" && <AddressModal data={addressData} setData={setAddressData} onClose={() => setEditSection(null)} />}
      {editSection === "relations" && <RelationsModal data={relationData} setData={setRelationData} onClose={() => setEditSection(null)} />}
      {editSection === "education" && <EducationModal data={educationData} setData={setEducationData} onClose={() => setEditSection(null)} />}
      {editSection === "experience" && <ExperienceModal data={experienceData} setData={setExperienceData} onClose={() => setEditSection(null)} />}
      {editSection === "identity" && <IdentityModal data={identityData} setData={setIdentityData} onClose={() => setEditSection(null)} />}
      {editSection === "social" && <SocialModal data={socialData} setData={setSocialData} onClose={() => setEditSection(null)} />}

    </div>
  );
}

/* ---------------- COMMON UI COMPONENTS ---------------- */

const Section = ({ title, children, onEdit }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-indigo-100 overflow-hidden">
    <div className="flex justify-between items-center px-6 py-4 border-b border-indigo-100 bg-indigo-50/60">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <button onClick={onEdit} className="flex items-center gap-1 text-xs text-indigo-600">
        <Pencil size={14} /> Edit
      </button>
    </div>
    <div className="p-5 space-y-3">{children}</div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm min-w-0">
    <span className="text-gray-500 shrink-0">{label}</span>
    <span className="text-gray-900 font-medium text-right break-words min-w-0">
      {value}
    </span>
  </div>
);

const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-gray-600 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border rounded px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
    />
  </div>
);

const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
      <div className="flex justify-between items-center px-8 py-5 border-b">
        <h3 className="text-xl font-medium">{title}</h3>
        <button onClick={onClose}><X size={22} /></button>
      </div>
      <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">{children}</div>
      <div className="flex justify-end gap-4 px-8 py-6 border-t bg-gray-50">
        <button onClick={onClose} className="px-6 py-2 border rounded text-sm">Cancel</button>
        <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded text-sm">Update</button>
      </div>
    </div>
  </div>
);

/* ---------------- INDIVIDUAL MODALS ---------------- */

const PrimaryModal = ({ data, setData, onClose }) => (
  <ModalWrapper title="Primary Details" onClose={onClose}>
    <Input label="First Name" name="first_name" value={data.first_name} onChange={(e)=>setData({...data,first_name:e.target.value})}/>
    <Input label="Last Name" name="last_name" value={data.last_name} onChange={(e)=>setData({...data,last_name:e.target.value})}/>
    <Input label="Gender" name="gender" value={data.gender} onChange={(e)=>setData({...data,gender:e.target.value})}/>
    <Input label="Date of Birth" type="date" name="dob" value={data.dob} onChange={(e)=>setData({...data,dob:e.target.value})}/>
    <Input label="Blood Group" name="blood_group" value={data.blood_group} onChange={(e)=>setData({...data,blood_group:e.target.value})}/>
    <Input label="Marital Status" name="marital_status" value={data.marital_status} onChange={(e)=>setData({...data,marital_status:e.target.value})}/>
    <Input label="Nationality" name="nationality" value={data.nationality} onChange={(e)=>setData({...data,nationality:e.target.value})}/>
  </ModalWrapper>
);

const ContactModal = ({ data, setData, onClose }) => (
  <ModalWrapper title="Contact Details" onClose={onClose}>
    <Input label="Work Email" name="work_email" value={data.work_email} onChange={(e)=>setData({...data,work_email:e.target.value})}/>
    <Input label="Personal Email" name="personal_email" value={data.personal_email} onChange={(e)=>setData({...data,personal_email:e.target.value})}/>
    <Input label="Mobile Number" name="mobile_number" value={data.mobile_number} onChange={(e)=>setData({...data,mobile_number:e.target.value})}/>
    <Input label="Emergency Number" name="emergency_number" value={data.emergency_number} onChange={(e)=>setData({...data,emergency_number:e.target.value})}/>
  </ModalWrapper>
);

const AddressModal = ({ data, setData, onClose }) => (
  <ModalWrapper title="Addresses" onClose={onClose}>
    <Input label="Current Address Line 1" name="line1" value={data.current.line1} onChange={(e)=>setData({...data,current:{...data.current,line1:e.target.value}})}/>
    <Input label="Permanent Address Line 1" name="line1" value={data.permanent.line1} onChange={(e)=>setData({...data,permanent:{...data.permanent,line1:e.target.value}})}/>
  </ModalWrapper>
);

const RelationsModal = ({ data, setData, onClose }) => (
  <ModalWrapper title="Relations" onClose={onClose}>
    <Input label="Father" name="father" value={data.father} onChange={(e)=>setData({...data,father:e.target.value})}/>
    <Input label="Spouse" name="spouse" value={data.spouse} onChange={(e)=>setData({...data,spouse:e.target.value})}/>
  </ModalWrapper>
);

const EducationModal = ({ data, setData, onClose }) => (
  <ModalWrapper title="Education" onClose={onClose}>
    <Input label="Degree" name="degree" value={data.degree} onChange={(e)=>setData({...data,degree:e.target.value})}/>
    <Input label="Specialization" name="specialization" value={data.specialization} onChange={(e)=>setData({...data,specialization:e.target.value})}/>
    <Input label="Institution" name="institution" value={data.institution} onChange={(e)=>setData({...data,institution:e.target.value})}/>
  </ModalWrapper>
);

const ExperienceModal = ({ data, setData, onClose }) => (
  <ModalWrapper title="Experience" onClose={onClose}>
    <Input label="Company" name="company" value={data.company} onChange={(e)=>setData({...data,company:e.target.value})}/>
    <Input label="Role" name="role" value={data.role} onChange={(e)=>setData({...data,role:e.target.value})}/>
  </ModalWrapper>
);

const IdentityModal = ({ data, setData, onClose }) => (
  <ModalWrapper title="Identity Information" onClose={onClose}>
    <Input label="Aadhaar" name="aadhaar" value={data.aadhaar} onChange={(e)=>setData({...data,aadhaar:e.target.value})}/>
    <Input label="PAN" name="pan" value={data.pan} onChange={(e)=>setData({...data,pan:e.target.value})}/>
  </ModalWrapper>
);

const SocialModal = ({ data, setData, onClose }) => (
  <ModalWrapper title="Social Media Links" onClose={onClose}>
    <Input
      label="GitHub Profile URL"
      name="github"
      value={data.github}
      onChange={(e) => setData({ ...data, github: e.target.value })}
    />
    <Input
      label="LinkedIn Profile URL"
      name="linkedin"
      value={data.linkedin}
      onChange={(e) => setData({ ...data, linkedin: e.target.value })}
    />
  </ModalWrapper>
);