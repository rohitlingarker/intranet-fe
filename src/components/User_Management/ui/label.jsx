// src/components/ui/label.jsx
import React from "react";

export const Label = ({ children, htmlFor, className = "" }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
    >
      {children}
    </label>
  );
};

export default Label;
