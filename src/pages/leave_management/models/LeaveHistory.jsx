import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../../components/Pagination/pagination";
import { Fonts } from "../../../components/Fonts/Fonts";
import { useAuth } from "../../../contexts/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const employeeId = useAuth()?.user?.user_id;
  // Filter/search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const token = localStorage.getItem('token');

  // Fetch leave data and leave types
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`${BASE_URL}/api/leave-requests/employee/${employeeId}`, {
        withCredentials: true,
        headers: { 
          "Cache-Control": "no-store",
          Authorization:`Bearer ${token}`
        },
      }),
      axios.get(`${BASE_URL}/api/leave/get-all-leave-types`, {
        withCredentials: true,
        headers: { "Cache-Control": "no-store",
          Authorization:`Bearer ${token}`
        },

      }),
    ])
      .then(([leavesResp, typesResp]) => {
        const data = leavesResp.data;
        setLeaves(Array.isArray(data?.data) ? data.data : []);
        setLeaveTypeOptions(Array.isArray(typesResp.data) ? typesResp.data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch leave history or types.");
        setLoading(false);
      });
  }, []);

  // Status options
  const statusOptions = Array.from(
    new Set(
      leaves
        .filter((l) => l.status?.toUpperCase() !== "PENDING")
        .map((l) => l.status)
        .filter(Boolean)
    )
  );

  // Filtering
  const filteredLeaves = leaves
    .filter((leave) => leave.status?.toUpperCase() !== "PENDING")
    .filter((leave) => {
      const lt = (leave.leaveType?.leaveName || "").toLowerCase();
      const en = (leave.employee?.fullName || "").toLowerCase();
      const st = (leave.status || "").toLowerCase();
      const rs = (leave.reason || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      const searchMatch =
        search === "" ||
        lt.includes(search) ||
        en.includes(search) ||
        st.includes(search) ||
        rs.includes(search);

      const typeMatch =
        filterLeaveType === "All" ||
        leave.leaveType?.leaveName === filterLeaveType;

      const statusMatch =
        filterStatus === "All" || leave.status === filterStatus;

      return searchMatch && typeMatch && statusMatch;
    });

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedRequests = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Loading
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600 text-lg">
        Loading leave history...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="text-center py-10 text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="w-6xl mx-auto h-auto px-6 py-8 bg-white rounded-lg shadow-md">
      {filteredLeaves.length > 0 ? (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              className="border px-3 py-2 rounded-md w-full sm:w-1/3"
              placeholder="Search by employee, type, reason…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border px-3 py-2 rounded-md"
              value={filterLeaveType}
              onChange={(e) => setFilterLeaveType(e.target.value)}
            >
              <option value="All">All Leave Types</option>
              {leaveTypeOptions.map((type) => (
                <option
                  key={type.leaveTypeId || type.id || type.leaveName}
                  value={type.leaveName}
                >
                  {type.leaveName}
                </option>
              ))}
            </select>
            <select
              className="border px-3 py-2 rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg  border border-gray-200">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-sm">
                  <th className="text-left px-4 py-3">Leave Type</th>
                  <th className="text-left px-4 py-3">Requested by</th>
                  <th className="text-left px-4 py-3">From</th>
                  <th className="text-left px-4 py-3">To</th>
                  <th className="text-left px-4 py-3">Days</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Reason</th>
                  <th className="text-left px-4 py-3">Comment</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((leave, index) => (
                  <tr
                    key={leave.leaveId || index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="p-3 text-gray-700 font-medium">
                      {leave.leaveType?.leaveName || "-"}
                    </td>
                    <td className="p-3 text-gray-700 font-medium">
                      {leave.employee?.fullName || "-"}
                    </td>
                    <td className="p-3 text-gray-700 font-medium">
                      {leave.startDate
                        ? new Date(leave.startDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3 text-gray-700 font-medium">
                      {leave.endDate
                        ? new Date(leave.endDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3 text-gray-700 font-medium text-center">
                      {leave.daysRequested}
                    </td>
                    <td className="p-3 text-gray-700 font-medium">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                          leave.status === "APPROVED"
                            ? "bg-green-500"
                            : leave.status === "REJECTED"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 font-medium whitespace-pre-wrap">
                      {leave.reason || "-"}
                    </td>
                    <td className="p-3 text-gray-700 font-medium">
                      {leave.managerComment || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="mb-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={() =>
                  setCurrentPage((page) => Math.max(page - 1, 1))
                }
                onNext={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
              />
            </div>
          </div>
        </>
      ) : (
        // No data message
        <div className="flex h-40">
          <p className={Fonts.caption}>
            No leave history found.
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;
