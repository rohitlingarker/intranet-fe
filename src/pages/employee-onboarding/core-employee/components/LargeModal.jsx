import React from "react";

export default function LargeModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col">

        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button className="px-6 py-2 rounded-lg bg-indigo-700 text-white hover:bg-indigo-800">
            Save Employee
          </button>
        </div>
      </div>
    </div>
  );
}
