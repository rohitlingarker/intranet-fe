"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Table from "../../../components/Table/table";
import Pagination from "../../../components/Pagination/pagination";
import StatusBadge from "../../../components/status/statusbadge";
import EmployeeCreateModal from "./components/EmployeeCreateModal";

const PAGE_SIZE = 5;

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
];

function ActionMenu({ onView }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="px-2 py-1 text-xl font-bold text-gray-600 hover:text-gray-900"
      >
        &#8942;
      </button>

      {open && (
        <div className="absolute right-full mr-2 top-0 w-32 bg-white border rounded-md shadow-lg z-50">
          <button
            onClick={() => {
              onView();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
}

export default function EmployeeOnboardingPage() {

  const navigate = useNavigate();
  const location = useLocation();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUserUuid, setSelectedUserUuid] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  /* ============================
     FETCH EMPLOYEES
  ============================ */

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/permanent-employee/core-employee-details/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setEmployees(data || []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* ============================
     RECEIVE UUID FROM HR PAGE
  ============================ */

  useEffect(() => {
    if (location.state?.userUuid) {
      setSelectedUserUuid(location.state.userUuid);
    }
  }, [location.state]);

  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setSelectedUserUuid(null);
    fetchEmployees();
  };

  /* ============================
     SUMMARY CARDS
  ============================ */

  const totalEmployees = employees.length;

  const probation = employees.filter(
    (e) => e.employment_status === "Probation"
  ).length;

  const active = employees.filter(
    (e) => e.employment_status === "Active"
  ).length;

  const noticePeriod = employees.filter(
    (e) => e.employment_status === "Notice Period"
  ).length;

  /* ============================
     FILTER LOGIC
  ============================ */

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const name =
        `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();

      const email = (emp.work_email || "").toLowerCase();

      const empId = (emp.employee_id || "").toLowerCase();

      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        empId.includes(searchTerm.toLowerCase());

      const status = (emp.employment_status || "").toUpperCase();

      const statusMatch =
        statusFilter === "ALL" || status === statusFilter;

      const departmentMatch =
        departmentFilter === "ALL" ||
        emp.department === departmentFilter;

      return matchesSearch && statusMatch && departmentMatch;
    });
  }, [employees, searchTerm, statusFilter, departmentFilter]);


  /* ============================
     TABLE CONFIG
  ============================ */

  const headers = [
    "Employee ID",
    "Name",
    "Email",
    "Contact",
    "Department",
    "Designation",
    "Joining Date",
    "Status",
    "Action",
  ];

  const columns = [
    "employee_id",
    "name",
    "email",
    "contact",
    "department",
    "designation",
    "doj",
    "status",
    "action",
  ];

  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);

  const rows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredEmployees
      .slice(startIndex, startIndex + PAGE_SIZE)
      .map((emp) => ({

        employee_id: emp.employee_id || "—",

        name:
          `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""}`
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase()),

        email: emp.work_email || "—",

        contact: emp.contact_number || "—",

        department: emp.department || "—",

        designation: emp.designation || "—",

        doj: emp.joining_date || "—",

        status: emp.employment_status ? (
          <StatusBadge label={emp.employment_status} size="sm" />
        ) : (
          "—"
        ),

        action: (
          <ActionMenu
            onView={() =>
              navigate(
                `/employee-onboarding/employee/${emp.employee_uuid}`
              )
            }
          />
        ),
      }));

  }, [employees, currentPage, navigate]);

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold">
            Employee Dashboard
          </h1>

          <p className="text-gray-500">
            Manage employee records
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg shadow-sm"
        >
          + Create Employee
        </button>

      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <StatCard title="Total Employees" value={totalEmployees} icon={Users} />

        <StatCard title="Probation" value={probation} icon={Clock} />

        <StatCard title="Active" value={active} icon={CheckCircle} />

        <StatCard title="Notice Period" value={noticePeriod} icon={AlertCircle} />

      </div>

      {/* SEARCH + FILTERS */}

      <div className="flex flex-col md:flex-row gap-4">

        <input
          placeholder="Search by Name, Email or Employee ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-1/3 px-3 py-2 border rounded-lg"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-48 px-3 py-2 border rounded-lg bg-white"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PROBATION">Probation</option>
          <option value="NOTICE PERIOD">Notice Period</option>
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-48 px-3 py-2 border rounded-lg bg-white"
        >
          <option value="ALL">All Departments</option>

          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow-sm relative overflow-visible">

        <Table
          headers={headers}
          columns={columns}
          rows={rows}
          loading={loading}
        />

        {filteredEmployees.length > PAGE_SIZE && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredEmployees.length / PAGE_SIZE)}
            onPrevious={() =>
              setCurrentPage((p) => Math.max(p - 1, 1))
            }
            onNext={() =>
              setCurrentPage((p) =>
                Math.min(p + 1, Math.ceil(employees.length / PAGE_SIZE))
              )
            }
          />
        )}

      </div>

      {/* MODAL */}

      <EmployeeCreateModal
        isOpen={isCreateOpen}
        onClose={handleCloseModal}
        userUuid={selectedUserUuid}
      />

    </div>
  );
}

/* ============================
   STAT CARD
============================ */

function StatCard({ title, value, icon: Icon }) {
  return (
    <div
      className="bg-white p-4 rounded-xl border border-black/20 shadow-sm 
                 flex gap-4 transition-all duration-300 
                 hover:-translate-y-1 hover:shadow-xl"
    >
      <Icon className="text-indigo-600" />

      <div>
        <p className="text-sm text-gray-500">
          {title}
        </p>

        <p className="text-xl font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}



// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";

// import EmployeeCreateModal from "./components/EmployeeCreateModal";


// export default function EmployeeOnboardingPage() {
//   const location = useLocation();

//   const [isCreateOpen, setIsCreateOpen] = useState(false);
//   const [selectedUserUuid, setSelectedUserUuid] = useState(null);

//   // useEffect(() => {
//   //   if (userUuid) {
//   //     setIsCreateOpen(true);
//   //   }
//   // }, [userUuid]);

//   useEffect(() => {
//   if (location.state?.userUuid) {
//     setSelectedUserUuid(location.state.userUuid);
//   }
// }, [location.state]);
  

//   return (
//     <div className="p-6">

//       {/* HEADER ROW */}
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <h1 className="text-4xl font-semibold text-gray-800">
//             Employee Onboarding
//           </h1>
//           <p className="text-sm text-gray-500">
//             Manage employee onboarding workflow
//           </p>
//         </div>

//         {/* CREATE BUTTON */}
//         <button
//           onClick={() => setIsCreateOpen(true)}
//           // onClose={handleCloseModal}
//           className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg shadow-sm"
//         >
//           + Create Employee
//         </button>
//       </div>

//       {/* MODAL */}
//       <EmployeeCreateModal
//         isOpen={isCreateOpen}
//         onClose={() => setIsCreateOpen(false)}
//         userUuid={selectedUserUuid}
//       />
//     </div>
//   );
// }