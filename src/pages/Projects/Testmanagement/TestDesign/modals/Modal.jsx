import React from "react";

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-5 relative">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-900">✕</button>
        {children}
      </div>
    </div>
  );
}
