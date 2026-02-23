import React from "react";

export default function FormInput({ label, ...props }) {
  return (
    <div className="flex flex-col mb-3">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        {...props}
        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600"
      />
    </div>
  );
}
