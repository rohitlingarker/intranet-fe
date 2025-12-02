import React, { useState } from "react";
import { Plus, CheckCircle } from "lucide-react";

export default function ScenarioPanel({
  selectedTestStory,
  selectedScenario,
  selectedCase,
  onSelectScenario,
  onSelectCase,
  onAddCase,
  onAddSteps
}) {
  if (!selectedTestStory) {
    return (
      <div className="p-10 text-gray-500">
        Select a test story from the left.
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">

      {/* ----------------------------- */}
      {/* SCENARIO HEADER */}
      {/* ----------------------------- */}

      <div>
        <h2 className="text-xl font-semibold">
          Test Story: {selectedTestStory.name}
        </h2>
        <p className="text-sm text-gray-500">
          {selectedTestStory.scenarioCount} scenarios
        </p>
      </div>

      {/* ----------------------------- */}
      {/* SCENARIO LIST */}
      {/* ----------------------------- */}

      <div>
        <h3 className="font-semibold mb-2">Scenarios</h3>

        <div className="grid grid-cols-3 gap-2">
          {selectedTestStory.scenarios?.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className={`p-3 rounded border cursor-pointer ${
                selectedScenario?.id === scenario.id
                  ? "bg-blue-50 border-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium">{scenario.title}</div>
              <div className="text-xs text-gray-500">
                {scenario.caseCount} cases
              </div>
            </div>
          ))}
        </div>

        {selectedScenario && (
          <button
            onClick={onAddCase}
            className="mt-3 px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
          >
            <Plus size={16} /> Add Case
          </button>
        )}
      </div>

      {/* ----------------------------- */}
      {/* CASE LIST */}
      {/* ----------------------------- */}

      {selectedScenario && (
        <div>
          <h3 className="font-semibold mb-2">
            Cases for: {selectedScenario.title}
          </h3>

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
                <div className="font-medium flex items-center gap-2">
                  {testCase.title}
                </div>

                <div className="text-xs text-gray-500">
                  {testCase.stepCount} steps • {testCase.priority}
                </div>
              </div>
            ))}
          </div>

          {selectedCase && (
            <button
              onClick={onAddSteps}
              className="mt-3 px-3 py-2 bg-green-600 text-white rounded flex items-center gap-2"
            >
              <Plus size={16} /> Add Steps
            </button>
          )}
        </div>
      )}

      {/* ----------------------------- */}
      {/* STEP LIST */}
      {/* ----------------------------- */}

      {selectedCase && (
        <div>
          <h3 className="font-semibold mt-4 mb-2">
            Steps for: {selectedCase.title}
          </h3>

          <div className="space-y-2">
            {selectedCase.steps?.map((step) => (
              <div
                key={step.id}
                className="p-3 border rounded bg-gray-50 flex gap-3"
              >
                <CheckCircle size={18} className="text-green-600" />
                <div>
                  <div className="font-medium">
                    Action: {step.action}
                  </div>
                  <div className="text-sm text-gray-600">
                    Expected: {step.expectedResult}
                  </div>
                </div>
              </div>
            ))}

            {(!selectedCase.steps ||
              selectedCase.steps.length === 0) && (
              <div className="text-gray-500">
                No steps added yet.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
