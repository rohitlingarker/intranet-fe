import React, { useEffect, useState } from "react";
import { Check, X, Search, Pencil, XCircle } from "lucide-react";
import axios from "axios";
import Pagination from "../../../components/Pagination/pagination";
import LeaveDashboard from "../charts/LeaveDashboard";
import { toast } from "react-toastify";
import ManagerEditLeaveRequest from "./ManagerEditLeaveRequest";
import LeaveSection from "./LeaveSection";
import LoadingSpinner from "../../../components/LoadingSpinner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// function countWeekdays(startDateStr, endDateStr) {
//   const start = new Date(startDateStr.split("T")[0] + "T00:00:00");
//   const end = new Date(endDateStr.split("T")[0] + "T00:00:00");

//   if (end < start) return 0;

//   let count = 0;
//   let current = new Date(start);

//   while (current <= end) {
//     const day = current.getDay();
//     if (day !== 0 && day !== 6) {
//       count++;
//     }
//     current.setDate(current.getDate() + 1);
//   }
//   return count;
// }

const HandleLeaveRequestAndApprovals = ({ employeeId }) => {
  const [adminLeaveRequests, setAdminLeaveRequests] = useState([]);
  const [allLeaveTypes, setAllLeaveTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [confirmation, setConfirmation] = useState(null); // { action, leaveId }
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState({}); // manager comments keyed by leaveId
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth()+1));
  const [leaveBalanceModal, setLeaveBalaceModel] = useState(null);
  const token = localStorage.getItem("token");
  const [editingRequest, setEditingRequest] = useState(null);
  const itemsPerPage = 8;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i); // current + 3 past years

  const managerId = employeeId;

  // const toLeaveRequest = (raw) => ({
  //   leaveId: raw.leaveId,
  //   employee: {
  //     fullName: raw.employee.fullName,
  //     jobTitle: raw.employee.jobTitle,
  //   },
  //   leaveType: {
  //     leaveName: raw.leaveType.leaveName,
  //   },
  //   startDate: raw.startDate,
  //   endDate: raw.endDate,
  //   daysRequested: raw.daysRequested,
  //   status: raw.status,
  //   approvedBy: raw.approvedBy,
  //   reason: raw.reason,
  //   managerComment: raw.managerComment,
  //   requestDate: raw.requestDate,
  //   driveLink: raw.driveLink || undefined,
  // });

  useEffect(() => {
    if (managerId) {
      fetchData();
    }
  }, [managerId, selectedYear, selectedMonth, searchTerm, selectedStatus]); // selectedStatus (can be added)

  const fetchData = async () => {
    setLoading(true);
    try {
      const payload = {
        managerId,
        status: selectedStatus !== "All" ? selectedStatus : null,
        year: selectedYear || null, // from your year dropdown
        month: selectedMonth || null, // from your month dropdown
        // searchTerm: searchTerm || null,
      };

      const res = await axios.post(
        `${BASE_URL}/api/leave-requests/manager/history`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const types = await axios.get(
        `${BASE_URL}/api/leave/get-all-leave-types`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setAdminLeaveRequests(arr);
      setAllLeaveTypes(types.data || []);
    } catch (err) {
      toast.error("Error fetching leave data:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const totalPages = Math.ceil(adminLeaveRequests.length / itemsPerPage);
  const paginatedRequests = adminLeaveRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const selectableRequests = adminLeaveRequests.filter(
    (r) =>
      !["approved", "rejected", "cancelled"].includes(r.status.toLowerCase())
  );

  // Select all or none
  const handleSelectAll = (checked) => {
    setSelectedRequests(
      checked ? selectableRequests.map((r) => r.leaveId) : []
    );
  };

  // Select single
  const handleSelectRequest = (leaveId, checked) => {
    if (checked) {
      setSelectedRequests((prev) => [...prev, leaveId]);
    } else {
      setSelectedRequests((prev) => prev.filter((id) => id !== leaveId));
    }
  };

  // Batch approve
  const handleAcceptAll = async () => {
    if (selectedRequests.length === 0) return;
    setLoading(true);
    try {
      // Single batch API call with all selected IDs
      await axios.post(
        `${BASE_URL}/api/leave-requests/approve-batch`,
        {
          managerId,
          leaveIds: selectedRequests,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`${selectedRequests.length} requests approved.`);
      setSelectedRequests([]);
      await fetchData();
    } catch (err) {
      toast.error("Failed to approve selected requests.");
    } finally {
      setLoading(false);
    }
  };

  // Batch reject
  const handleRejectAll = async () => {
    if (selectedRequests.length === 0) return;
    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/api/leave-requests/reject-batch`,
        {
          managerId,
          leaveIds: selectedRequests,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`${selectedRequests.length} requests rejected.`);
      setSelectedRequests([]);
      await fetchData();
    } catch (err) {
      toast.error("Error rejecting selected requests.");
    } finally {
      setLoading(false);
    }
  };

  // Approve or Reject single leave, use comment from param or store
const handleDecision = async (action, leaveId, commentParam) => {
  const comment = commentParam ?? (comments[leaveId] || "");

  if ((action === "reject" || action === "cancel") && !comment) {
    toast.error(
      action === "reject"
        ? "Manager comment required to reject."
        : "Reason required to cancel approved leave."
    );
    return;
  }
  console.log("handleDecision", { action, leaveId, comment, managerId });
  setLoading(true);
  try {
    await axios.put(
      `${BASE_URL}/api/leave-requests/${action}`,
      {
        managerId,
        leaveId,
        comment,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(
      action === "reject"
        ? "Leave rejected successfully."
        : action === "cancel"
        ? "Leave cancelled successfully."
        : "Leave approved successfully."
    );

    setSelectedRequests((prev) => prev.filter((id) => id !== leaveId));
    await fetchData();
    setConfirmation(null);
  } catch {
    toast.error("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  // Update leave (for ActionDropdown editing)
  const handleLeaveUpdate = async (leaveId, updatedData) => {
    setLoading(true);
    try {
      const originalRequest = adminLeaveRequests.find(
        (req) => req.leaveId === leaveId
      );
      if (!originalRequest) {
        throw new Error("Original request not found.");
      }

      const payload = {
        leaveId: originalRequest.leaveId,
        employeeId: originalRequest.employee.employeeId,
        managerId,
        reason: originalRequest.reason, // Keep original employee reason
        driveLink: originalRequest.driveLink || null,

        // Merge updated data
        ...updatedData,
      };

      await axios.put(`${BASE_URL}/api/leave-requests/update`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Leave request updated successfully.");
      setEditingRequest(null); // Close the modal
      await fetchData(); // Refresh data
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Update failed! Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row items-center gap-4 flex-wrap">
          {/* --- SEARCH INPUT --- */}
          {/* No changes needed here, it already matches the new style. */}
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Name or Leave Type"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* --- STATUS DROPDOWN --- */}
          {/* This is the new, styled dropdown structure */}
          <div className="relative w-full lg:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              // MODIFICATION: Added 'appearance-none' to hide the default arrow and 'pr-10' for spacing
              className="w-full lg:min-w-[150px] appearance-none bg-white pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option>All</option>
              <option>PENDING</option>
              <option>APPROVED</option>
              <option>REJECTED</option>
              <option>CANCELLED</option>
            </select>
            {/* MODIFICATION: Added this div for the custom chevron icon */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* --- YEAR DROPDOWN --- */}
          <div className="relative w-full lg:w-auto">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full lg:min-w-[150px] appearance-none bg-white pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* --- MONTH DROPDOWN --- */}
          <div className="relative w-full lg:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full lg:min-w-[150px] appearance-none bg-white pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="">All Months</option>
              {[
                { value: 1, label: "January" },
                { value: 2, label: "February" },
                { value: 3, label: "March" },
                { value: 4, label: "April" },
                { value: 5, label: "May" },
                { value: 6, label: "June" },
                { value: 7, label: "July" },
                { value: 8, label: "August" },
                { value: 9, label: "September" },
                { value: 10, label: "October" },
                { value: 11, label: "November" },
                { value: 12, label: "December" },
              ].map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg shadow-sm">
          <thead className="bg-gray-50 border-gray-200 relative">
            {selectedRequests.length > 0 && (
              <tr>
                <th
                  colSpan={12}
                  className="sticky left-0 z-10 p-0 bg-gray-50 text-left"
                >
                  <div className="flex items-center gap-4 w-1/2 bg-indigo-100 text-indigo-700 px-6 py-2 rounded-t-lg">
                    <span className="font-semibold">
                      {selectedRequests.length} selected
                    </span>
                    <button
                      onClick={handleAcceptAll}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={handleRejectAll}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={() => setSelectedRequests([])}
                      className="ml-auto px-2 py-1 text-indigo-600 hover:text-indigo-900 font-semibold transition"
                      title="Clear Selection"
                    >
                      ✕
                    </button>
                  </div>
                </th>
              </tr>
            )}
            <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-sm">
              <th
                className="px-4 py-3 text-center text-xs uppercase sticky left-0 z-20 bg-blue-900"
                style={{ width: "4%" }}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedRequests.length > 0 &&
                    selectableRequests.length > 0 &&
                    selectedRequests.length === selectableRequests.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={selectableRequests.length === 0}
                />
              </th>
              <th
                className="px-4 py-3 text-center text-xs uppercase sticky left-[4.5%] z-20 bg-blue-900"
                style={{ width: "12%" }}
              >
                Employee
              </th>
              <th
                className="px-4 py-3 text-center text-xs uppercase"
                style={{ width: "10%" }}
              >
                From
              </th>
              <th
                className="px-4 py-3 text-center text-xs uppercase"
                style={{ width: "10%" }}
              >
                To
              </th>
              <th
                className="px-4 py-3 text-center text-xs uppercase"
                style={{ width: "5%" }}
              >
                Days
              </th>
              <th
                className="px-4 py-3 text-center text-xs uppercase"
                style={{ width: "8%" }}
              >
                Requested On
              </th>
              <th
                className="px-4 py-3 text-center text-xs uppercase"
                style={{ width: "10%" }}
              >
                Leave Type
              </th>
              <th
                className="px-4 py-3 text-center text-xs uppercase"
                style={{ width: "16%" }}
              >
                Reason
              </th>
              <th
                className="px-4 py-3 text-center text-xs uppercase"
                style={{ width: "8%" }}
              >
                Status
              </th>
              <th
                className="px-4 py-3 text-center text-xs uppercase"
                style={{ width: "8%" }}
              >
                Last Action By
              </th>
              <th
                className="px-4 py-3 text-center text-xs uppercase"
                style={{ width: "8%" }}
              >
                Documents
              </th>
              <th
                className="px-4 py-3 text-center text-xs uppercase sticky right-0 z-20 bg-indigo-900"
                style={{ width: "8%" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-center">
            {/* ✨ START: Conditional Rendering Logic ✨ */}
            {loading ? (
              // State 1: Show spinner while loading
              <tr>
                <td colSpan="13" className="py-8">
                  <LoadingSpinner text="Loading..." />
                </td>
              </tr>
            ) : adminLeaveRequests.length === 0 ? (
              // State 2: Show message if no data is available
              <tr>
                <td colSpan="13" className="text-center text-gray-500 py-12">
                  No leaves to be displayed.
                </td>
              </tr>
            ) : (
              // State 3: Render the data rows if data exists
              paginatedRequests.map((request) => {
                const typeObj =
                  allLeaveTypes.find(
                    (t) => t.leaveName === request.leaveType.leaveName
                  ) || request.leaveType;
                return (
                  <tr
                    key={request.leaveId}
                    className="hover:bg-gray-50 transition-colors text-xs"
                  >
                    {/* Your existing <td> elements go here, no changes needed inside the map */}
                    <td className="sticky left-0 z-10 bg-white">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.leaveId)}
                        onChange={(e) =>
                          handleSelectRequest(request.leaveId, e.target.checked)
                        }
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        disabled={["approved", "rejected", "cancelled"].includes(
                          request.status.toLowerCase()
                        )}
                      />
                    </td>
                    <td className="cursor-pointer text-blue-600 hover:underline sticky left-[4.5%] z-10 bg-white">
                      <button
                        onClick={() =>
                          setLeaveBalaceModel({
                            employeeId: request.employee.employeeId,
                            employeeName: request.employee.fullName,
                            leaveId: request.leaveId,
                          })
                        }
                      >
                        {request.employee.fullName}
                        <div className="text-gray-500">
                          {request.employee.jobTitle}
                        </div>
                      </button>
                    </td>
                    {/* ... other <td> cells for your data ... */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {request.startDate
                            ? new Date(request.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {request.endDate
                            ? new Date(request.endDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {request.daysRequested}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {request.requestDate
                          ? new Date(request.requestDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {request.leaveType.leaveName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 text-left">
                        <LeaveReasonCell reason={request.reason} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div>
                        <div className="font-medium text-gray-900">
                          {request.approvedBy ? request.approvedBy.fullName : "—"}
                        </div>
                        {request.managerComment && (
                          <div className="text-gray-500 mt-1">
                            {request.managerComment}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {request.driveLink && request.driveLink.trim() && (
                        <a
                          href={request.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Documents
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 sticky right-0 z-10 bg-white">
                      <div className="flex items-center gap-2">
                        {request.status.toLowerCase() === "pending" && (
                          <>
                            <button
                              title="Approve"
                              className="p-1 text-green-600 hover:text-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() =>
                                setConfirmation({
                                  action: "approve",
                                  leaveId: request.leaveId,
                                })
                              }
                              aria-label="Approve Request"
                              disabled={loading}
                            >
                              <Check className="w-4 h-4" />
                            </button>

                            <button
                              title="Reject"
                              className="p-1 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() =>
                                setConfirmation({
                                  action: "reject",
                                  leaveId: request.leaveId,
                                })
                              }
                              aria-label="Reject Request"
                              disabled={loading}
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <button
                              title="Edit"
                              onClick={() => setEditingRequest(request)}
                              aria-label="Edit Request"
                              disabled={loading}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {request.status.toLowerCase() === "approved" && (
                          <button
                            title="Cancel Approved Leave"
                            className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() =>
                              setConfirmation({
                                action: "cancel",
                                leaveId: request.leaveId,
                              })
                            }
                            aria-label="Cancel Approved Leave"
                            disabled={loading}
                          >
                            <XCircle className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            {/* ✨ END: Conditional Rendering Logic ✨ */}
          </tbody>
        </table>
        {totalPages > 1 && (
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
        )}

        {/* NEW: Render the Edit Modal */}
        {editingRequest && (
          <ManagerEditLeaveRequest
            isOpen={!!editingRequest}
            onClose={() => setEditingRequest(null)}
            onSave={handleLeaveUpdate}
            requestDetails={editingRequest}
          />
        )}

        {leaveBalanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[100vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Analysis for - {leaveBalanceModal.employeeName}
                </h2>
                <button
                  onClick={() => setLeaveBalaceModel(null)}
                  className="text-gray-600 hover:text-black text-xl"
                >
                  &times;
                </button>
              </div>
              <LeaveSection
                employeeId={leaveBalanceModal.employeeId}
                leaveId={leaveBalanceModal.leaveId}
              />
            </div>
          </div>
        )}

        {confirmation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-[90vw] max-w-[360px] border border-gray-200 animate-fade-in">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    confirmation.action === "approve"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {confirmation.action === "approve" ? (
                    <Check className="w-10 h-10" />
                  ) : (
                    <X className="w-10 h-10" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 text-center mb-3">
                  {confirmation.action === "approve"
                    ? "Approve this leave request?"
                    : "Reject this leave request?"}
                </h3>
                {(confirmation.action === "reject" ||
                  confirmation.action === "cancel") && (
                  <input
                    placeholder={
                      confirmation.action === "reject"
                        ? "Manager comment"
                        : "Reason for cancellation"
                    }
                    className="border rounded px-2 py-1 mb-3 text-sm w-full"
                    value={comments[confirmation.leaveId] || ""}
                    onChange={(e) =>
                      setComments((prev) => ({
                        ...prev,
                        [confirmation.leaveId]: e.target.value,
                      }))
                    }
                  />
                )}

                <div className="flex gap-3 w-full">
                  <button
                    className="flex-1 px-4 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                    onClick={() => setConfirmation(null)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 rounded text-white font-medium transition ${
                      confirmation.action === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } ${loading ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() =>
                      handleDecision(confirmation.action, confirmation.leaveId)
                    }
                    disabled={loading}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandleLeaveRequestAndApprovals;
