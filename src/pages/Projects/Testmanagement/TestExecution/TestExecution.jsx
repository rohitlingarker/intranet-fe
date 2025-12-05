import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import CreateTestCycleForm from "./CreateCycle";
import CreateTestRunForm from "./CreateRun";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RunListForCycle from "./RunListForCycle";

export default function TestExecution() {
  const { projectId } = useParams();

  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [runs, setRuns] = useState([]);

  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);

  // NEW STATES for Add Cases Modal
  const [showAddCasesModal, setShowAddCasesModal] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [availableCases, setAvailableCases] = useState([]);
  const [selectedCases, setSelectedCases] = useState([]);

  // --------------------------------------------------------------------
  // LOAD ALL CYCLES FOR PROJECT
  // --------------------------------------------------------------------
  const loadCycles = async () => {
    try {
      const res = await axiosInstance.get(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-execution/test-cycles/projects/${projectId}`
      );
      const data = res.data || [];
      setCycles(data);

      if (data.length > 0) {
        setSelectedCycleId(data[0].id); // auto-select first
      }
    } catch (err) {
      console.error("Error loading cycles:", err);
    }
  };

  // --------------------------------------------------------------------
  // LOAD ALL RUNS FOR SELECTED CYCLE
  // --------------------------------------------------------------------
  const loadRuns = async (cycleId) => {
    if (!cycleId) return;

    try {
      const res = await axiosInstance.get(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-execution/test-runs/cycles/${cycleId}`
      );
      setRuns(res.data || []);
    } catch (err) {
      console.error("Error loading runs:", err);
    }
  };

  useEffect(() => {
    loadCycles();
  }, []);

  useEffect(() => {
    if (selectedCycleId) {
      loadRuns(selectedCycleId);
    }
  }, [selectedCycleId]);

  // --------------------------------------------------------------------
  // STATUS BADGE UI
  // --------------------------------------------------------------------
  const getStatusBadge = (status) => {
    const statusClasses = {
      Completed: "bg-green-100 text-green-700",
      InProgress: "bg-blue-100 text-blue-700",
      NotStarted: "bg-gray-200 text-gray-600",
    };

    return (
      <span
        className={`${statusClasses[status]} px-3 py-1 rounded-full text-xs`}
      >
        {status}
      </span>
    );
  };

  // --------------------------------------------------------------------
  // LOAD TEST CASES FOR ADD CASES MODAL
  // --------------------------------------------------------------------
  const openAddCasesModal = async (runId) => {
    setSelectedRunId(runId);
    setShowAddCasesModal(true);

    try {
      const res = await axiosInstance.get(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-design/test-cases/getcases/${projectId}`
      );
      setAvailableCases(res.data || []);
    } catch (err) {
      console.error("Error loading cases:", err);
    }
  };

  // --------------------------------------------------------------------
  // SUBMIT ADD CASES TO TEST RUN
  // --------------------------------------------------------------------
  const addCasesToRun = async () => {
    if (selectedCases.length === 0) {
      toast.error("Please select at least one test case");
      return;
    }

    try {
      await axiosInstance.post(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-execution/test-runs/${selectedRunId}/add-cases`,
        { testCaseIds: selectedCases }
      );

      toast.success("Test Cases Added Successfully!");
      setShowAddCasesModal(false);
      setSelectedCases([]);

      loadRuns(selectedCycleId); // refresh test runs
    } catch (err) {
      console.error("Error adding cases:", err);
      toast.error("Failed to add test cases");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Test Execution</h1>

        <div className="flex items-center gap-4">
          {/* CYCLES DROPDOWN */}
          <select
            className="border rounded px-3 py-1 focus:outline-none"
            value={selectedCycleId || ""}
            onChange={(e) => setSelectedCycleId(e.target.value)}
          >
            {cycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
              </option>
            ))}
          </select>

          {/* CREATE CYCLE BUTTON */}
          <button
            className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700"
            onClick={() => setShowCycleModal(true)}
          >
            + Create Cycle
          </button>

          {/* CREATE RUN BUTTON */}
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            onClick={() => setShowRunModal(true)}
          >
            + Create Run
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          RUN CARDS
      -------------------------------------------------------------------- */}

      <RunListForCycle
        cycleId={selectedCycleId}
        onAddCases={openAddCasesModal}
      />

      {/* --------------------------------------------------------------------
          ADD CASES MODAL
      -------------------------------------------------------------------- */}
      {showAddCasesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[500px] shadow-xl relative">
            <h2 className="text-lg font-semibold mb-4">Add Test Cases</h2>

            <div className="max-h-64 overflow-y-auto border p-2 rounded">
              {availableCases.map((tc) => (
                <label key={tc.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    value={tc.id}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedCases((prev) =>
                        prev.includes(id)
                          ? prev.filter((x) => x !== id)
                          : [...prev, id]
                      );
                    }}
                  />
                  <span>{tc.title}</span>
                </label>
              ))}
            </div>

            <button
              className="bg-green-600 text-white px-4 py-1 mt-4 rounded hover:bg-green-700"
              onClick={addCasesToRun}
            >
              Add Selected Cases
            </button>

            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-black"
              onClick={() => setShowAddCasesModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* CREATE CYCLE MODAL */}
      {showCycleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <h2 className="text-lg font-semibold mb-4">Create Test Cycle</h2>

            <CreateTestCycleForm
              projectId={projectId}
              onSuccess={() => {
                setShowCycleModal(false);
                loadCycles(); // refresh cycles
              }}
              onClose={() => setShowCycleModal(false)}
            />

            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-black"
              onClick={() => setShowCycleModal(false)}
            >
              ✕
            </button>
        </div>
      )}

      {/* CREATE RUN MODAL */}
      {showRunModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          {/* <div className="bg-white p-6 rounded-xl w-[70%] shadow-xl relative"> */}
            <h2 className="text-lg font-semibold mb-4">Create Test Run</h2>

            <CreateTestRunForm
              projectId={projectId}
              cycleId={selectedCycleId}
              onSuccess={() => {
                setShowRunModal(false);
                loadRuns(selectedCycleId);
              }}
              onClose={() => setShowRunModal(false)}
            />

            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-black"
              onClick={() => setShowRunModal(false)}
            >
              ✕
            </button>
          {/* </div> */}
        </div>
      )}
    </div>
  );
}
