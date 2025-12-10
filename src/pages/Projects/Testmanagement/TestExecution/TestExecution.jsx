// src/pages/TestExecution.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import CreateTestCycleForm from "./CreateCycle";
import CreateTestRunForm from "./CreateRun";
import RunListForCycle from "./RunListForCycle";
import AddCasesModal from "./AddCasesModal";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import AddTestStoryModal from "../TestDesign/modals/AddTestStoriesModal";
import { se } from "date-fns/locale";

export default function TestExecution() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [search, setSearch] = useState("");
  const [showCyclesView, setShowCyclesView] = useState(true);
  const [loadingCycles, setLoadingCycles] = useState(false);

  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);

  const [showAddCasesModal, setShowAddCasesModal] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [availableCases, setAvailableCases] = useState([]);
  const [onCreated, setOnCreated] = useState(null);
  const [runsRefreshKey, setRunsRefreshKey] = useState(0);

  // ---------------------- UTIL ----------------------
  const formatDate = (date) => {
    if (!date) return "No Date";
    const d = new Date(date);
    if (isNaN(d)) return "No Date";
    return (
      String(d.getDate()).padStart(2, "0") +
      "/" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "/" +
      d.getFullYear()
    );
  };

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

  // ---------------------- LOAD CYCLES ----------------------
  const loadCycles = async () => {
    setLoadingCycles(true);
    try {
      const res = await axiosInstance.get(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-execution/test-cycles/projects/${projectId}`
      );

      setCycles(res.data || []);
      if (!selectedCycleId && res.data?.length) {
        setSelectedCycleId(res.data[0].id);
      }
    } catch (err) {
      console.error("Error loading cycles:", err);
      toast.error("Failed to load cycles");
    } finally {
      setLoadingCycles(false);
    }
  };

  useEffect(() => {
    loadCycles();
  }, [projectId]);

  const filteredCycles = cycles.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.status || "").toLowerCase().includes(term)
    );
  });

  // ---------------------- ADD CASES MODAL ----------------------
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

  const handleAddCasesSubmit = async (selectedCaseIds) => {
    if (!selectedRunId) return;

    try {
      await axiosInstance.post(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-execution/test-runs/${selectedRunId}/add-cases`,
        { testCaseIds: selectedCaseIds }
      );

      toast.success("Test cases added to run");
      setShowAddCasesModal(false);

      setRunsRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to add test cases");
    }
  };

  // ---------------------- HANDLERS ----------------------
  const handleCycleCreated = () => {
    setShowCycleModal(false);
    loadCycles();
  };

  const handleRunCreated = () => {
    setShowRunModal(false);
    setRunsRefreshKey((k) => k + 1);
  };

  if (loadingCycles) return <LoadingSpinner text="Loading cycles..." />;

  // ---------------------- RENDER ----------------------
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Test Execution</h1>

        {showCyclesView ? (
          <div className="flex items-center gap-4">
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
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
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
          </div>
        )}
      </div>

      {/* CYCLE LIST OR RUN LIST */}
      {showCyclesView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCycles.map((cycle) => (
            <div
              key={cycle.id}
              className="bg-[#F7FAFF] p-5 rounded-xl border border-blue-200 shadow-sm cursor-pointer hover:shadow-md transition"
              onClick={() => {
                setSelectedCycleId(cycle.id);
                setShowCyclesView(false);
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">{cycle.name}</h2>
                {getStatusBadge(cycle.status)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
              </p>
              <div></div>
              <div></div>
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 mt-5"
                onClick={(e) => 
                {
                  e.stopPropagation();
                  setShowRunModal(true);
                }}
              >
                + Create Run
              </button>
            </div>
          ))}
        </div>
      ) : (
        <RunListForCycle
          projectId={projectId}
          cycleId={selectedCycleId}
          onAddCases={openAddCasesModal}
          refreshKey={runsRefreshKey}
        />
      )}

      {/* ADD CASES MODAL */}
      {/* <AddCasesModal
        show={showAddCasesModal}
        onClose={() => setShowAddCasesModal(false)}
        availableCases={availableCases}
        onSubmit={handleAddCasesSubmit}
      /> */}

      
{/* 
      <AddTestStoryModal
        projectId={projectId}      
        onClose={() => setShowAddCasesModal(false)}
        onCreated={() => setOnCreated(Date.now())}
      /> */}



      {/* CREATE CYCLE MODAL */}
      {showCycleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <CreateTestCycleForm
            projectId={projectId}
            onSuccess={handleCycleCreated}
            onClose={() => setShowCycleModal(false)}
          />
        </div>
      )}

      {/* CREATE RUN MODAL */}
      {showRunModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <CreateTestRunForm
            projectId={projectId}
            cycleId={selectedCycleId}
            onSuccess={handleRunCreated}
            onClose={() => setShowRunModal(false)}
          />
        </div>
      )}
    </div>
  );
}
