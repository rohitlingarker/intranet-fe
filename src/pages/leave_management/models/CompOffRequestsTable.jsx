import React, { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";

const CompOffRequestsTable = ({ requests, onCancel }) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const handleCancelClick = (id) => {
    setSelectedRequestId(id);
    setConfirmModalOpen(true);
  };

  const confirmCancellation = () => {
    if (selectedRequestId) {
      onCancel(selectedRequestId);
    }
    setConfirmModalOpen(false);
    setSelectedRequestId(null);
  };

  const cancelModal = () => {
    setConfirmModalOpen(false);
    setSelectedRequestId(null);
  };

  // Filter only pending requests once
  const pendingRequests = requests?.filter((req) => req.status === "PENDING") || [];

  return (
    <div className="w-full overflow-x-auto">
      {pendingRequests.length > 0 ? (
        <table className="w-full bg-white border border-gray-200 rounded shadow-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Start Date</th>
              <th className="p-3 text-left">End Date</th>
              <th className="p-3 text-left">Days</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((req) => (
              <tr key={req.idleaveCompoff} className="border-t border-gray-200">
                <td className="p-3 text-left">{req.startDate}</td>
                <td className="p-3 text-left">{req.endDate}</td>
                <td className="p-3 text-left">{req.duration}</td>
                <td className="p-3 text-left">{req.status}</td>
                <td className="p-3 text-left">
                  <button
                    onClick={() => handleCancelClick(req.idleaveCompoff)}
                    className="text-red-600 hover:underline text-sm font-medium"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex items-center">
          <div className="text-black-600 text-3xl">
            📭
          </div>
          <div className="text-black-600 pl-4">
            <h2 className="text-black-600 text-xl font-bold">
              Hurray! No Pending Comp-Off Requests
            </h2>
            <p className="text-gray-600 text-sm">Request Comp-Off on the above!</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        title="Cancel Comp-Off Request"
        message="Are you sure you want to cancel this comp-off request?"
        onConfirm={confirmCancellation}
        onCancel={cancelModal}
      />
    </div>
  );
};

export default CompOffRequestsTable;