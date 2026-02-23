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

const STATUS_COLORS = {
  VERIFIED: "#16a34a",
  IN_REVIEW: "#2563eb",
  PENDING: "#9ca3af",
  REJECTED: "#dc2626",
};

/* =====================================================
   MOCK DATA
===================================================== */

const initialSections = [
  {
    id: 1,
    title: "ID Verification",
    status: STATUS.PENDING,
    details: {
      "ID Type": "Aadhaar",
      "Document Required": "Pan / Passport / Aadhaar",
    },
  },
  {
    id: 2,
    title: "Professional Reference Check",
    status: STATUS.PENDING,
    details: {
      Name: "Rajesh Kumar",
      Email: "rajesh@email.com",
      Contact: "98XXXXXX21",
      Designation: "Project Manager",
    },
  },
  {
    id: 3,
    title: "Address Verification (Digital & Physical)",
    status: STATUS.PENDING,
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
    details: {
      Company: "TCS",
      "Relieving Letter": "Uploaded",
    },
  },
  {
    id: 6,
    title: "Criminal Court Record Verification",
    status: STATUS.PENDING,
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
    details: {
      Degree: "B.Tech CSE",
      Document: "Degree Certificate",
    },
  },
  {
    id: 8,
    title: "CIBIL Check",
    status: STATUS.PENDING,
    details: {
      "Present Address": "Hyderabad",
      "Bank Statement": "Required",
    },
  },
  {
    id: 9,
    title: "Address Verification (Physical)",
    status: STATUS.PENDING,
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

const StatusBadge = ({ status }) => (
  <span
    className="px-3 py-1 text-xs font-semibold rounded-full"
    style={{
      backgroundColor: STATUS_COLORS[status] + "20",
      color: STATUS_COLORS[status],
    }}
  >
    {status.replace("_", " ")}
  </span>
);

/* =====================================================
   PROFESSIONAL DONUT
===================================================== */

const DonutChart = ({ analytics, selectedFilter, onSelectStatus }) => {
  const [hovered, setHovered] = useState(null);

  const total = Object.values(analytics).reduce((a, b) => a + b, 0);
  const radius = 72;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="relative flex items-center justify-center mt-6">
      <svg width="220" height="220">
        <g transform="translate(110,110)">
          {Object.entries(analytics).map(([key, value]) => {
            if (value === 0) return null;

            const percentage = value / total;
            const dash = percentage * circumference;
            const gap = circumference - dash;

            const isHovered = hovered === key;
            const isSelected = selectedFilter === key;

            const circle = (
              <circle
                key={key}
                r={radius}
                cx="0"
                cy="0"
                fill="transparent"
                stroke={STATUS_COLORS[key]}
                strokeWidth={
                  isHovered || isSelected
                    ? strokeWidth + 4
                    : strokeWidth
                }
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-accumulatedOffset}
                transform="rotate(-90)"
                style={{
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  filter: isHovered
                    ? "drop-shadow(0px 0px 6px rgba(0,0,0,0.2))"
                    : "none",
                }}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                onClick={() =>
                  onSelectStatus(
                    selectedFilter === key ? "ALL" : key
                  )
                }
              />
            );

            accumulatedOffset += dash;
            return circle;
          })}
        </g>
      </svg>

      <div className="absolute text-center">
        {hovered ? (
          <>
            <p className="text-sm font-semibold text-gray-800">
              {hovered.replace("_", " ")}
            </p>
            <p
              className="text-lg font-bold"
              style={{ color: STATUS_COLORS[hovered] }}
            >
              {analytics[hovered]}
            </p>
          </>
        ) : selectedFilter !== "ALL" ? (
          <>
            <p className="text-sm font-semibold text-gray-800">
              {selectedFilter.replace("_", " ")}
            </p>
            <p
              className="text-lg font-bold"
              style={{ color: STATUS_COLORS[selectedFilter] }}
            >
              {analytics[selectedFilter]}
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-800">
              {total}
            </p>
            <p className="text-xs text-gray-500">
              Total Checks
            </p>
          </>
        )}
      </div>
    </div>
  );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function BackgroundCheckPage() {
  const [sections, setSections] = useState(initialSections);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const analytics = useMemo(
    () => ({
      VERIFIED: sections.filter((s) => s.status === STATUS.VERIFIED).length,
      IN_REVIEW: sections.filter((s) => s.status === STATUS.IN_REVIEW).length,
      PENDING: sections.filter((s) => s.status === STATUS.PENDING).length,
      REJECTED: sections.filter((s) => s.status === STATUS.REJECTED).length,
    }),
    [sections]
  );

  const verifiedCount = analytics.VERIFIED;
  const progress = Math.round((verifiedCount / sections.length) * 100);
  const overallStatus =
    progress === 100 ? "COMPLETED" : "IN_PROGRESS";

  const updateSection = (id, changes) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...changes } : s
      )
    );
  };

  const visibleSections =
    filter === "ALL"
      ? sections
      : sections.filter((s) => s.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* HEADER */}
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm mb-4">

        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Background Check
          </h1>
          <h1>
            <span className="text-sm text-gray-600">
              Employee:{" "}
              <span className="font-medium text-gray-800">
                Sathwik Patel
              </span>
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Overall Status: {overallStatus}
          </p>
        </div>

        {/* SIDE BY SIDE SECTION */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* LEFT SIDE → PROGRESS */}
          <div className="flex-1 w-full">

            <div className="flex justify-between items-center text-sm font-medium mb-3">
              <span>{progress}% Completed</span>
              <span>
                {verifiedCount}/{sections.length} Verified
              </span>
            </div>

            <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>

          </div>

          {/* RIGHT SIDE → DONUT */}
          <div className="flex justify-center items-center">
            <DonutChart
              analytics={analytics}
              selectedFilter={filter}
              onSelectStatus={setFilter}
            />
          </div>

        </div>
      </div>

      {/* FILTER */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* SECTION CARDS */}
      <div className="space-y-4">
        {visibleSections.map((section) => (
          <div key={section.id} className="bg-white rounded-2xl shadow">
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
              <StatusBadge status={section.status} />
            </div>

            {expanded === section.id && (
              <div className="px-6 pb-6 border-t">
                <div className="mt-4 space-y-2 text-sm">
                  {Object.entries(section.details).map(([k, v]) => (
                    <div key={k} className="flex">
                      <span className="w-48 font-medium">
                        {k}:
                      </span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() =>
                      updateSection(section.id, {
                        status: STATUS.IN_REVIEW,
                      })
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Send to Consultancy
                  </button>

                  <button
                    onClick={() =>
                      updateSection(section.id, {
                        status: STATUS.VERIFIED,
                      })
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateSection(section.id, {
                        status: STATUS.REJECTED,
                      })
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded-md"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}