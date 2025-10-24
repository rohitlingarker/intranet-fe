import React from "react";

const Modal = ({ isOpen, onClose, title, subtitle, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className={`bg-white rounded-xl shadow-lg w-full max-w-lg ${className}`}>
        <div className="p-4 border-b">
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

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;