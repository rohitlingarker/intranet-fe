"use client";

import React from "react";
import { FileText, Upload } from "lucide-react";

export default function DocumentsPage({ employee }) {

  /* ---------------- MOCK SUBMITTED DOCUMENTS ---------------- */

  const documents = {
    aadhaar: {
      number: "XXXX-XXXX-4779",
      name: employee.name,
      address: "5-15, Eshwar Colony",
      gender: "Female",
      status: "submitted"
    },
    pan: {
      number: "XXXXX473G",
      name: employee.name,
      dob: "13 Jun 2001",
      parent_name: "Venkata Narasayya",
      status: "submitted"
    },
    experience: {
      company: "ABC Technologies",
      role: "Intern",
      duration: "Feb 2023 - May 2023",
      status: "submitted"
    }
  };

  return (
    <div className="space-y-6">

      <h2 className="text-lg font-semibold mb-6">My Documents</h2>

      <div className="space-y-6">

        {/* ---------------- AADHAAR ---------------- */}
        {documents.aadhaar.status === "submitted" && (
          <DocumentSection title="Aadhaar Card">
            <DocRow label="Aadhaar Number" value={documents.aadhaar.number} />
            <DocRow label="Name" value={documents.aadhaar.name} />
            <DocRow label="Address" value={documents.aadhaar.address} />
            <DocRow label="Gender" value={documents.aadhaar.gender} />
          </DocumentSection>
        )}

        {/* ---------------- PAN ---------------- */}
        {documents.pan.status === "submitted" && (
          <DocumentSection title="PAN Card">
            <DocRow label="PAN Number" value={documents.pan.number} />
            <DocRow label="Name" value={documents.pan.name} />
            <DocRow label="Date of Birth" value={documents.pan.dob} />
            <DocRow label="Parent Name" value={documents.pan.parent_name} />
          </DocumentSection>
        )}

        {/* ---------------- EXPERIENCE ---------------- */}
        {documents.experience.status === "submitted" && (
          <DocumentSection title="Previous Experience">
            <DocRow label="Company" value={documents.experience.company} />
            <DocRow label="Role" value={documents.experience.role} />
            <DocRow label="Duration" value={documents.experience.duration} />
          </DocumentSection>
        )}

      </div>
    </div>
  );
}

/* ---------------- DOCUMENT SECTION ---------------- */

const DocumentSection = ({ title, children }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-indigo-100 overflow-hidden">
    <div className="flex justify-between items-center px-6 py-4 border-b border-indigo-100 bg-indigo-50/60">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-indigo-600" />
        <h3 className="text-sm font-semibold text-indigo-800">
          {title}
        </h3>
      </div>
    </div>

    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      {children}
    </div>
  </div>
);

/* ---------------- DOCUMENT ROW ---------------- */

const DocRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value || "Not Available"}</p>
  </div>
);
