"use client";

import { useEffect, useState, useMemo } from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function HrOnboardingDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  /* ---------- PAGINATION ---------- */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/offerletters/user_id/details`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data || []);
      } catch (error) {
        console.error("Failed to load onboarding employees", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  /* ---------- FILTER ---------- */
  const allowedStatuses = ["Submitted", "Verified", "Rejected"];

  const filteredData = useMemo(() => {
    return data.filter((emp) => {
      const name = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase());
      const matchesStatus = allowedStatuses.includes(emp.status);
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm]);

  /* ---------- STATS ---------- */
  const totalEmployees = filteredData.length;

  /* ---------- PAGINATION LOGIC ---------- */
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  if (loading) {
    return <div className="p-10 text-center">Loading HR dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          HR Onboarding Dashboard
        </h1>
        <p className="text-gray-500">
          Verify employee documents & profiles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Submitted Profiles"
          value={totalEmployees}
          icon={Users}
        />
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search employee name..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full md:w-1/3 px-3 py-2 border rounded-lg"
      />

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-indigo-900 text-white">
            <tr>
              <th className="px-4 py-3 text-left w-[10%]">Employee Name</th>
              <th className="px-4 py-3 text-center w-[10%]">Email</th>
              <th className="px-4 py-3 text-center w-[10%]">Contact</th>
              <th className="px-4 py-3 text-center w-[15%]">Role</th>
              <th className="px-4 py-3 text-center w-[10%]">Status</th>
              <th className="px-4 py-3 text-center w-[10%]">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((emp) => (
              <tr key={emp.user_uuid} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 truncate">
                  {emp.first_name} {emp.last_name}
                </td>

                <td className="px-4 py-3 truncate">{emp.mail}</td>

                <td className="px-4 py-3">
                  {emp.contact_number || "—"}
                </td>

                <td className="px-4 py-3">{emp.designation}</td>

                <td className="px-4 py-3 text-center">
                  <StatusBadge status={emp.status} />
                </td>

                <td className="px-4 py-3 text-center text-indigo-600 cursor-pointer">
                  <span
                    onClick={() =>
                      navigate(
                        `/employee-onboarding/hr/profile/${emp.user_uuid}`
                      )
                    }
                  >
                    View
                  </span>
                </td>
              </tr>
            ))}

            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className={`w-10 h-10 rounded-lg border ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-indigo-900 text-white hover:bg-indigo-800"
          }`}
        >
          &lt;
        </button>

        <span className="text-sm font-medium">
          Page {currentPage} / {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className={`w-10 h-10 rounded-lg border ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-indigo-900 text-white hover:bg-indigo-800"
          }`}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
      <Icon className="h-6 w-6 text-indigo-600" />
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Submitted: "bg-blue-100 text-blue-700",
    Verified: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 
      rounded-full text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
