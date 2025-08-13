import React, { useState } from "react";
import { toast } from "react-toastify";
import ActionDropdownPendingLeaveRequests from "./ActionDropDownPendingLeaveRequests";
import axios from "axios";
import EditLeaveModal from "./EditLeaveModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const PendingLeaveRequestsTable = ({
  leaveBalances,
  pendingLeaves,
  leaveTypes,
  setPendingLeaves,
  employeeId,
}) => {
  const [cancelId, setCancelId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);

  const handleEdit = (leave) => {
    setEditingLeave(leave);
    setEditModalOpen(true);
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
        `${BASE_URL}/api/leave-requests/${cancelId}/cancel`,
        null,
        {
          params: { employeeId: empId },
          headers: { "Cache-Control": "no-store" },
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

  return (
    <div className="overflow-x-auto w-full px-4">
      <div className="w-full max-w-screen-xl mx-auto">
        <table className="w-full table-auto border-collapse border-gray-300 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-sm">
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
                <td className="p-3 text-gray-700 font-medium">{leave.leaveType?.leaveName || "-"}</td>
                <td className="p-3 text-gray-700 font-medium">{leave.startDate}</td>
                <td className="p-3 text-gray-700 font-medium">{leave.endDate}</td>
                <td className="p-3 text-gray-700 font-medium text-center">{leave.daysRequested}</td>
                <td className="p-3 text-gray-700 font-medium">{leave.reason}</td>
                <td className="p-3 text-gray-700 font-medium">
                  <ActionDropdownPendingLeaveRequests
                    onEdit={() => handleEdit(leave)}
                    onCancel={() => setCancelId(leave.leaveId)}
                    onSuccess={() =>
                      setPendingLeaves((prev) =>
                        prev.filter((l) => l.leaveId !== leave.leaveId)
                      )
                    }
                  />
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

      {editModalOpen && (
        <EditLeaveModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          initialData={editingLeave}
          leaveBalances={leaveBalances}
          onSuccess={(updatedLeave) => {
            setPendingLeaves((prev) =>
              prev.map((l) =>
                l.leaveId === updatedLeave.leaveId ? updatedLeave : l
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default PendingLeaveRequestsTable;
