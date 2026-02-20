import React, { useState } from "react";

/* ================= MOCK DATA ================= */

const initialData = {
  employee: {
    name: "Sathwik Patel",
    id: "EMP-510023",
    designation: "Software Engineer",
    joiningDate: "12 Feb 2026",
  },
  overallStatus: "IN_PROGRESS",
  sections: [
    {
      id: 1,
      title: "ID Verification",
      status: "VERIFIED",
      mode: "HR",
      details: {
        type: "Aadhaar",
        number: "XXXX-XXXX-4321",
        document: "aadhaar.pdf",
      },
      remarks: "Verified successfully",
    },
    {
      id: 2,
      title: "Education Verification",
      status: "IN_REVIEW",
      mode: "CONSULTANCY",
      details: {
        degree: "B.Tech CSE",
        university: "JNTU Hyderabad",
        year: "2022",
      },
      remarks: "",
    },
    {
      id: 3,
      title: "Employment Verification",
      status: "PENDING",
      mode: "HR",
      details: {
        company: "TCS",
        designation: "Associate Engineer",
      },
      remarks: "",
    },
  ],
};

/* ================= STATUS BADGE ================= */

const StatusBadge = ({ status }) => {
  const map = {
    VERIFIED: "bg-green-100 text-green-700",
    IN_REVIEW: "bg-blue-100 text-blue-700",
    PENDING: "bg-gray-100 text-gray-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium ${map[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

/* ================= MAIN COMPONENT ================= */

export default function BackgroundCheckPage() {
  const [data, setData] = useState(initialData);
  const [verificationMode, setVerificationMode] = useState("HR"); // Global Mode

  const verifiedCount = data.sections.filter(
    (s) => s.status === "VERIFIED"
  ).length;

  const progress = Math.round(
    (verifiedCount / data.sections.length) * 100
  );

  /* ======== HR ACTIONS ======== */

  const updateStatus = (id, newStatus) => {
    const updated = data.sections.map((sec) =>
      sec.id === id ? { ...sec, status: newStatus } : sec
    );
    setData({ ...data, sections: updated });
  };

  const updateSectionMode = (id, mode) => {
    const updated = data.sections.map((sec) =>
      sec.id === id ? { ...sec, mode } : sec
    );
    setData({ ...data, sections: updated });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {data.employee.name}
        </h1>
        <p className="text-gray-600 text-sm">
          {data.employee.id} | {data.employee.designation}
        </p>
        <p className="text-gray-600 text-sm">
          Joining Date: {data.employee.joiningDate}
        </p>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Completion</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ================= VERIFICATION MODE ================= */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-3">Verification Mode</h2>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={verificationMode === "HR"}
              onChange={() => setVerificationMode("HR")}
            />
            HR Self Verification
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={verificationMode === "CONSULTANCY"}
              onChange={() => setVerificationMode("CONSULTANCY")}
            />
            External Consultancy
          </label>
        </div>
      </div>

      {/* ================= SECTION CARDS ================= */}
      <div className="space-y-6">
        {data.sections.map((section) => (
          <div
            key={section.id}
            className="bg-white shadow rounded-2xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                {section.title}
              </h3>
              <StatusBadge status={section.status} />
            </div>

            {/* Details */}
            <div className="text-sm text-gray-600 mb-4 space-y-1">
              {Object.entries(section.details).map(([key, value]) => (
                <p key={key}>
                  <span className="capitalize font-medium">
                    {key}:
                  </span>{" "}
                  {value}
                </p>
              ))}
            </div>

            {/* Section Level Mode */}
            <div className="mb-4">
              <label className="text-sm font-medium">
                Verification Mode:
              </label>
              <select
                className="ml-3 border px-3 py-1 rounded-md text-sm"
                value={section.mode}
                onChange={(e) =>
                  updateSectionMode(section.id, e.target.value)
                }
              >
                <option value="HR">HR</option>
                <option value="CONSULTANCY">Consultancy</option>
              </select>
            </div>

            {/* HR FLOW */}
            {section.mode === "HR" && (
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    updateStatus(section.id, "VERIFIED")
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    updateStatus(section.id, "REJECTED")
                  }
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Reject
                </button>
              </div>
            )}

            {/* CONSULTANCY FLOW */}
            {section.mode === "CONSULTANCY" && (
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    updateStatus(section.id, "IN_REVIEW")
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Send to Consultancy
                </button>
                <button
                  onClick={() =>
                    updateStatus(section.id, "VERIFIED")
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Mark Verified
                </button>
              </div>
            )}

            {/* Remarks */}
            {section.remarks && (
              <div className="mt-4 text-sm text-gray-500">
                <strong>Remarks:</strong> {section.remarks}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}