import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import ActionDropdownPendingLeaveRequests from "./ActionDropDownPendingLeaveRequests";
import DateRangePicker from "./DateRangePicker";
import { PencilIcon, XCircle } from "lucide-react";
const token = localStorage.getItem('token')
const BASE_URL = import.meta.env.VITE_BASE_URL;
 
const PendingLeaveRequestsTable = ({
  leaveBalances,
  pendingLeaves,
  leaveTypes,
  setPendingLeaves,
  employeeId,
}) => {
  const [editIndex, setEditIndex] = useState(null);
  const [editedLeave, setEditedLeave] = useState({});
  const [loading, setLoading] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [leaveTypeNames, setLeaveTypeNames] = useState([]);
 
  const handleEdit = (index) => {
    const leave = pendingLeaves[index];
    setEditIndex(index);
    setEditedLeave({
      ...leave,
      leaveTypeId: leave.leaveType?.leaveTypeId,
    });
  };
 
  const fetchLeaveType = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/leave/types`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLeaveTypeNames(res.data); // Backend returns [{name, label}]
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load leave types");
    }
  };
 
  useEffect(() => {
    fetchLeaveType();
  }, []);
 
  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditedLeave({});
  };
 
  const handleChange = (field, value) => {
    setEditedLeave((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
 
  const handleSave = async () => {
    setLoading(true);
 
    try {
      const { startDate, endDate, leaveTypeId } = editedLeave;
 
      if (!startDate || !endDate) {
        toast.error("Both start and end dates are required.");
        return;
      }
 
      if (!leaveTypeId) {
        toast.error("Please select a leave type.");
        return;
      }
 
      const payload = {
        startDate,
        endDate,
        reason: editedLeave.reason || "",
        requestDate: editedLeave.requestDate,
        leaveId: pendingLeaves[editIndex].leaveId || null,
        leaveTypeId,
        daysRequested: editedLeave.daysRequested || 0,
        employeeId: employeeId || "UNKNOWN_EMPLOYEE",
        driveLink: editedLeave.driveLink || "",
      };
 
      await axios.put(
        `${BASE_URL}/leave-requests/employee/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success("Leave request submitted successfully");
 
      // Update local state if request is successful
      const updated = [...pendingLeaves];
      updated[editIndex] = {
        ...editedLeave,
        leaveType: leaveTypes.find((l) => l.leaveTypeId === leaveTypeId),
      };
 
      setPendingLeaves(updated);
      setEditIndex(null);
      setEditedLeave({});
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Something went wrong";
        toast.error(errorMessage);
        console.error("Axios Error:", errorMessage);
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };
 
  const confirmCancel = async () => {
    try {
      setLoading(true);
      const leaveToCancel = pendingLeaves.find((l) => l.leaveId === cancelId);
      if (!leaveToCancel) {
        toast.error("Leave not found.");
        return;
      }
 
      const empId = leaveToCancel.employee?.employeeId || "UNKNOWN_EMPLOYEE";
 
      await axios.put(
        `${BASE_URL}/leave-requests/${cancelId}/cancel`,
        null,
        {
          params: { employeeId: empId },
          headers: { "Cache-Control": "no-store", 
            Authorization: `Bearer ${token}`
           },
          withCredentials: true,
        }
      );
 
      setPendingLeaves((prev) => prev.filter((l) => l.leaveId !== cancelId));
      toast.success("Leave cancelled");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cancel failed");
    } finally {
      setCancelId(null);
      setLoading(false);
    }
  };
 
  // Helper: Map backend "name" to "label"
  const getLabelFromName = (name) => {
    const match = leaveTypeNames.find((lt) => lt.name === name);
    return match ? match.label : name;
  };
 
  return (
    <div className="overflow-x-auto w-full px-4">
      <div className="w-full max-w-screen-xl mx-auto">
        <table className="w-full table-auto border border-gray-300 rounded shadow">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Leave Type</th>
              <th className="p-3 text-left">Start Date</th>
              <th className="p-3 text-left">End Date</th>
              <th className="p-3 text-left">Days</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingLeaves.map((leave, index) => (
              <tr key={leave.leaveId || index} className="border-t">
                <td className="p-3">
                  {editIndex === index ? (
                    <select
                      className="border p-2 rounded w-full"
                      value={editedLeave.leaveTypeId || ""}
                      onChange={(e) =>
                        handleChange("leaveTypeId", e.target.value)
                      }
                    >
                      <option value="">Select Type</option>
                      {leaveTypes
                        .filter((type) => {
                          const balance = leaveBalances.find(
                            (b) => b.leaveType.leaveTypeId === type.leaveTypeId
                          );
                          return (
                            balance?.remainingLeaves > 0 ||
                            type.leaveTypeId === "L-UP"
                          );
                        })
                        .map((type) => {
                          const balance = leaveBalances.find(
                            (b) => b.leaveType.leaveTypeId === type.leaveTypeId
                          );
                          const isUnpaid = type.leaveTypeId === "L-UP";
                          const remaining = isUnpaid
                            ? "∞"
                            : balance?.remainingLeaves ?? 0;
 
                          // Use label from leaveTypeNames
                          const label = getLabelFromName(type.leaveName);
 
                          return (
                            <option
                              key={type.leaveTypeId}
                              value={type.leaveTypeId}
                            >
                              {label} ({remaining} days left)
                            </option>
                          );
                        })}
                    </select>
                  ) : (
                    getLabelFromName(leave.leaveType?.leaveName) || "-"
                  )}
                </td>
 
                {/* Start Date */}
                <td className="p-3">
                  {editIndex === index ? (
                    <input
                      type="date"
                      className="border p-2 rounded w-full"
                      value={editedLeave.startDate || ""}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        handleChange("startDate", newStart);
 
                        if (editedLeave.endDate) {
                          const start = new Date(newStart);
                          const end = new Date(editedLeave.endDate);
                          const diff =
                            Math.floor((end - start) / (1000 * 60 * 60 * 24)) +
                            1;
                          handleChange("daysRequested", diff > 0 ? diff : 0);
                        }
                      }}
                    />
                  ) : (
                    leave.startDate
                  )}
                </td>
 
                {/* End Date */}
                <td className="p-3">
                  {editIndex === index ? (
                    <input
                      type="date"
                      className="border p-2 rounded w-full"
                      value={editedLeave.endDate || ""}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        handleChange("endDate", newEnd);
 
                        if (editedLeave.startDate) {
                          const start = new Date(editedLeave.startDate);
                          const end = new Date(newEnd);
                          const diff =
                            Math.floor((end - start) / (1000 * 60 * 60 * 24)) +
                            1;
                          handleChange("daysRequested", diff > 0 ? diff : 0);
                        }
                      }}
                    />
                  ) : (
                    leave.endDate
                  )}
                </td>
 
                <td className="p-3 text-center">
                  {editIndex === index
                    ? editedLeave.daysRequested || "-"
                    : leave.daysRequested}
                </td>
 
                <td className="p-3">
                  {editIndex === index ? (
                    <input
                      type="text"
                      className="border p-2 rounded w-full"
                      value={editedLeave.reason}
                      onChange={(e) => handleChange("reason", e.target.value)}
                    />
                  ) : (
                    leave.reason
                  )}
                </td>
 
                <td className="p-3">
                  {editIndex === index ? (
                    <div className="space-x-2">
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-green-500 text-white rounded"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-400 text-white rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <PencilIcon className="cursor-pointer text-blue-700 w-4 h-4" onClick={() => handleEdit(index)} />
                      <button className="text-red-500 hover:underline" onClick={() => setCancelId(leave.leaveId)}>
                        Cancel
                      </button>
                    </div>
                    // <ActionDropdownPendingLeaveRequests
                    //   onEdit={() => handleEdit(index)}
                    //   onCancel={() => setCancelId(leave.leaveId)}
                    //   onSuccess={() =>
                    //     setPendingLeaves((prev) =>
                    //       prev.filter((l) => l.leaveId !== leave.leaveId)
                    //     )
                    //   }
                    // />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {cancelId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Cancel Leave Request</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel this leave request? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
              >
                No
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default PendingLeaveRequestsTable;