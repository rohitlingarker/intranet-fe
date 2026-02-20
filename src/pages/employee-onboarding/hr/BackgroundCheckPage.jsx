import React, { useState, useMemo } from "react";

/* =====================================================
   ENUMS
===================================================== */

const STATUS = {
  PENDING: "PENDING",
  IN_REVIEW: "IN_REVIEW",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
};

const MODES = {
  HR: "HR",
  CONSULTANCY: "CONSULTANCY",
};

/* =====================================================
   MOCK DATA (All 9 Checks Implemented)
===================================================== */

const initialSections = [
  {
    id: 1,
    title: "ID Verification",
    status: STATUS.PENDING,
    mode: MODES.HR,
    details: {
      "ID Type": "Aadhaar",
      "Document Required":
        "Pan card copy / Passport / Aadhaar",
    },
  },
  {
    id: 2,
    title: "Professional Reference Check",
    status: STATUS.PENDING,
    mode: MODES.HR,
    details: {
      Name: "Rajesh Kumar",
      Email: "rajesh@email.com",
      Contact: "98XXXXXX21",
      Designation: "Project Manager",
    },
  },
  {
    id: 3,
    title: "Address Verification (Digital)",
    status: STATUS.PENDING,
    mode: MODES.CONSULTANCY,
    details: {
      Address: "Flat 302, Green Residency",
      Landmark: "Near Metro",
      Pincode: "500032",
    },
  },
  {
    id: 4,
    title: "Global Compliance Screening",
    status: STATUS.PENDING,
    mode: MODES.CONSULTANCY,
    details: {
      Name: "Sathwik Patel",
      "Father Name": "Ramesh Patel",
      DOB: "12-06-2000",
      Email: "sathwik@email.com",
    },
  },
  {
    id: 5,
    title: "Employment Record Verification",
    status: STATUS.PENDING,
    mode: MODES.HR,
    details: {
      Company: "TCS",
      "Relieving Letter": "Uploaded",
    },
  },
  {
    id: 6,
    title: "Criminal Court Record Verification",
    status: STATUS.PENDING,
    mode: MODES.CONSULTANCY,
    details: {
      DOB: "12-06-2000",
      "Father Name": "Ramesh Patel",
      Address: "Hyderabad",
    },
  },
  {
    id: 7,
    title: "Education Record Verification",
    status: STATUS.PENDING,
    mode: MODES.HR,
    details: {
      Degree: "B.Tech CSE",
      Document:
        "Provisional / Degree Certificate / Marks Memo",
    },
  },
  {
    id: 8,
    title: "CIBIL Check",
    status: STATUS.PENDING,
    mode: MODES.CONSULTANCY,
    details: {
      "Present Address": "Hyderabad",
      "Bank Statement": "Required",
    },
  },
  {
    id: 9,
    title: "Address Verification (Physical)",
    status: STATUS.PENDING,
    mode: MODES.CONSULTANCY,
    details: {
      Address: "Flat 302, Green Residency",
      Landmark: "Near Metro",
      Pincode: "500032",
    },
  },
];

/* =====================================================
   STATUS BADGE
===================================================== */

const StatusBadge = ({ status }) => {
  const map = {
    VERIFIED: "bg-green-100 text-green-700",
    IN_REVIEW: "bg-blue-100 text-blue-700",
    PENDING: "bg-gray-100 text-gray-600",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${map[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function BackgroundCheckPage() {
  const [sections, setSections] =
    useState(initialSections);
  const [expanded, setExpanded] = useState(null);
  const [role, setRole] = useState("HR"); // HR or EMPLOYEE
  const [filter, setFilter] = useState("ALL");

  /* ================= Progress ================= */

  const verifiedCount = useMemo(
    () =>
      sections.filter(
        (s) => s.status === STATUS.VERIFIED
      ).length,
    [sections]
  );

  const progress = Math.round(
    (verifiedCount / sections.length) * 100
  );

  const overallStatus =
    progress === 100 ? "COMPLETED" : "IN_PROGRESS";

  /* ================= Update Section ================= */

  const updateSection = (id, changes) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...changes } : s
      )
    );
  };

  /* ================= Filtered Sections ================= */

  const visibleSections =
    filter === "ALL"
      ? sections
      : sections.filter((s) => s.status === filter);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h1 className="text-2xl font-bold">
          Background Check
        </h1>
        <p className="text-sm text-gray-600">
          Overall Status: {overallStatus}
        </p>

        <div className="mt-3 flex justify-between text-sm">
          <span>{progress}% Completed</span>
          <span>
            {verifiedCount}/{sections.length} Verified
          </span>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded-full mt-2">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ROLE SWITCH */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setRole("HR")}
          className={`px-4 py-2 rounded-md ${
            role === "HR"
              ? "bg-blue-600 text-white"
              : "bg-white shadow"
          }`}
        >
          HR View
        </button>
        <button
          onClick={() => setRole("EMPLOYEE")}
          className={`px-4 py-2 rounded-md ${
            role === "EMPLOYEE"
              ? "bg-blue-600 text-white"
              : "bg-white shadow"
          }`}
        >
          Employee View
        </button>
      </div>

      {/* FILTER */}
      <div className="mb-6">
        <select
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="IN_REVIEW">
            In Review
          </option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* SECTION CARDS */}
      <div className="space-y-4">
        {visibleSections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-2xl shadow"
          >
            <div
              onClick={() =>
                setExpanded(
                  expanded === section.id
                    ? null
                    : section.id
                )
              }
              className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50"
            >
              <h3 className="font-semibold">
                {section.title}
              </h3>
              <StatusBadge
                status={section.status}
              />
            </div>

            {expanded === section.id && (
              <div className="px-6 pb-6 border-t">
                <div className="mt-4 space-y-2 text-sm">
                  {Object.entries(
                    section.details
                  ).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex"
                    >
                      <span className="w-48 font-medium">
                        {k}:
                      </span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>

                {/* HR ACTIONS */}
                {role === "HR" && (
                  <div className="flex gap-3 mt-5">
                    {section.mode ===
                      MODES.CONSULTANCY && (
                      <button
                        onClick={() =>
                          updateSection(
                            section.id,
                            {
                              status:
                                STATUS.IN_REVIEW,
                            }
                          )
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-md"
                      >
                        Send to Consultancy
                      </button>
                    )}

                    <button
                      onClick={() =>
                        updateSection(
                          section.id,
                          {
                            status:
                              STATUS.VERIFIED,
                          }
                        )
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateSection(
                          section.id,
                          {
                            status:
                              STATUS.REJECTED,
                          }
                        )
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* EMPLOYEE VIEW */}
                {role === "EMPLOYEE" && (
                  <div className="mt-5 text-sm text-gray-500">
                    Waiting for verification...
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}