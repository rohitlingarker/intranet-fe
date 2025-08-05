// src/components/ui/button.jsx
import React from "react";

export const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
