import React from "react";

export default function ChartCardSkeleton() {
  return (
    <div className="p-8 border rounded bg-white">
      <div className="h-5 w-48 bg-gray-200 rounded mb-4" />
      <div className="h-56 bg-gray-200 w-full rounded" />
    </div>
  );
}
