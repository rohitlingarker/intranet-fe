import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../../components/Pagination/pagination";
import { Fonts } from "../../../components/Fonts/Fonts";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  const employeeId = useAuth()?.user?.user_id;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const itemsPerPage = 8;
  const token = localStorage.getItem("token");

  // Fetch data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${BASE_URL}/api/leave-requests/employee/${employeeId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      axios.get(`${BASE_URL}/api/leave/get-all-leave-types`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ])
      .then(([leavesResp, typesResp]) => {
        const data = leavesResp.data;
        setLeaves(Array.isArray(data?.data) ? data.data : []);
        setLeaveTypeOptions(
          Array.isArray(typesResp.data) ? typesResp.data : []
        );
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to fetch leave history or types.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      // if (!isOpen) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/leave/types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveTypes(res.data);
      } catch (err) {
        toast.error("Failed to load leave type details.");
      }
    };

    fetchLeaveTypes();
  }, [token]);

  // function mapLeaveBalancesToDropdown(balances, leaveTypes) {
  //   return balances.map((balance) => {
  //     const leaveTypeId = balance.leaveType.leaveTypeId;
  //     const originalName = balance.leaveType.leaveName;

  //     // Find the corresponding type from the fetched list to get its 'label'
  //     const matchingType = leaveTypes.find(
  //       (type) => type.name === originalName
  //     );
  //     const leaveName = matchingType
  //       ? matchingType.label
  //       : originalName.replace(/^L-/, "");

  //     let availableText;
  //     let isInfinite = false;

  //     if (
  //       leaveTypeId === "L-UP" ||
  //       leaveName.toLowerCase().includes("unpaid")
  //     ) {
  //       availableText = "Infinite balance";
  //       isInfinite = true;
  //     } else if (balance.remainingLeaves > 0) {
  //       availableText =
  //         (balance.remainingLeaves % 1 === 0
  //           ? balance.remainingLeaves
  //           : balance.remainingLeaves.toFixed(1)) + " days available";
  //     } else {
  //       availableText = "Not Available";
  //     }

  //     return {
  //       leaveTypeId,
  //       leaveName, // This will now be the user-friendly label
  //       availableText,
  //       availableDays: isInfinite ? Infinity : balance.remainingLeaves,
  //       isInfinite,
  //       disabled: !isInfinite && balance.remainingLeaves <= 0,
  //       allowHalfDay: !!balance.leaveType.allowHalfDay,
  //       requiresDocumentation: !!balance.leaveType.requiresDocumentation,
  //     };
  //   });
  // }

  const statusOptions = Array.from(
    new Set(
      leaves
        .filter((l) => l.status?.toUpperCase() !== "PENDING")
        .map((l) => l.status)
        .filter(Boolean)
    )
  );

  // Component to handle long reason text with "View More"/"View Less"
  const LeaveReasonCell = ({ reason }) => {
    const [expanded, setExpanded] = useState(false);

    // limit characters shown before truncation
    const MAX_LENGTH = 50;

    if (!reason) return <span>-</span>;

    const isLong = reason.length > MAX_LENGTH;
    const displayText = expanded
      ? reason
      : reason.substring(0, MAX_LENGTH) + (isLong ? "..." : "");

    return (
      <div className="flex flex-col">
        <span className="text-gray-700 whitespace-pre-wrap">{displayText}</span>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 text-xs hover:underline self-start"
          >
            {expanded ? "View Less" : "View More"}
          </button>
        )}
      </div>
    );
  };

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

      const leaveYear = leave.startDate
        ? new Date(leave.startDate).getFullYear()
        : null;
      const yearMatch =
        selectedYear === "" || leaveYear === Number(selectedYear);

      const leaveMonth = leave.startDate
        ? new Date(leave.startDate).getMonth() + 1
        : null;
      const monthMatch =
        selectedMonth === "" || leaveMonth === Number(selectedMonth);

      return searchMatch && typeMatch && statusMatch && yearMatch && monthMatch;
    });

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedRequests = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper: map DB leaveName to user-friendly label
  const getLeaveLabel = (leaveName) => {
    if (!leaveName) return "-";
    const match = leaveTypes.find((lt) => lt.name === leaveName);
    return match ? match.label : leaveName.replace(/^L-/, ""); // fallback to raw or cleaned name
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600 text-lg">
        Loading leave history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="w-6xl mx-auto h-auto px-6 py-8 bg-white rounded-lg shadow-md">
      {/* 🔹 Filters should always be visible */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search Input - Slightly Wider */}
        <div className="flex-1 min-w-[220px]">
          <input
            type="text"
            className="border border-gray-300 px-3 py-2.5 rounded-lg text-sm w-full h-10 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 placeholder-gray-400"
            placeholder="Search by employee, type, or reason…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Leave Type Dropdown */}
        <div className="w-[160px]">
          <select
            className="border border-gray-300 px-3 py-2.5 rounded-lg text-sm w-full h-10 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
            value={filterLeaveType}
            onChange={(e) => setFilterLeaveType(e.target.value)}
          >
            <option value="All">All Leave Types</option>
            {leaveTypeOptions.map((type) => (
              <option
                key={type.leaveTypeId || type.id || type.leaveName}
                value={type.leaveName}
              >
                {getLeaveLabel(type.leaveName)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="w-[140px]">
          <select
            className="border border-gray-300 px-3 py-2.5 rounded-lg text-sm w-full h-10 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
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

        {/* Year Dropdown */}
        <div className="w-[120px]">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 px-3 py-2.5 rounded-lg text-sm w-full h-10 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Month Dropdown */}
        <div className="w-[150px]">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 px-3 py-2.5 rounded-lg text-sm w-full h-10 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
          >
            <option value="">All Months</option>
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((month, index) => (
              <option key={index + 1} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔹 Table or No Data */}
      {filteredLeaves.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-sm">
                <th className="text-left px-4 py-3 text-xs">Leave Type</th>
                <th className="text-left px-4 py-3 text-xs">Requested by</th>
                <th className="text-left px-4 py-3 text-xs">From</th>
                <th className="text-left px-4 py-3 text-xs">To</th>
                <th className="text-left px-4 py-3 text-xs">Days</th>
                <th className="text-left px-4 py-3 text-xs">Status</th>
                <th className="text-left px-4 py-3 text-xs">Reason</th>
                <th className="text-left px-4 py-3 text-xs">Comment</th>
                <th className="text-left px-4 py-3 text-xs">Approved By</th>
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
                  <td className="p-3 text-gray-700 font-medium text-xs">
                    {getLeaveLabel(leave.leaveType?.leaveName)}
                  </td>

                  <td className="p-3 text-gray-700 font-medium text-xs">
                    {leave.employee?.fullName || "-"}
                  </td>
                  <td className="p-3 text-gray-700 font-medium text-xs">
                    {leave.startDate
                      ? new Date(leave.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="p-3 text-gray-700 font-medium text-xs">
                    {leave.endDate
                      ? new Date(leave.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="p-3 text-gray-700 font-medium text-xs text-center">
                    {leave.daysRequested}
                  </td>
                  <td className="p-3 text-gray-700 font-medium text-xs">
                    <span
                      className={`px-1.5 py-1 text-xs font-medium rounded-full text-white ${
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
                  <td className="p-3 text-gray-700 font-medium text-xs whitespace-pre-wrap">
                    <LeaveReasonCell reason={leave.reason} />
                  </td>
                  <td className="p-3 text-gray-700 font-medium text-xs">
                    {leave.managerComment || "-"}
                  </td>
                  <td className="p-3 text-gray-700 font-medium text-xs">
                    {leave.approvedBy?.fullName || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              onNext={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center">
          <p className={Fonts.caption}>No leave history found.</p>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;
