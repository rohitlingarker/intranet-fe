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
  console.log("Comp Off Requests in table:", requests);
  return (
    <div className="max-w-screen-xl mt-4 overflow-x-auto px-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Comp Off Requests</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded border-radius-lg shadow-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Start Date</th>
            <th className="px-4 py-2 text-left">End Date</th>
            <th className="px-4 py-2 text-left">Days</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests
            .filter((req) => req.status !== "CANCELLED")
            .map((req) => {
              console.log("Comp Off Request:", req);
              return (
                <tr key={req.idleaveCompoff} className="border-t border-gray-200">
                  <td className="px-4 py-2">{req.startDate}</td>
                  <td className="px-4 py-2">{req.endDate}</td>
                  <td className="px-4 py-2">{req.days}</td>
                  <td className="px-4 py-2">{req.status}</td>
                  <td className="px-4 py-2">
                    {["PENDING", "ACCEPTED"].includes(req.status) && (
                      <button
                        onClick={() => handleCancelClick(req.idleaveCompoff)}
                        className="text-red-600 hover:underline text-sm font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

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
