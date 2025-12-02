import React, { useEffect, useState } from "react";
import { Plus, Folder, ChevronDown, ChevronRight } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useParams } from "react-router-dom";

import ScenarioPanel from "./panels/ScenarioPanel";
import AddScenarioModal from "./modals/AddScenarioModal";
import AddCaseModal from "./modals/AddCaseModal";
import AddStepsModal from "./modals/AddStepsModal";
import AddTestStoryModal from "./modals/AddTestStoriesModal";

export default function TestDesign() {
  const { projectId } = useParams();

  const [testStories, setTestStories] = useState([]);
  const [expandedStories, setExpandedStories] = useState({}); // ✅ NEW — tracks which story is expanded

  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  const [openStoryModal, setOpenStoryModal] = useState(false);
  const [openScenarioModal, setOpenScenarioModal] = useState(false);
  const [openCaseModal, setOpenCaseModal] = useState(false);
  const [openStepsModal, setOpenStepsModal] = useState(false);
  const [scenarioStory, setScenarioStory] = useState(null);

  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // FETCH TEST STORIES
  // ---------------------------------------------------------
  const fetchTestStories = async () => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/test-stories/projects/${projectId}`
      );

      return (res.data || []).map((s) => ({
        ...s,
        scenarios: [],
      }));
    } catch (err) {
      console.error("❌ Error fetching stories", err);
      return [];
    }
  };

  // ---------------------------------------------------------
  // FETCH SCENARIOS by STORY ID
  // ---------------------------------------------------------
  const fetchScenarios = async (storyId) => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/scenarios/test-stories/${storyId}`
      );

      return (res.data || []).map((sc) => ({
        ...sc,
        cases: [],
      }));
    } catch (err) {
      console.error("❌ Error fetching scenarios", err);
      return [];
    }
  };

  // ---------------------------------------------------------
  // FETCH CASES
  // ---------------------------------------------------------
  const fetchCases = async (scenarioId) => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/test-cases/scenarios/${scenarioId}`
      );
      return res.data || [];
    } catch (err) {
      console.error("❌ Error fetching cases", err);
      return [];
    }
  };

  // ---------------------------------------------------------
  // FETCH STEPS
  // ---------------------------------------------------------
  const fetchSteps = async (caseId) => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/test-cases/${caseId}`
      );
      return res.data.steps || [];
    } catch (err) {
      console.error("❌ Error fetching steps", err);
      return [];
    }
  };

  // ---------------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------------
  const loadAll = async () => {
    setLoading(true);

    const stories = await fetchTestStories();
    setTestStories(stories);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [projectId]);

  // ---------------------------------------------------------
  // EXPAND / COLLAPSE STORY (loads scenarios when opened)
  // ---------------------------------------------------------
  const toggleStoryExpand = async (story) => {
    const isExpanded = expandedStories[story.id];

    // If collapsing → just toggle
    if (isExpanded) {
      setExpandedStories((p) => ({ ...p, [story.id]: false }));
      return;
    }

    // Expanding → fetch scenarios
    const scenarios = await fetchScenarios(story.id);

    // Fetch cases + steps for each scenario
    for (const scenario of scenarios) {
      const cases = await fetchCases(scenario.id);
      scenario.cases = [];

      for (const tc of cases) {
        const steps = await fetchSteps(tc.id);
        scenario.cases.push({ ...tc, steps });
      }
    }

    // Update state
    setTestStories((prev) =>
      prev.map((s) =>
        s.id === story.id ? { ...s, scenarios } : s
      )
    );

    setExpandedStories((p) => ({ ...p, [story.id]: true }));
  };

  // ---------------------------------------------------------
  // CALLBACKS
  // ---------------------------------------------------------
  const handleStoryCreated = async () => {
    await loadAll();
    setOpenStoryModal(false);
  };

  const handleScenarioCreated = async () => {
    await loadAll();
    setOpenScenarioModal(false);
    setScenarioStory(null);
  };

  const handleCaseCreated = async () => {
    await loadAll();
    setOpenCaseModal(false);
  };

  const handleStepsCreated = async () => {
    await loadAll();
    setOpenStepsModal(false);
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  if (loading) {
    return <div className="p-10 text-gray-500">Loading Test Design…</div>;
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-80px)] p-6">
      {/* -------------------------------- */}
      {/* LEFT SIDEBAR — EXPANDABLE STORIES */}
      {/* -------------------------------- */}
      <aside className="w-80 bg-white border rounded-xl shadow p-4 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Test Stories</h3>

          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => setOpenStoryModal(true)}
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {testStories.map((story) => (
            <div key={story.id}>
              {/* Story Row */}
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div
                  className="flex items-center gap-2 flex-1"
                  onClick={() => {
                    setSelectedStory(story);
                    toggleStoryExpand(story);
                  }}
                >
                  {expandedStories[story.id] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}

                  <Folder size={16} className="text-blue-600" />
                  <span className="text-sm">{story.name}</span>
                </div>

                {/* Add Scenario */}
                <button
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => {
                    setScenarioStory(story);
                    setOpenScenarioModal(true);
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Expandable Scenario List */}
              {expandedStories[story.id] && (
                <div className="ml-6 mt-1 space-y-1 border-l pl-3">
                  {story.scenarios.length === 0 ? (
                    <div className="text-xs text-gray-400">
                      No scenarios found
                    </div>
                  ) : (
                    story.scenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        className="p-2 rounded hover:bg-gray-50 cursor-pointer flex justify-between"
                        onClick={() => {
                          setSelectedScenario(scenario);
                          setSelectedCase(scenario.cases[0] || null);
                        }}
                      >
                        <span className="text-sm">{scenario.title}</span>

                        {/* Add Case */}
                        <button
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScenario(scenario);
                            setOpenCaseModal(true);
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* -------------------------------- */}
      {/* MAIN PANEL */}
      {/* -------------------------------- */}
      <main className="flex-1 overflow-auto">
        <ScenarioPanel
          selectedTestStory={selectedStory}
          selectedScenario={selectedScenario}
          selectedCase={selectedCase}
          onSelectScenario={(sc) => {
            setSelectedScenario(sc);
            setSelectedCase(sc.cases[0] || null);
          }}
          onSelectCase={(tc) => setSelectedCase(tc)}
          onAddCase={() => setOpenCaseModal(true)}
          onAddSteps={() => setOpenStepsModal(true)}
        />
      </main>

      {/* -------------------------------- */}
      {/* MODALS */}
      {/* -------------------------------- */}
      {openStoryModal && (
        <AddTestStoryModal
          projectId={projectId}
          onClose={() => setOpenStoryModal(false)}
          onCreated={handleStoryCreated}
        />
      )}

      {openScenarioModal && scenarioStory && (
        <AddScenarioModal
          storyId={scenarioStory.id}
          onClose={() => setOpenScenarioModal(false)}
          onCreated={handleScenarioCreated}
        />
      )}

      {openCaseModal && selectedScenario && (
        <AddCaseModal
          scenarioId={selectedScenario.id}
          onClose={() => setOpenCaseModal(false)}
          onCreated={handleCaseCreated}
        />
      )}

      {openStepsModal && selectedCase && (
        <AddStepsModal
          caseId={selectedCase.id}
          onClose={() => setOpenStepsModal(false)}
          onCreated={handleStepsCreated}
        />
      )}
    </div>
  );
}
