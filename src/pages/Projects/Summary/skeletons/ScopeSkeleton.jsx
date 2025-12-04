import React from "react";

export default function ScopeSkeleton() {
  return (
    <div className="p-5 border rounded bg-white">
      <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
      <div className="grid grid-cols-4 gap-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-20 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );
}
