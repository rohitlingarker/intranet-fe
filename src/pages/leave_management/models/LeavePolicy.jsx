// LeavePolicy.jsx
import React from "react";
import LeavePolicyViewer from "./LeavePolicyViewer";

export default function LeavePolicy() {
  return (
    <div className="min-h-screen  bg-gray-50 py-8 px-4">
      <h1 className="text-xl  font-bold text-left text-blue-700 mb-8">
        Leave Policies
      </h1>
      <LeavePolicyViewer />
    </div>
  );
}
