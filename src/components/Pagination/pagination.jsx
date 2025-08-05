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
        Page <span className="text-blue-500">{currentPage}</span> / {totalPages}
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

// const Pagination = ({ currentPage, totalPages, onPrevious, onNext }) => {
//   return (
//     <div className="flex justify-center items-center mt-4 gap-4">
//       <button
//         onClick={onPrevious}
//         disabled={currentPage === 1}
//         className={`px-4 py-2 rounded border ${
//           currentPage === 1 ? "bg-gray-200 text-gray-500" : "bg-white hover:bg-gray-100"
//         }`}
//       >
//         &lt;
//       </button>
//       <span className="text-gray-600">
//         Page {currentPage} of {totalPages}
//       </span>
//       <button
//         onClick={onNext}
//         disabled={currentPage === totalPages}
//         className={`px-4 py-2 rounded border ${
//           currentPage === totalPages ? "bg-gray-200 text-gray-500" : "bg-white hover:bg-gray-100"
//         }`}
//       >
//         &gt;
//       </button>
//     </div>
//   );
// };

// export default Pagination;