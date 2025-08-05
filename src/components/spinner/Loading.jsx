import React from "react";

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Spinner */}
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>

        {/* Loading Text */}
        {/* <p className="text-gray-700 text-lg font-medium animate-pulse">
          Loading...
        </p> */}
      </div>
    </div>
  );
}

