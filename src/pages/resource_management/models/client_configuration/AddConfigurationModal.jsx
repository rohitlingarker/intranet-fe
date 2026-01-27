import React, { useState } from "react";
import { X } from "lucide-react";

const AddConfigurationModal = ({ open, onClose, onSelect }) => {
  const [selectedConfig, setSelectedConfig] = useState("");

  if (!open) return null;

  const handleContinue = () => {
    if (!selectedConfig) return;
    onSelect(selectedConfig); // sla | escalation | compliance
    setSelectedConfig("");    // reset for next open
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg">
        
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Client Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* ===== Body ===== */}
        <div className="px-6 py-5 space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Configuration Type <span className="text-red-500">*</span>
          </label>

          <select
            value={selectedConfig}
            onChange={(e) => setSelectedConfig(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select configuration type</option>
            <option value="sla">SLA Configuration</option>
            <option value="escalation">Escalation Matrix</option>
            <option value="compliance">Compliance Requirements</option>
          </select>
        </div>

        {/* ===== Footer ===== */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedConfig}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddConfigurationModal;
