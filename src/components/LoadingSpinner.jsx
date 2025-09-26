import React from "react";

const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center space-x-2 p-4">
      <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      <span className="text-gray-600">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
