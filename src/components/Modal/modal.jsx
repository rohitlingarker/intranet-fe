import React from "react";

const Modal = ({ isOpen, onClose, title, subtitle, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-10 overflow-hidden">
      {/* Backdrop - Added 'fixed inset-0' to ensure full coverage */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className={`relative bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] ${className}`}>

        {/* Header - Added 'shrink-0' so it never squishes when scrolling */}
        <div className="p-4 border-b shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body - Added 'overflow-y-auto' here to scroll ONLY the content */}
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;