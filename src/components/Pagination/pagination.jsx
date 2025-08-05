import React from "react";

const Pagination = ({ currentPage, totalPages, onPrevious, onNext }) => {
  return (
    <div className="flex justify-center items-center mt-4 gap-4">
      <button
        onClick={onPrevious}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded border ${
          currentPage === 1 ? "bg-gray-200 text-gray-500" : "bg-white hover:bg-gray-100"
        }`}
      >
        &lt;
      </button>
      <span className="text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded border ${
          currentPage === totalPages ? "bg-gray-200 text-gray-500" : "bg-white hover:bg-gray-100"
        }`}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;