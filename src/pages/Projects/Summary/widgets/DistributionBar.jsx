// Summary/widgets/DistributionBar.jsx
"use client";
import React from "react";

const DistributionBar = React.memo(function DistributionBar({ percentage = 0, ariaLabel }) {
  const w = `${Math.round(percentage)}%`;
  return (
    <div className="w-full bg-gray-200 rounded h-2 overflow-hidden" role="progressbar" aria-label={ariaLabel || "progress"}>
      <div className="h-2 bg-gray-600 transition-all" style={{ width: w }} />
    </div>
  );
});

export default DistributionBar;
