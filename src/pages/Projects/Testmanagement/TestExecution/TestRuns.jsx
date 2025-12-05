// src/components/TestRunAccordion.jsx
import React, { useState } from "react";

export default function TestRunAccordion({ run, onAddCases }) {
  const [isOpen, setIsOpen] = useState(false);

  const executed = run.executedCount || 0;
  const total = run.totalCount || 0;
  const progress = total > 0 ? Math.round((executed / total) * 100) : 0;

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      
      {/* Accordion Header */}
      <div
        className="p-4 flex justify-between items-center cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h2 className="font-semibold text-lg">{run.name}</h2>
          <p className="text-sm text-gray-500">
            {run.executionDate || "No Date"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{progress}%</span>
          <span className="text-lg">
            {isOpen ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4">
        <div className="w-full bg-gray-200 h-2 rounded-full my-2">
          <div
            className="h-2 bg-green-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-gray-500 mb-2">
          {executed} / {total} Executed
        </p>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 border-t">

          {run.testCases && run.testCases.length > 0 ? (
            <div>
              <h3 className="font-medium text-sm mb-2">Test Cases</h3>
              <ul className="list-disc pl-5 text-sm">
                {run.testCases.map((tc) => (
                  <li key={tc.id}>{tc.title}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-3 text-gray-500">
              No test cases added yet.
              <button
                className="mt-3 bg-indigo-600 text-white px-3 py-1 rounded"
                onClick={() => onAddCases(run.id)}
              >
                + Add Test Cases
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
