import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { PencilIcon } from "lucide-react";
import EditLeaveModal from "./EditLeaveModal";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ConfirmationModal from "./ConfirmationModal";

const token = localStorage.getItem('token');
const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * This is now a "presentational" component. It receives data and functions as props.
 * - `pendingLeaves`: The array of leaves to display (already paginated by the parent).
 * - `leaveBalances`: Needed for the Edit Modal.
 * - `leaveTypeNames`: An array of [{name, label}] for displaying friendly leave names.
 * - `employeeId`: The current user's ID.
 * - `refreshData`: A function from the parent to trigger a full data refresh.
 */
const PendingLeaveRequestsTable = ({
  pendingLeaves,
  leaveBalances,
  leaveTypeNames, // Receive this from the parent
  employeeId,
  refreshData, // This is the key prop for refreshing
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLeaveToEdit, setCurrentLeaveToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (leave) => {
    setCurrentLeaveToEdit(leave);
    setIsEditModalOpen(true);
  };

  // When the modal succeeds, just call the refresh function from the parent.
  const handleUpdateSuccess = () => {
    refreshData();
  };

  const handleCancel = (leaveId) => {
    setCancelId(leaveId);
    setIsConfirmationOpen(true);
  };

  const confirmCancel = async () => {
    setLoading(true);
    try {
      const leaveToCancel = pendingLeaves.find((l) => l.leaveId === cancelId);
      if (!leaveToCancel) {
        toast.error("Leave not found.");
        return;
      }
      
      const empId = leaveToCancel.employee?.employeeId || employeeId;

      await axios.put(
        `${BASE_URL}/api/leave-requests/${cancelId}/cancel`,
        null,
        {
          params: { employeeId: empId },
          headers: { 
            "Cache-Control": "no-store", 
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
        }
      );

      toast.success("Leave cancelled successfully");
      refreshData(); // Instead of filtering, just tell the parent to refresh.

    } catch (err) {
      toast.error(err?.response?.data?.message || "Cancel failed");
    } finally {
      setCancelId(null);
      setLoading(false);
    }
  };

  // This helper now uses the prop for leave type names.
  const getLabelFromName = (name) => {
    if (!name) return "-";
    
    // First, try to find a direct match from the props
    if (Array.isArray(leaveTypeNames) && leaveTypeNames.length > 0) {
      const match = leaveTypeNames.find((lt) => lt.name === name);
      if (match && match.label) {
        return match.label; // e.g., "Sick Leave"
      }
    }

    // If no match is found, format the raw name gracefully.
    // "L-SICK_LEAVE" -> "Sick Leave"
    return name
      .replace(/^L-/, "") // Removes "L-" prefix
      .replace(/_/g, " ")   // Replaces underscores with spaces
      .toLowerCase()       // Converts to lowercase
      .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()); // Capitalizes each word
  };

  return (
    <div className="overflow-x-auto w-[100%]">
      <div className="w-full max-w-screen-xl mx-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm ">
          <thead>
            <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-xs border-gray-100">
              <th className="p-3">Leave Type</th>
              <th className="p-3">Start Date</th>
              <th className="p-3">End Date</th>
              <th className="p-3">Days</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* The component now just maps over the leaves it was given. */}
            {pendingLeaves.map((leave) => (
              <tr key={leave.leaveId} className="border-t text-xs">
                <td className="p-3 text-center">{getLabelFromName(leave.leaveType?.leaveName)}</td>
                <td className="p-3 text-center">{leave.startDate}</td>
                <td className="p-3 text-center">{leave.endDate}</td>
                <td className="p-3 text-center">{leave.daysRequested}</td>
                <td className="p-3 text-center">{leave.reason || "-"}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center space-x-4 justify-center">
                    <PencilIcon
                      className="cursor-pointer text-blue-700 w-4 h-4"
                      onClick={() => handleEdit(leave)}
                    />
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleCancel(leave.leaveId)}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && (
        <EditLeaveModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentLeaveToEdit(null);
          }}
          initialData={currentLeaveToEdit}
          leaveBalances={leaveBalances}
          onSuccess={handleUpdateSuccess}
          employeeId={employeeId}
          />
        )}

      <ConfirmationModal
        isOpen={cancelId}
        title="Cancel Leave Request"
        message="Are you sure you want to cancel this leave request?"
        onConfirm={confirmCancel}
        onCancel={() => setCancelId(null)}
        isLoading={loading}
        confirmText="Confirm"
      />

      {/* {cancelId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-3 rounded shadow-md w-[90%] max-w-sm">
            <h2 className="text-sm font-semibold mb-2">Cancel Leave Request</h2>
            <p className="text-xs text-gray-600 mb-4">
              Are you sure you want to cancel this leave request?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelId(null)}
                className="px-4 py-2  bg-gray-200 text-gray-600 rounded"
              >
                No
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded"
                disabled={loading}
              >
                {loading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default PendingLeaveRequestsTable;