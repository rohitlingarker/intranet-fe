import React from "react";

const ActionButtons = ({ onRequestLeave, onRequestCompOff }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 focus:outline-none transition"
        onClick={onRequestLeave}
      >
        Request Leave
      </button>

      <button
        className="px-3 py-1 rounded-lg border border-indigo-600 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 focus:outline-none focus:ring-0 outline-none"
        onClick={onRequestCompOff}
      >
        Request Credit for Compensatory Off
      </button>

      <button
        className="px-3 py-1 rounded-lg text-indigo-600 text-sm font-semibold hover:text-indigo-800 focus:outline-none transition"
      >
        Leave Policy Explanation
      </button>
    </div>
  );
};

export default ActionButtons;