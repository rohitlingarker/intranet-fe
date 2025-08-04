import React, { useState } from "react";
import CompOffRequestModal from "./CompOffRequestModal";
import RequestLeaveModal from "./RequestLeaveModal";

const ActionButtons = ({ onRequestLeave }) => {
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
  const [isRequestLeaveModalOpen, setIsRequestLeaveModalOpen] = useState(false);

  const handleCompOffSubmit = (formData) => {
    console.log("Comp-Off request submitted:", formData);
    // You can send `formData` to your backend API here
    setIsCompOffModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 focus:outline-none transition"
          onClick={() => setIsRequestLeaveModalOpen(true)}
        >
          Request Leave
        </button>

        <button
          className="px-3 py-1 rounded-lg border text-indigo-600 text-sm font-semibold hover:bg-indigo-50 focus:outline-none focus:ring-0 outline-none"
          onClick={() => setIsCompOffModalOpen(true)}
        >
          Request Credit for Compensatory Off
        </button>

        <button className="px-3 py-1 rounded-lg text-indigo-600 text-sm font-semibold hover:text-indigo-800 focus:outline-none transition">
          Leave Policy Explanation
        </button>
      </div>

      {isCompOffModalOpen && (
        <CompOffRequestModal
          isOpen={isCompOffModalOpen}
          onClose={() => setIsCompOffModalOpen(false)}
          onSubmit={handleCompOffSubmit}
        />
      )}
      {/* ✅ Render RequestLeaveModal when open */}
      {isRequestLeaveModalOpen && (
        <RequestLeaveModal
          isOpen={true}
          onClose={() => setIsRequestLeaveModalOpen(false)}
          onSuccess={() => {
            fetchData(); // ✅ Refresh table data
            setIsRequestLeaveModalOpen(false); // ✅ Close modal
          }}
        />
      )}
    </>
  );
};

export default ActionButtons;
