import React from "react";

export default function ListCardSkeleton() {
  return (
    <div className="p-6 border rounded bg-white">
      <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
      <div className="h-20 bg-gray-200 rounded" />
    </div>
  );
}
