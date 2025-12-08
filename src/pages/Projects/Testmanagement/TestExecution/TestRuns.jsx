// src/components/TestRunAccordion.jsx
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function TestRunAccordion({ run, projectId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const navigate = useNavigate();

  const executed = run.executedCount || 0;
  const total = run.totalCount || 0;
  const progress = total > 0 ? Math.round((executed / total) * 100) : 0;

  const goToAddCases = (e) => {
    e.stopPropagation();
    navigate(`/projects/${projectId}/cycles/runs/${run.id}/test-runs`);
  };

  const loadTestCases = async () => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-execution/test-runs/${
          run.id
        }/cases`
      );
      console.log("Loaded test cases:", res);
      setTestCases(res.data);
      console.log("Test Cases for run", run.id, ":", testCases);
      // console.log("Test Cases:", testCases, run.id);
    } catch (err) {
      console.error("Error loading test cases:", err);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/employees`
      );
      console.log("Loaded employees:", res);
    } catch (err) {
      console.error("Error loading employees:", err);
    }
  };

  React.useEffect(() => {
    loadTestCases();
  }, [run.id]);

  console.log("Rendering TestRunAccordion for run:", run);

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div
        className="p-4 flex justify-between items-start cursor-pointer bg-gray-50 hover:bg-gray-100"
        onClick={() => setIsOpen((s) => !s)}
      >
        <div>
          <h4 className="font-semibold">{run.name}</h4>
          <p className="text-sm text-gray-500">
            {run.executionDate || "No Date"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm text-gray-600">{progress}%</div>
          <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-2 bg-green-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-lg">{isOpen ? "▲" : "▼"}</div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t">
          {testCases?.length > 0 ? (
            <>
              <h5 className="font-medium text-sm mb-4">Execution Worklist</h5>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="py-2 px-3 text-left">ID</th>
                      <th className="py-2 px-3 text-left">Test Case Title</th>
                      <th className="py-2 px-3 text-left">Priority</th>
                      <th className="py-2 px-3 text-left">Status</th>
                      <th className="py-2 px-3 text-left">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {testCases.map((tc) => (
                      <tr
                        key={tc.testCaseId}
                        className="border-b hover:bg-gray-50"
                      >
                        {/* ID */}
                        <td className="py-3 px-3 font-medium text-gray-700">
                          {tc.testCaseId}
                        </td>

                        {/* Title */}
                        <td className="py-3 px-3 text-gray-800">{tc.title}</td>

                        {/* Priority Badge */}
                        <td className="py-3 px-3">
                          <span
                            className={`
                    px-2 py-1 rounded text-xs font-semibold
                    ${
                      tc.priority === "HIGH"
                        ? "bg-red-100 text-red-600"
                        : tc.priority === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-600"
                    }
                  `}
                          >
                            {tc.priority}
                          </span>
                        </td>

                        {/* Execution Status */}
                        <td className="py-3 px-3">
                          {tc.runStatus === "NOT_STARTED" && (
                            <span className="text-gray-500 flex items-center gap-1">
                              ⏳ Pending
                            </span>
                          )}
                          {tc.runStatus === "PASS" && (
                            <span className="text-green-600 flex items-center gap-1">
                              ✔ Pass
                            </span>
                          )}
                          {tc.runStatus === "FAIL" && (
                            <span className="text-red-600 flex items-center gap-1">
                              ✖ Fail
                            </span>
                          )}
                        </td>

                        {/* Action Button */}
                        <td className="py-3 px-3">
                          {tc.runStatus === "NOT_STARTED" ? (
                            <button
                              onClick={() =>
                                navigate(
                                  `/projects/${projectId}/cycles/runs/${run.id}/execute/${tc.testCaseId}`
                                )
                              }
                              className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-100"
                            >
                              ▶ Run
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                navigate(
                                  `/projects/${projectId}/cycles/runs/${run.id}/result/${tc.testCaseId}`
                                )
                              }
                              className="text-blue-600 hover:underline"
                            >
                              View Result
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={goToAddCases}
              >
                + Add More Cases
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3">No test cases added yet.</p>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={goToAddCases}
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
