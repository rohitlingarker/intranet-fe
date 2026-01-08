"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function HrOnboardingDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  /* ---------- FETCH SUBMITTED EMPLOYEES ---------- */
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

  /* ---------- STATS ---------- */
  const totalEmployees = data.length;

  /* ---------- FILTER ---------- */
  const filteredData = useMemo(() => {
    return data.filter(emp => {
      const name = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

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
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-1/3 px-3 py-2 border rounded-lg"
      />

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-indigo-900 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Employee Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Designation</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map(emp => (
              <tr key={emp.user_uuid} className="border-b">
                <td className="px-4 py-3">
                  {emp.first_name} {emp.last_name}
                </td>
                <td className="px-4 py-3">{emp.mail}</td>
                <td className="px-4 py-3">{emp.designation}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={emp.onboarding_status} />
                </td>
                <td className="px-4 py-3 text-indigo-600 cursor-pointer">
                  <span
                    onClick={() =>
                      navigate(`/employee-onboarding/hr/profile/${emp.user_uuid}`)
                    }
                  >
                    View
                  </span>
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
    SUBMITTED: "bg-blue-100 text-blue-700",
    VERIFIED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {status || "PENDING"}
    </span>
  );
}
