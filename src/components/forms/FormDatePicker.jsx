import React from "react";

const FormDatePicker = ({ label, name, value, onChange, min, max, required }) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={name}
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      min={min} // ✅ prevents selecting past dates
      max={max} // ✅ optional future restriction
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
    />
  </div>
);

export default FormDatePicker;
