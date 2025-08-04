import React, { useEffect, useState } from "react";
import { Check, X, Search, Pencil } from "lucide-react";
import axios from "axios";

const HandleLeaveRequestAndApprovals = ({ user, employeeId }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);
  const [comments, setComments] = useState({});
  const [editRequest, setEditRequest] = useState(null);

  const managerId = user?.id || employeeId;

  useEffect(() => {
    if (managerId) fetchData();
    // eslint-disable-next-line
  }, [managerId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/leave-requests/manager/history",
        { managerId }
      );
      const types = await axios.get(
        "http://localhost:8080/api/leave/get-all-leave-types"
      );
      setLeaveRequests(Array.isArray(res.data) ? res.data : res.data.data || []);
      setLeaveTypes(types.data || []);
    } catch (err) {
      console.error("Error fetching leave data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search and status filtering
  const filteredRequests = leaveRequests.filter((req) => {
    const matchesSearch =
      req.employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.leaveType.leaveName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" ||
      req.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Only requests which are pending can be selected/batch updated
  const selectableRequests = filteredRequests.filter(
    (request) => request.status.toLowerCase() === "pending"
  );

  const handleSelectRequest = (leaveId, checked) => {
    setSelectedRequests((prev) =>
      checked ? [...prev, leaveId] : prev.filter((id) => id !== leaveId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedRequests(checked ? selectableRequests.map((r) => r.leaveId) : []);
  };

  // Batch Approve
  const handleAcceptAll = async () => {
    setLoading(true);
    try {
      await Promise.all(
        selectedRequests.map((id) =>
          axios.put("http://localhost:8080/api/leave-requests/approve", {
            managerId,
            leaveId: id,
            comment: comments[id] || "",
          })
        )
      );
      setResultMsg("Selected leave requests approved.");
      setSelectedRequests([]);
      await fetchData();
    } catch (err) {
      setResultMsg("Something went wrong while approving.");
    } finally {
      setLoading(false);
    }
  };

  // Batch Reject
  const handleRejectAll = async () => {
    for (let id of selectedRequests) {
      if (!comments[id]) {
        setResultMsg("Please provide a comment for each leave to reject.");
        return;
      }
    }
    setLoading(true);
    try {
      await Promise.all(
        selectedRequests.map((id) =>
          axios.put("http://localhost:8080/api/leave-requests/reject", {
            managerId,
            leaveId: id,
            comment: comments[id],
          })
        )
      );
      setResultMsg("Selected leave requests rejected.");
      setSelectedRequests([]);
      await fetchData();
    } catch (err) {
      setResultMsg("Something went wrong while rejecting.");
    } finally {
      setLoading(false);
    }
  };

  // Approve / Reject
  const handleDecision = async (action, leaveId) => {
    const comment = comments[leaveId] || "";
    if (action === "reject" && !comment) {
      setResultMsg("Manager comment required to reject.");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:8080/api/leave-requests/${action}`,
        { managerId, leaveId, comment }
      );
      setResultMsg(`Leave ${action}ed successfully.`);
      setSelectedRequests((prev) => prev.filter((id) => id !== leaveId));
      await fetchData();
    } catch {
      setResultMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setConfirmation(null);
    }
  };

  // Color helpers
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

  // Editing Modal Save handler
  const handleEditSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Find ID of selected leave type (or use name, depending on backend)
      const leaveTypeObj = leaveTypes.find(
        (t) => t.leaveName === editRequest.leaveTypeName
      );
      const payload = {
        leaveId: editRequest.leaveId,
        leaveType: leaveTypeObj?.leaveName ?? editRequest.leaveTypeName,
        startDate: editRequest.startDate,
        endDate: editRequest.endDate,
        reason: editRequest.reason,
        managerId,
      };
      await axios.put(
        "http://localhost:8080/api/leave-requests/update",
        payload
      );
      setResultMsg("Leave request updated.");
      setEditRequest(null);
      await fetchData();
    } catch (err) {
      setResultMsg("Update failed! Try again.");
    } finally {
      setLoading(false);
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
                "Actions"
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
            {filteredRequests.map((request) => (
              <tr key={request.leaveId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRequests.includes(request.leaveId)}
                    onChange={(e) =>
                      handleSelectRequest(request.leaveId, e.target.checked)
                    }
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={request.status.toLowerCase() !== "pending"}
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {request.employee.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.employee.jobTitle}
                    </div>
                  </div>
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
                      {request.daysRequested} {request.daysRequested === 1 ? "Day" : "Days"}
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
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {/* Edit button */}
                        <button
                          className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                          onClick={() =>
                            setEditRequest({
                              leaveId: request.leaveId,
                              leaveTypeName: request.leaveType.leaveName,
                              startDate: request.startDate,
                              endDate: request.endDate,
                              reason: request.reason || "",
                            })
                          }
                          title="Edit Leave"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Confirmation Modal */}
        {confirmation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-[90vw] max-w-[360px] border border-gray-200 animate-fade-in">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-16 h-16 rounded-full mb-4
                ${
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
                <p className="text-gray-500 text-center mb-6">
                  {confirmation.action === "approve"
                    ? "Are you sure you want to accept this leave? This action cannot be undone."
                    : "Are you sure you want to reject this leave? This action cannot be undone."}
                </p>
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
                    className={`flex-1 px-4 py-2 rounded text-white font-medium transition
                    ${
                      confirmation.action === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }
                    ${loading ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() =>
                      handleDecision(
                        confirmation.action,
                        confirmation.leaveId
                      )
                    }
                    disabled={loading}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editRequest && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-[90vw] max-w-[380px] border border-gray-200 animate-fade-in">
              <h3 className="text-lg font-semibold mb-4">Edit Leave Request</h3>
              <form onSubmit={handleEditSave} className="flex flex-col gap-3">
                <label>
                  Leave Type:
                  <select
                    className="mt-1 border rounded px-2 py-1 w-full"
                    value={editRequest.leaveTypeName}
                    onChange={e =>
                      setEditRequest(er => ({ ...er, leaveTypeName: e.target.value }))
                    }
                    required
                  >
                    {leaveTypes.map(type => (
                      <option key={type.leaveName} value={type.leaveName}>
                        {type.leaveName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Start Date:
                  <input
                    type="date"
                    className="mt-1 border rounded px-2 py-1 w-full"
                    value={editRequest.startDate}
                    onChange={e =>
                      setEditRequest(er => ({ ...er, startDate: e.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  End Date:
                  <input
                    type="date"
                    className="mt-1 border rounded px-2 py-1 w-full"
                    value={editRequest.endDate}
                    onChange={e =>
                      setEditRequest(er => ({ ...er, endDate: e.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Reason:
                  <textarea
                    className="mt-1 border rounded px-2 py-1 w-full"
                    value={editRequest.reason}
                    onChange={e =>
                      setEditRequest(er => ({ ...er, reason: e.target.value }))
                    }
                    rows={2}
                  />
                </label>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex-1"
                    onClick={() => setEditRequest(null)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition flex-1"
                    disabled={loading}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-30 backdrop-blur rounded">
            <div className="p-8 bg-white rounded-xl shadow flex flex-col items-center">
              <svg
                className="w-8 h-8 animate-spin text-indigo-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4z"
                />
              </svg>
              <div className="text-gray-600 text-base font-medium">
                Processing...
              </div>
            </div>
          </div>
        )}

        {/* Toast Message */}
        {resultMsg && (
          <div
            className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[70]
          bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg flex items-center gap-4 animate-slide-down"
          >
            <span>{resultMsg}</span>
            <button
              className="ml-2 text-white opacity-70 hover:opacity-100 text-lg leading-none"
              onClick={() => setResultMsg(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandleLeaveRequestAndApprovals;
