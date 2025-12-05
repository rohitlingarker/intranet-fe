import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import CreateTestCycleForm from "./CreateCycle";
import CreateTestRunForm from "./CreateRun";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RunListForCycle from "./RunListForCycle";
import { useNavigate } from "react-router-dom";

export default function TestExecution() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [id, setId] = useState(null);
  const [runs, setRuns] = useState([]);
  const [search, setSearch] = useState("");
  const [openRunList, setOpenRunList] = useState(false);

  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);

  // NEW STATES for Add Cases Modal
  const [showAddCasesModal, setShowAddCasesModal] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [availableCases, setAvailableCases] = useState([]);
  const [selectedCases, setSelectedCases] = useState([]);

  const formatDate = (date) => {
    if (!date) return "No Date";

    const d = new Date(date);
    if (isNaN(d)) return "No Date";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleOpenRunList = (cycleId) => {
    setId(cycleId);
    setOpenRunList(true);
  };

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

  const filteredCycles = cycles.filter((cycle) => {
    const term = search.toLowerCase();
    return (
      cycle.name.toLowerCase().includes(term) ||
      cycle.status.toLowerCase().includes(term)
    );
  });

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
      completed: "bg-green-100 text-green-700",
      in_progress: "bg-blue-100 text-blue-700",
      not_started: "bg-gray-200 text-gray-600",
      blocked: "bg-red-100 text-red-700",
      planned: "bg-yellow-100 text-yellow-700",
    };

    return (
      <span
        className={`${
          statusClasses[status.toLowerCase()]
        } px-3 py-1 rounded-full text-xs`}
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
        }/api/test-design/test-cases/getcases/${projectId}``${
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
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cycles by name or status..."
            className="px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 w-64"
          />

          {/* CREATE CYCLE BUTTON */}
          <button
            className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700"
            onClick={() => setShowCycleModal(true)}
          >
            + Create Cycle
          </button>
        </div>
      </div>
      {/* --------------------------------------------------------------------
          Cycle CARDS
      -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredCycles.map((run) => {
          // const executed = run.executedCount || 0;
          // const total = run.totalCount || 0;
          // const progress = total > 0 ? Math.round((executed / total) * 100) : 0;

          return (
            <div
              key={run.id}
              onClick={() => handleOpenRunList(run.id)}
              className="bg-[#F7FAFF] p-5 rounded-xl border border-blue-200 shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">{run.name}</h2>
                {getStatusBadge(run.status)}
              </div>

              <p className="text-sm text-gray-500 mb-3">
                {formatDate(run.startDate || "No Date")} -{" "}
                {formatDate(run.endDate || "No Date")}
              </p>

              <button
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRunModal(true);
                }}
              >
                + Create Run
              </button>
            </div>
          );
        })}
      </div>

      {openRunList && <RunListForCycle cycleId={id} projectId={projectId} />}
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
