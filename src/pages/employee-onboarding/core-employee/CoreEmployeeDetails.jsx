import React, { useState } from "react";
import EmployeeCreateModal from "./components/EmployeeCreateModal";

export default function EmployeeOnboardingPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="p-6">

      {/* HEADER ROW */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-4xl font-semibold text-gray-800">
            Employee Onboarding
          </h1>
          <p className="text-sm text-gray-500">
            Manage employee onboarding workflow
          </p>
        </div>

        {/* CREATE BUTTON */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg shadow-sm"
        >
          + Create Employee
        </button>
      </div>

      {/* MODAL */}
      <EmployeeCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

    </div>
  );
}
