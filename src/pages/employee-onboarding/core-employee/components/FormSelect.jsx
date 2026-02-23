import React from "react";

export default function FormSelect({ label, options = [], ...props }) {
  return (
    <div className="flex flex-col mb-3">
      <label className="text-sm text-gray-600 mb-1">{label}</label>

      <select
        {...props}
        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600"
      >
        <option value="">Select</option>

        {options.map((opt, index) => (
          <option
            key={index}
            value={opt.id || opt}
          >
            {opt.name || opt}
          </option>
        ))}
      </select>
    </div>
  );
}
