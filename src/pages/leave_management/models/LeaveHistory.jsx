import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../../components/Pagination/pagination";

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const employeeId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).id.trim() : null;

  // Filter/search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch leave data and master leave types on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`http://localhost:8080/api/leave-requests/employee/${employeeId}`, {
        withCredentials: true,
        headers: { "Cache-Control": "no-store" },
      }),
      axios.get("http://localhost:8080/api/leave/get-all-leave-types", {
        withCredentials: true,
        headers: { "Cache-Control": "no-store" },
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

  // Unique status options (excluding PENDING)
  const statusOptions = Array.from(
    new Set(leaves
      .filter((l) => l.status?.toUpperCase() !== "PENDING")
      .map((l) => l.status)
      .filter(Boolean))
  );

  // Filtering logic (exclude PENDING first)
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

  // Render
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600 text-lg">
        Loading leave history...
      </div>
    );
  }

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedRequests = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="w-6xl mx-auto px-6 py-8 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
        Leave History
      </h2>

      {/* Search and filters */}
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
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-6 py-4">Leave Type</th>
              <th className="px-6 py-4">Requested by</th>
              <th className="px-6 py-4">From</th>
              <th className="px-6 py-4">To</th>
              <th className="px-6 py-4">Days</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Comment</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-gray-500 py-6 italic">
                  No leave history available.
                </td>
              </tr>
            ) : (
              paginatedRequests.map((leave, index) => (
                <tr
                  key={leave.leaveId || index}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="px-6 py-4 font-medium">
                    {leave.leaveType?.leaveName || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {leave.employee?.fullName || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {leave.startDate
                      ? new Date(leave.startDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {leave.endDate
                      ? new Date(leave.endDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4">{leave.daysRequested}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                        leave.status === "APPROVED"
                          ? "bg-green-500"
                          : leave.status === "REJECTED"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap">
                    {leave.reason || "-"}
                  </td>
                  <td className="px-6 py-4">{leave.managerComment || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            onNext={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
          />
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory;
