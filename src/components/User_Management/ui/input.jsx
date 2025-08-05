// src/components/ui/input.jsx
import React from "react";

export const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};

export default Input;
