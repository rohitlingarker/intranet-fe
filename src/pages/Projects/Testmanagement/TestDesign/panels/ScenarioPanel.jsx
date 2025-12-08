import React from "react";
import { Plus, CheckCircle } from "lucide-react";

export default function ScenarioPanel({
  selectedScenario,
  selectedCase,
  onSelectCase,
  onAddCase,
  onAddSteps
}) {
  if (!selectedScenario) {
    return (
      <div className="p-10 text-gray-500">
        Select a scenario from the left.
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">

      {/* ----------------------------- */}
      {/* SCENARIO HEADER */}
      {/* ----------------------------- */}
      <div>
        <h2 className="text-xl font-semibold">{selectedScenario.title}</h2>
        <p className="text-sm text-gray-500">
          {selectedScenario.cases?.length || 0} cases
        </p>
      </div>

      {/* ----------------------------- */}
      {/* CASE LIST */}
      {/* ----------------------------- */}
      <div>
        <div className="space-y-2">
          {selectedScenario.cases?.map((testCase) => (
            <div
              key={testCase.id}
              onClick={() => onSelectCase(testCase)}
              className={`border rounded p-3 cursor-pointer ${
                selectedCase?.id === testCase.id
                  ? "bg-blue-50 border-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium flex items-center justify-between">
                {testCase.title}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSteps(testCase);
                  }}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs flex items-center gap-1"
                >
                  <Plus size={12} /> Add Step
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {testCase.steps?.length || 0} steps • {testCase.priority || "Medium"}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onAddCase(selectedScenario)}
          className="mt-3 px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add Case
        </button>
      </div>

      {/* ----------------------------- */}
      {/* STEP LIST */}
      {/* ----------------------------- */}
      {selectedCase && (
        <div>
          <h3 className="font-semibold mt-4 mb-2">Steps for: {selectedCase.title}</h3>

          <div className="space-y-2">
            {selectedCase.steps?.map((step) => (
              <div
                key={step.id}
                className="p-3 border rounded bg-gray-50 flex gap-3"
              >
                <CheckCircle size={18} className="text-green-600" />
                <div>
                  <div className="font-medium">Action: {step.action}</div>
                  <div className="text-sm text-gray-600">
                    Expected: {step.expectedResult}
                  </div>
                </div>
              </div>
            ))}

            {(!selectedCase.steps || selectedCase.steps.length === 0) && (
              <div className="text-gray-500">No steps added yet.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
