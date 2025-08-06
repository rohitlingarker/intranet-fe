import React from "react";
import clsx from "clsx";

/**
 * Reusable Status Badge
 * Background and text colors are determined based on the label content
 * Accepts: size ("sm", "md", "lg"), label
 */
const StatusBadge = ({ label, size = "md" }) => {
  const normalized = label.toLowerCase();
  let bgColor = "bg-gray-200";
  let textColor = "text-gray-700";

  // Order matters: check "inactive" before "active"
  if (
    normalized.includes("inactive") ||
    normalized.includes("reject") ||
    normalized.includes("cancel") ||
    normalized.includes("fail")
  ) {
    bgColor = "bg-red-100";
    textColor = "text-red-700";
  } else if (
    normalized.includes("approve") ||
    normalized.includes("complete") ||
    normalized.includes("release") ||
    normalized.includes("active")
  ) {
    bgColor = "bg-green-100";
    textColor = "text-green-700";
  } else if (
    normalized.includes("pending") ||
    normalized.includes("hold") ||
    normalized.includes("progress")
  ) {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-700";
  }

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={clsx(
        "inline-block rounded-full font-medium",
        bgColor,
        textColor,
        sizeStyles[size]
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
