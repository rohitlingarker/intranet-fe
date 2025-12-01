import React from "react";

export function PageCard({ children, className = "" }) {
  return (
    <div className={`rounded-xl border bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function PageCardContent({ children, className = "" }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}
