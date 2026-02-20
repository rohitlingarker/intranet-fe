"use client";

import React, { useState, useRef } from "react";
import {
  Mail,
  Phone,
  Building2,
  User,
  GraduationCap,
  Camera,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
} from "lucide-react";
import ProfilePage from "./ProfilePage";
import JobPage from "./JobPage";
import DocumentsPage from "./DocumentsPage";

export default function EmployeeProfileView() {

  /* ---------------- ACTIVE TAB STATE ---------------- */
  const [activeTab, setActiveTab] = useState("about");

  /* ---------------- IMAGE STATES ---------------- */
  const [profileImg, setProfileImg] = useState(null);
  const [coverImg, setCoverImg] = useState(
    "https://images.unsplash.com/photo-1503264116251-35a269479413?w=1200"
  );

  const profileRef = useRef(null);
  const coverRef = useRef(null);

  const handleProfileChange = (file) => {
    if (file) setProfileImg(URL.createObjectURL(file));
  };

  const handleCoverChange = (file) => {
    if (file) setCoverImg(URL.createObjectURL(file));
  };

  /* ---------------- MOCK DATA ---------------- */
  const employee = {
    name: "Busam Lokeswari",
    designation: "Graduate Software Engineer",
    email: "lokeswaribusam216@gmail.com",
    phone: "+91 8074718830",
    office: "Hyderabad Office",
    empId: "5100008",
    department: "Engineering",
    reportingManager: "Rama Gopal Durgam",
  };

  /* ---------------- ABOUT STATE ---------------- */
  const [about, setAbout] = useState({
    summary: "",
    loveJob: "",
    hobbies: "",
  });

  const [editingField, setEditingField] = useState(null);
  const editorRef = useRef(null);

  const formatText = (cmd) => {
    document.execCommand(cmd, false, null);
  };

  const saveField = (key) => {
    setAbout({
      ...about,
      [key]: editorRef.current.innerHTML,
    });
    setEditingField(null);
  };

  const AboutBlock = ({ title, fieldKey }) => (
    <div className="mb-6">
      <h4 className="font-medium mb-2">{title}</h4>

      {editingField === fieldKey ? (
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="flex gap-3 p-2 border-b bg-gray-50 text-gray-600">
            <button onClick={() => formatText("bold")}><Bold size={16} /></button>
            <button onClick={() => formatText("italic")}><Italic size={16} /></button>
            <button onClick={() => formatText("underline")}><Underline size={16} /></button>
            <button onClick={() => formatText("insertUnorderedList")}><List size={16} /></button>
            <button onClick={() => formatText("insertOrderedList")}><ListOrdered size={16} /></button>
            <button onClick={() => formatText("createLink")}><Link size={16} /></button>
          </div>

          <div
            ref={editorRef}
            contentEditable
            className="p-3 min-h-[120px] outline-none text-sm"
            dangerouslySetInnerHTML={{ __html: about[fieldKey] }}
          />

          <div className="flex justify-end gap-3 p-3 border-t bg-gray-50">
            <button
              onClick={() => setEditingField(null)}
              className="px-4 py-1 text-sm border rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => saveField(fieldKey)}
              className="px-4 py-1 text-sm bg-indigo-600 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      ) : about[fieldKey] ? (
        <div
          className="text-sm text-gray-700"
          dangerouslySetInnerHTML={{ __html: about[fieldKey] }}
        />
      ) : (
        <button
          onClick={() => setEditingField(fieldKey)}
          className="text-indigo-600 border px-3 py-1 rounded-md text-sm"
        >
          Add your response
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      {/* ---------------- HEADER ---------------- */}
      <div className="relative h-48 w-full group overflow-hidden">
        <img src={coverImg} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <div
          onClick={() => coverRef.current.click()}
          className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
        >
          <Camera size={18} />
        </div>

        <input hidden ref={coverRef} type="file" accept="image/*"
          onChange={(e) => handleCoverChange(e.target.files[0])}
        />

        <div className="absolute bottom-6 left-10 flex items-center gap-6 text-white">
          <div
            onClick={() => profileRef.current.click()}
            className="relative w-28 h-28 rounded-full border-4 border-white shadow-xl cursor-pointer overflow-hidden"
          >
            {profileImg ? (
              <img src={profileImg} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-3xl font-semibold">
                {employee.name.charAt(0)}
              </div>
            )}
          </div>

          <input hidden ref={profileRef} type="file" accept="image/*"
            onChange={(e) => handleProfileChange(e.target.files[0])}
          />

          <div>
            <h1 className="text-2xl font-semibold">{employee.name}</h1>
            <p className="opacity-90">{employee.designation}</p>
          </div>
        </div>
      </div>

      {/* ---------------- QUICK INFO ---------------- */}
      <div className="bg-white px-6 py-3 shadow flex flex-wrap gap-6 text-sm">
        <Info icon={<Mail size={16} />} text={employee.email} />
        <Info icon={<Phone size={16} />} text={employee.phone} />
        <Info icon={<Building2 size={16} />} text={employee.office} />
        <Info icon={<User size={16} />} text={employee.empId} />
      </div>

      {/* ---------------- DEPARTMENT ROW ---------------- */}
      <div className="bg-white px-6 py-4 shadow text-sm">
        <div className="flex flex-wrap gap-12">
          <div>
            <p className="text-xs text-gray-400">Department</p>
            <p className="font-medium text-gray-800">{employee.department}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Reporting Manager</p>
            <p className="font-medium text-indigo-600 hover:underline cursor-pointer transition duration-200">
              {employee.reportingManager}
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- TABS ---------------- */}
      <div className="bg-white mt-2 px-6 border-b flex gap-6 text-sm font-medium">
        <Tab active={activeTab === "about"} onClick={() => setActiveTab("about")}>About</Tab>
        <Tab active={activeTab === "profile"} onClick={() => setActiveTab("profile")}>Profile</Tab>
        <Tab active={activeTab === "job"} onClick={() => setActiveTab("job")}>Job</Tab>
        <Tab active={activeTab === "documents"} onClick={() => setActiveTab("documents")}>Documents</Tab>
      </div>

      {/* ---------------- CONTENT SWITCH ---------------- */}
      {activeTab === "about" && (
        <div className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card title="About">
              <AboutBlock title="About" fieldKey="summary" />
              <AboutBlock title="What I love about my job?" fieldKey="loveJob" />
              <AboutBlock title="My interests and hobbies" fieldKey="hobbies" />
            </Card>
          </div>

          <div>
            <Card title="Skills">
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-sm">
                <GraduationCap size={40} className="mb-3 opacity-40" />
                <p>No skills added yet :(</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <ProfilePage
          activeTab={activeTab}
          employee={employee}
          about={about}
          setAbout={setAbout}
          editingField={editingField}
          setEditingField={setEditingField}
          editorRef={editorRef}
          formatText={formatText}
          saveField={saveField}
          AboutBlock={AboutBlock}
        />
      )}

      {activeTab === "job" && (
        <JobPage employee={employee} />
      )}

      {activeTab === "documents" && (
        <DocumentsPage employee={employee} />
      )}

    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Info = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-gray-700">
    {icon}
    {text}
  </div>
);

const Tab = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`py-3 ${active ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-600"}`}
  >
    {children}
  </button>
);

const Card = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow p-5">
    <h3 className="font-semibold mb-4">{title}</h3>
    {children}
  </div>
);
