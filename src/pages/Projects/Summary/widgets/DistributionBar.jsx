"use client";
import React from "react";

export default function DistributionBar({ percentage = 0 }) {
  return (
    <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
      <div
        className="h-2 bg-gray-600 transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
