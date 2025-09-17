import React, { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import { Fonts } from "../../../components/Fonts/Fonts";
import Pagination from "../../../components/Pagination/pagination"; // <-- Import your Pagination component

const CompOffRequestsTable = ({ requests, onCancel }) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; // adjust how many rows per page

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

  // Filter only pending requests
  const pendingRequests = requests?.filter((req) => req.status === "PENDING") || [];

  // Pagination calculations
  const totalPages = Math.ceil(pendingRequests.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRequests = pendingRequests.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="overflow-x-auto w-full">
      <div className="w-full max-w-screen-xl mx-auto">
        {pendingRequests.length > 0 ? (
          <>
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-sm">
                  <th className="p-3 text-left">Start Date</th>
                  <th className="p-3 text-left">End Date</th>
                  <th className="p-3 text-left">Days</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRequests.map((req) => (
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

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            />
          </>
        ) : (
          <div className="flex items-center">
            <div className="text-black-600 text-3xl">📭</div>
            <div className="text-black-600 pl-4">
              <h2 className={Fonts.heading4}>
                Hurray! No Pending Comp-Off Requests
              </h2>
              <p className={Fonts.caption}>Request Comp-Off on the above!</p>
            </div>
          </div>
        )}
      </div>

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
