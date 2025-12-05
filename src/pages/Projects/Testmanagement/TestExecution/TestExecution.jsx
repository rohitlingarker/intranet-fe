// src/pages/TestExecution.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import CreateTestCycleForm from "./CreateCycle"; // adjust path if needed
import CreateTestRunForm from "./CreateRun"; // adjust path if needed
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import RunListForCycle from "./RunListForCycle";
import AddCasesModal from "./AddCasesModal";

export default function TestExecution() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [search, setSearch] = useState("");

  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);

  const [showCyclesView, setShowCyclesView] = useState(true);

  // Add-cases modal state
  const [showAddCasesModal, setShowAddCasesModal] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState(null);

  // available cases loaded when opening add-cases modal
  const [availableCases, setAvailableCases] = useState([]);

  // used to force RunListForCycle to reload runs after changes
  const [runsRefreshKey, setRunsRefreshKey] = useState(0);

  const formatDate = (date) => {
    if (!date) return "No Date";
    const d = new Date(date);
    if (isNaN(d)) return "No Date";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // load cycles
  const loadCycles = async () => {
    try {
      const res = await axiosInstance.get(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-execution/test-cycles/projects/${projectId}`
      );
      const data = res.data || [];
      setCycles(data);
      if (!selectedCycleId && data.length > 0) {
        setSelectedCycleId(data[0].id);
      }
    } catch (err) {
      console.error("Error loading cycles:", err);
      toast.error("Failed to load cycles");
    }
  };

  useEffect(() => {
    loadCycles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const filteredCycles = cycles.filter((c) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      (c.name || "").toLowerCase().includes(term) ||
      (c.status || "").toLowerCase().includes(term)
    );
  });

  // open add-cases modal (loads available cases)
  const openAddCasesModal = async (runId) => {
    setSelectedRunId(runId);
    try {
      const res = await axiosInstance.get(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-design/test-cases/getcases/${projectId}`
      );
      setAvailableCases(res.data || []);
      setShowAddCasesModal(true);
    } catch (err) {
      console.error("Error loading cases:", err);
      toast.error("Failed to load test cases");
    }
  };

  // submit selected case IDs to the run
  const handleAddCasesSubmit = async (selectedCaseIds) => {
    if (!selectedRunId) return;
    if (!selectedCaseIds || selectedCaseIds.length === 0) {
      toast.error("Please select at least one test case.");
      return;
    }

    try {
      await axiosInstance.post(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-execution/test-runs/${selectedRunId}/add-cases`,
        { testCaseIds: selectedCaseIds }
      );

      toast.success("Test cases added to run");
      setShowAddCasesModal(false);
      // trigger runs reload
      setRunsRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to add cases:", err);
      toast.error("Failed to add test cases");
    }
  };

  // after creating cycle -> reload cycles
  const handleCycleCreated = () => {
    setShowCycleModal(false);
    loadCycles();
  };

  // after creating run -> reload runs for selected cycle
  const handleRunCreated = () => {
    setShowRunModal(false);
    setRunsRefreshKey((k) => k + 1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold">Test Execution</h1>

        <div className="flex items-center gap-3">
          {/* Only show search + create cycle when viewing cycles */}
          {showCyclesView && (
            <>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cycles by name or status..."
                className="px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 w-64"
              />

              <button
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                onClick={() => setShowCycleModal(true)}
              >
                + Create Cycle
              </button>
            </>
          )}

          {/* Only show create run + back button when viewing runs */}
          {!showCyclesView && (
            <>
              <button
                className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setShowCyclesView(true)}
              >
                ← Back to Cycles
              </button>

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setShowRunModal(true)}
              >
                + Create Run
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cycle cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredCycles.map((cycle) => {
          const selected = cycle.id === selectedCycleId;
          return (
            <div
              key={cycle.id}
              className={`p-5 rounded-xl border shadow-sm cursor-pointer bg-white ${
                selected ? "ring-2 ring-indigo-300" : "bg-[#F7FAFF]"
              }`}
              onClick={() =>
                navigate(`/projects/${projectId}/cycles/${cycle.id}/runs`)
              }
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-lg">{cycle.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                  </p>
                </div>
                <div>{/* status badge or other meta if needed */}</div>
              </div>

              <p className="text-sm text-gray-600 mt-3">{cycle.description}</p>
            </div>
          );
        })}
      </div>

      {/* Runs for selected cycle */}
      <div>
        {/* {selectedCycleId ? (
          <RunListForCycle
            cycleId={selectedCycleId}
            onAddCases={openAddCasesModal}
            refreshKey={runsRefreshKey}
          />
        ) : (
          <p className="text-gray-500">Select a cycle above to see its runs.</p>
        )} */}

        {/* Show cycles OR runs depending on UI mode */}
        {/* {showCyclesView ? (
          // show cycle cards grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredCycles.map((cycle) => {
              const selected = cycle.id === selectedCycleId;
              return (
                <div
                  key={cycle.id}
                  className={`p-5 rounded-xl border shadow-sm cursor-pointer bg-white ${
                    selected ? "ring-2 ring-indigo-300" : "bg-[#F7FAFF]"
                  }`}
                  onClick={() => {
                    setSelectedCycleId(cycle.id);
                    setShowCyclesView(false);
                  }}
                >
                  <h2 className="font-semibold text-lg">{cycle.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                  </p>
                  <p className="text-sm text-gray-600 mt-3">
                    {cycle.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) 
        : (
          // show runs for selected cycle
          <RunListForCycle
            cycleId={selectedCycleId}
            onAddCases={openAddCasesModal}
            refreshKey={runsRefreshKey}
          />
        )} */}
      </div>

      {/* Add Cases Modal */}
      <AddCasesModal
        show={showAddCasesModal}
        onClose={() => setShowAddCasesModal(false)}
        availableCases={availableCases}
        onSubmit={handleAddCasesSubmit}
      />

      {/* Create Cycle Modal */}
      {showCycleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          {/* <div className="bg-white p-6 rounded-xl w-[600px] shadow-xl relative"> */}
            {/* <h2 className="text-lg font-semibold mb-4">Create Test Cycle</h2> */}

            <CreateTestCycleForm
              projectId={projectId}
              onSuccess={handleCycleCreated}
              onClose={() => setShowCycleModal(false)}
            />

            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-black"
              onClick={() => setShowCycleModal(false)}
            >
              ✕
            </button>
          {/* </div> */}
        </div>
      )}

      {/* Create Run Modal */}
      {showRunModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          {/* <div className="bg-white p-6 rounded-xl w-[700px] shadow-xl relative"> */}
            {/* <h2 className="text-lg font-semibold mb-4">Create Test Run</h2> */}

            <CreateTestRunForm
              projectId={projectId}
              cycleId={selectedCycleId}
              onSuccess={handleRunCreated}
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
