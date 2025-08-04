import React, { useState, useEffect } from "react"; // ✅ added useEffect
import { toast } from "react-toastify";
import axios from "axios";
import ActionDropdownPendingLeaveRequests from "./ActionDropDownPendingLeaveRequests";

const PendingLeaveRequestsTable = ({
  pendingLeaves,
  leaveTypes,
  setPendingLeaves,
  employeeId,
}) => {
  const [editIndex, setEditIndex] = useState(null);
  const [editedLeave, setEditedLeave] = useState({});
  const [loading, setLoading] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedLeave({ ...pendingLeaves[index] });
  };

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

  // ✅ useEffect to auto-update daysRequested
  useEffect(() => {
    if (editIndex !== null) {
      const start = new Date(editedLeave.startDate);
      const end = new Date(editedLeave.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const oneDay = 1000 * 60 * 60 * 24;
        const days = Math.floor((end - start) / oneDay) + 1;
        setEditedLeave((prev) => ({
          ...prev,
          daysRequested: days,
        }));
      }
    }
  }, [editedLeave.startDate, editedLeave.endDate]); // ✅ recalculate when either changes

  const handleSave = async () => {
    try {
      setLoading(true);

      const start = new Date(editedLeave.startDate);
      const end = new Date(editedLeave.endDate);

      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
        toast.error("Start date and end date must be valid.");
        return;
      }

      if (end < start) {
        toast.error("End date cannot be before start date.");
        return;
      }

      const oneDayMs = 1000 * 60 * 60 * 24;
      const daysRequested = Math.floor((end - start) / oneDayMs) + 1;

      const payload = {
        ...editedLeave,
        leaveTypeId:
          editedLeave.leaveType?.leaveTypeId || editedLeave.leaveTypeId,
        employeeId,
        daysRequested,
      };

      await axios.put(
        "http://localhost:8080/api/leave-requests/employee/update",
        payload,
        {
          withCredentials: true,
        }
      );

      const updated = [...pendingLeaves];
      updated[editIndex] = {
        ...editedLeave,
        startDate: editedLeave.startDate,
        endDate: editedLeave.endDate,
        daysRequested,
        leaveType: leaveTypes.find(
          (l) => l.leaveTypeId === payload.leaveTypeId
        ),
      };

      setPendingLeaves(updated);
      toast.success("Leave request updated successfully");

      setEditIndex(null);
      setEditedLeave({});
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = async () => {
    try {
      setLoading(true);
      const leaveToCancel = pendingLeaves.find(
        (leave) => leave.leaveId === cancelId
      );
      if (!leaveToCancel) {
        toast.error("Leave request not found.");
        return;
      }

      const employeeId =
        leaveToCancel.employee.employeeId || "UNKNOWN_EMPLOYEE";

      await axios.put(
        `http://localhost:8080/api/leave-requests/${cancelId}/cancel`,
        null,
        {
          params: { employeeId },
          headers: { "Cache-Control": "no-store" },
          withCredentials: true,
        }
      );

      setPendingLeaves((prev) => prev.filter((l) => l.leaveId !== cancelId));
      toast.success("Leave request cancelled");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to cancel request");
    } finally {
      setCancelId(null);
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto w-full px-4">
      <div className="w-full max-w-screen-xl mx-auto">
        <table className="w-full table-auto border border-gray-300 rounded shadow">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Leave Type</th>
              <th className="p-3 text-left">From</th>
              <th className="p-3 text-left">To</th>
              <th className="p-3 text-left">Days</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingLeaves.map((leave, index) => (
              <tr key={leave.id || index} className="border-t">
                <td className="p-3">
                  {editIndex === index ? (
                    <select
                      className="border p-2 rounded w-full"
                      value={
                        editedLeave.leaveTypeId || leave.leaveType?.leaveTypeId
                      }
                      onChange={(e) =>
                        handleChange("leaveTypeId", e.target.value)
                      }
                    >
                      <option value="">Select Type</option>
                      {leaveTypes.map((type) => (
                        <option key={type.leaveTypeId} value={type.leaveTypeId}>
                          {type.leaveName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    leave.leaveType?.leaveName || "-"
                  )}
                </td>

                <td className="p-3">
                  {editIndex === index ? (
                    <input
                      type="date"
                      className="border p-2 rounded w-full"
                      value={editedLeave.startDate || ""}
                      onChange={(e) =>
                        handleChange("startDate", e.target.value)
                      }
                    />
                  ) : (
                    leave.startDate
                  )}
                </td>

                <td className="p-3">
                  {editIndex === index ? (
                    <input
                      type="date"
                      className="border p-2 rounded w-full"
                      value={editedLeave.endDate || ""}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                    />
                  ) : (
                    leave.endDate
                  )}
                </td>

                <td className="p-3 text-center">
                  {editIndex === index ? (
                    <span className="text-gray-800">
                      {editedLeave.daysRequested || "-"}
                    </span>
                  ) : (
                    leave.daysRequested
                  )}
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
                    <ActionDropdownPendingLeaveRequests
                      onEdit={() => handleEdit(index)}
                      onCancel={() => setCancelId(leave.leaveId)}
                      onSuccess={() => setPendingLeaves((prev) => prev.filter((l) => l.leaveId !== leave.leaveId))}
                    />
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
