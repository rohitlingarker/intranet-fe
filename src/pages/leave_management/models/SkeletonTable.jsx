import React from "react";

const SkeletonTable = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(rows)].map((_, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-6 gap-4">
          {[...Array(columns)].map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-4 bg-gray-300 rounded col-span-1"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonTable;
