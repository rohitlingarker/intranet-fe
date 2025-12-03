import React, { useState, useEffect } from "react";

const CancellationModal = ({
  title,
  subtitle,
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
  confirmText = "Confirm",
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {subtitle && (
          <p className="mb-4 text-sm text-gray-600">
            {subtitle}
          </p>
        )}
        <label className="block text-sm font-medium text-gray-700">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          maxLength="60"
          rows="2"
          //   cols="30"
          value={reason}
          required
          onChange={(e) => setReason(e.target.value)}
          placeholder="Add a reason"
          className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <button
            // MODIFIED: Pass the local 'reason' state to the onConfirm handler
            onClick={() => onConfirm(reason)}
            // MODIFIED: Disable button if 'reason' is empty
            disabled={isLoading || !reason}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? `${confirmText}ing...` : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;