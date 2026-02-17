import React, { useEffect, useState } from "react";
import { Check, X, Search } from "lucide-react";
import axios from "axios";
import ActionDropdown from "./ActionDropdown";
import Pagination from "../../../components/Pagination/pagination";
import LeaveDashboard from "../charts/LeaveDashboard";

function countWeekdays(startDateStr, endDateStr) {
  const start = new Date(startDateStr.split("T")[0] + "T00:00:00");
  const end = new Date(endDateStr.split("T")[0] + "T00:00:00");

  if (end < start) return 0;

  let count = 0;
  let current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

const HandleLeaveRequestAndApprovals = ({ user, employeeId }) => {
  const [adminLeaveRequests, setAdminLeaveRequests] = useState([]);
  const [allLeaveTypes, setAllLeaveTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [confirmation, setConfirmation] = useState(null); // { action, leaveId }
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);
  const [comments, setComments] = useState({}); // manager comments keyed by leaveId
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [leaveBalanceModal, setLeaveBalaceModel] = useState(null);

  const itemsPerPage = 8;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i); // current + 3 past years

  const showToast = (text, type) => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const managerId = user?.id || employeeId;

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
  }, [managerId, selectedYear, selectedMonth, searchTerm]); // selectedStatus (can be added)

  const fetchData = async () => {
    setLoading(true);
    try {
      const payload = {
        managerId,
        year: selectedYear || null, // from your year dropdown
        month: selectedMonth || null, // from your month dropdown
        status: selectedStatus !== "All" ? selectedStatus : null,
        searchTerm: searchTerm || null,
      };

      const res = await axios.post(
        "http://localhost:8080/api/leave-requests/manager/history",
        payload
      );

      const types = await axios.get(
        "http://localhost:8080/api/leave/get-all-leave-types"
      );

      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      console.log("data",arr)
      setAdminLeaveRequests(arr);
      setAllLeaveTypes(types.data || []);
    } catch (err) {
      console.error("Error fetching leave data:", err);
    } finally {
      setLoading(false);
    }
  };

  // for the leaveBalaceDashBoard
  // const handleOpenDetails = (request) => {
  //   setSelectedRequestDetails(request);
  // };

  const filteredAdminRequests = adminLeaveRequests.filter((req) => {
    const matchesSearch =
      req.employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.leaveType.leaveName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" ||
      req.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAdminRequests.length / itemsPerPage);
  const paginatedRequests = filteredAdminRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const selectableRequests = filteredAdminRequests.filter(
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
        "http://localhost:8080/api/leave-requests/approve-batch",
        {
          managerId,
          leaveIds: selectedRequests,
        }
      );
      showToast(`${selectedRequests.length} requests approved.`, "success");
      setSelectedRequests([]);
      await fetchData();
    } catch (err) {
      showToast("Failed to approve selected requests.", "error");
      console.error("Error approving requests:", err);
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
        "http://localhost:8080/api/leave-requests/reject-batch",
        {
          managerId,
          leaveIds: selectedRequests,
          // comments: selectedRequests.reduce((res, id) => ({ ...res, [id]: comments[id] || "" }), {})
        }
      );
      showToast(`${selectedRequests.length} requests rejected.`, "success");
      setSelectedRequests([]);
      await fetchData();
    } catch (err) {
      showToast("Error rejecting selected requests.", "error");
      console.error("Error rejecting requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve or Reject single leave, use comment from param or store
  const handleDecision = async (action, leaveId, commentParam) => {
    const comment = commentParam ?? (comments[leaveId] || "");
    if (action === "reject" && !comment) {
      showToast("Manager comment required to reject.", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/leave-requests/${action}`, {
        managerId,
        leaveId,
        comment,
      });
      showToast(`Leave ${action}ed successfully.`, "success");
      setSelectedRequests((prev) => prev.filter((id) => id !== leaveId));
      await fetchData();
      setConfirmation(null);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update leave (for ActionDropdown editing)
  const handleLeaveUpdate = async (leaveId, data) => {
    setLoading(true);
    try {
      const payload = {
        leaveId,
        managerId,
        ...(data.leaveTypeId && { leaveTypeId: data.leaveTypeId }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
        ...(data.startDate &&
          data.endDate && {
            daysRequested: countWeekdays(data.startDate, data.endDate),
          }),
      };
      await axios.put(
        "http://localhost:8080/api/leave-requests/update",
        payload
      );
      showToast("Leave request updated.", "success");
      await fetchData();
    } catch {
      showToast("Update failed! Try again.", "error");
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
      case "cancelled":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Name or Leave Type"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[150px]"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Cancelled</option>
          </select>
          {/* Year Filter (Dynamic) */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[150px]"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[150px]"
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
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200 relative">
            {selectedRequests.length > 0 && (
              <tr>
                <th
                  colSpan={9}
                  className="bg-indigo-100 text-indigo-700 px-6 py-2 text-left rounded-t-lg"
                >
                  <div className="flex items-center gap-4">
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
            <tr>
              <th className="px-6 py-4 text-left">
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
              {[
                "Employee",
                "Leave Dates",
                "Leave Type",
                "Reason",
                "Status",
                "Last Action By",
                "Documents",
                "Actions",
              ].map((heading, i) => (
                <th
                  key={i}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRequests.map((request) => {
              console.log(request)
              const typeObj =
                allLeaveTypes.find(
                  (t) => t.leaveName === request.leaveType.leaveName
                ) || request.leaveType;
              return (
                <tr
                  key={request.leaveId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
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
                  <td className="cursor-pointer text-blue-600 hover:underline">
                    <button
                      onClick={() =>
                        setLeaveBalaceModel({
                          employeeId: request.employee.employeeId,
                          employeeName: request.employee.fullName,
                        })
                      }
                    >
                      {request.employee.fullName}
                      <div className="text-sm text-gray-500">
                        {request.employee.jobTitle}
                      </div>
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.startDate}
                        {request.startDate !== request.endDate
                          ? ` to ${request.endDate}`
                          : ""}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.daysRequested}{" "}
                        {request.daysRequested === 1 ? "Day" : "Days"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.leaveType.leaveName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Requested on {request.requestDate}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {request.reason}
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
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.approvedBy
                          ? request.approvedBy.fullName
                          : request.managerComment ?? "—"}
                      </div>
                      {request.managerComment && (
                        <div className="text-sm text-gray-500 mt-1">
                          {request.managerComment}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {request.driveLink && request.driveLink.trim() && (
                      <a
                        href={request.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        View Documents
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {request.status.toLowerCase() === "pending" && (
                        <>
                          <button
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            onClick={() =>
                              setConfirmation({
                                action: "approve",
                                leaveId: request.leaveId,
                              })
                            }
                            title="Approve"
                            disabled={loading}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            onClick={() =>
                              setConfirmation({
                                action: "reject",
                                leaveId: request.leaveId,
                              })
                            }
                            title="Reject"
                            disabled={loading}
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <ActionDropdown
                            requestId={request.leaveId}
                            currentLeaveType={typeObj}
                            currentStartDate={request.startDate}
                            currentEndDate={request.endDate}
                            currentReason={request.reason}
                            allLeaveTypes={allLeaveTypes}
                            managerComments={comments[request.leaveId] ?? ""}
                            onModalClose={() => {}}
                            onCommentSave={(comment) => {
                              setComments((prev) => ({
                                ...prev,
                                [request.leaveId]: comment || "",
                              }));
                            }}
                            onUpdate={(data) => {
                              if (data.comment !== undefined) {
                                setComments((prev) => ({
                                  ...prev,
                                  [request.leaveId]: data.comment || "",
                                }));
                              }
                              handleLeaveUpdate(request.leaveId, data);
                            }}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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

        {leaveBalanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Leave Balance - {leaveBalanceModal.employeeName}
                </h2>
                <button
                  onClick={() => setLeaveBalaceModel(null)}
                  className="text-gray-600 hover:text-black text-xl"
                >
                  &times;
                </button>
              </div>
              <LeaveDashboard employeeId={leaveBalanceModal.employeeId} />
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
                {confirmation.action === "reject" && (
                  <input
                    placeholder="Manager comment"
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

        {loading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {toast && (
          <div
            className={`
              fixed top-6 right-6 z-[70] min-w-[240px] px-5 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-slide-left
              ${
                toast.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }
            `}
            style={{ transition: "all 0.4s" }}
            role="alert"
          >
            <span className="flex-1">{toast.text}</span>
            <button
              className="ml-2 text-white opacity-80 hover:opacity-100 text-lg leading-none"
              onClick={() => setToast(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {/* {selectedRequestDetails && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
              <h2 className="text-lg font-bold mb-4">Leave Request Details</h2>
              <p>
                <strong>Employee:</strong>{" "}
                {selectedRequestDetails.employee.fullName}
              </p>
              <p>
                <strong>Job Title:</strong>{" "}
                {selectedRequestDetails.employee.jobTitle}
              </p>
              <p>
                <strong>Status:</strong> {selectedRequestDetails.status}
              </p>
              <p>
                <strong>Start Date:</strong> {selectedRequestDetails.startDate}
              </p>
              <p>
                <strong>End Date:</strong> {selectedRequestDetails.endDate}
              </p>
              <p>
                <strong>Reason:</strong> {selectedRequestDetails.reason}
              </p>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedRequestDetails(null)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default HandleLeaveRequestAndApprovals;
