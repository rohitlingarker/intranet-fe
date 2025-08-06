import React from "react";
const Pagination = ({ currentPage, totalPages, onPrevious, onNext }) => {
  return (
    <div className="flex justify-center items-center mt-6 gap-3">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={currentPage === 1}
        className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors duration-200 
          ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-900 text-white hover:bg-blue-900 shadow-md"
          }`}
      >
        &lt;
      </button>

      {/* Page Info */}
      <span className="text-gray-700 font-semibold text-sm">
        Page <span className="text-blue-600">{currentPage}</span> / {totalPages}
      </span>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors duration-200 
          ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-900 text-white hover:bg-blue-900 shadow-md"
          }`}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;

