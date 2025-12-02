import React, { useEffect, useState } from "react";
import { Plus, Folder } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useParams } from "react-router-dom";

import ScenarioPanel from "./panels/ScenarioPanel";
import AddScenarioModal from "./modals/AddScenarioModal";
import AddCaseModal from "./modals/AddCaseModal";
import AddStepsModal from "./modals/AddStepsModal";

export default function TestDesign() {
  const { projectId } = useParams();

  const [testStories, setTestStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);

  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  const [openScenarioModal, setOpenScenarioModal] = useState(false);
  const [openCaseModal, setOpenCaseModal] = useState(false);
  const [openStepsModal, setOpenStepsModal] = useState(false);

  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // FETCH TEST STORIES
  // ---------------------------------------------------------
  const fetchTestStories = async () => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/test-stories/projects/${projectId}`
      );

      const stories = res.data || [];

      return stories.map((s) => ({
        ...s,
        scenarios: []
      }));
    } catch (err) {
      console.error("❌ Error fetching test stories", err);
      return [];
    }
  };

  // ---------------------------------------------------------
  // FETCH SCENARIOS FOR A STORY
  // ---------------------------------------------------------
  const fetchScenarios = async (storyId) => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/scenarios/testStoryId=${storyId}`
      );

      return (res.data || []).map((sc) => ({
        ...sc,
        cases: []
      }));
    } catch (err) {
      console.error("❌ Error fetching scenarios", err);
      return [];
    }
  };

  // ---------------------------------------------------------
  // FETCH CASES FOR SCENARIO
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
  // FETCH STEPS FOR CASE
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
  // FULL LOAD PIPELINE
  // ---------------------------------------------------------
  const loadAll = async () => {
    setLoading(true);

    // 1. Load stories
    const storyList = await fetchTestStories();

    for (const story of storyList) {
      // 2. Load scenarios
      const scenarios = await fetchScenarios(story.id);
      story.scenarios = scenarios;

      for (const scenario of scenarios) {
        // 3. Load cases
        const cases = await fetchCases(scenario.id);
        scenario.cases = [];

        for (const tc of cases) {
          // 4. Load steps
          const steps = await fetchSteps(tc.id);
          scenario.cases.push({
            ...tc,
            steps,
          });
        }
      }
    }

    setTestStories(storyList);

    // Auto-select first story / scenario / case
    if (storyList.length > 0) {
      const firstStory = storyList[0];
      setSelectedStory(firstStory);

      if (firstStory.scenarios.length > 0) {
        const firstScenario = firstStory.scenarios[0];
        setSelectedScenario(firstScenario);

        if (firstScenario.cases.length > 0) {
          setSelectedCase(firstScenario.cases[0]);
        }
      }
    }

    setLoading(false);
  };

  // Load on mount
  useEffect(() => {
    loadAll();
  }, [projectId]);

  // ---------------------------------------------------------
  // HANDLERS — When a scenario/case is created
  // ---------------------------------------------------------

  const handleScenarioCreated = async () => {
    await loadAll();
    setOpenScenarioModal(false);
  };

  const handleCaseCreated = async () => {
    await loadAll();
    setOpenCaseModal(false);
  };

  const handleStepsCreated = async () => {
    await loadAll();
    setOpenStepsModal(false);
  };

  if (loading) {
    return <div className="p-10 text-gray-500">Loading Test Design…</div>;
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-80px)] p-6">

      {/* -------------------------------- */}
      {/* LEFT SIDEBAR — TEST STORIES      */}
      {/* -------------------------------- */}

      <aside className="w-80 bg-white border rounded-xl shadow p-4 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Test Stories</h3>

          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => setOpenScenarioModal(true)}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {testStories.map((story) => (
            <div key={story.id}>
              <div
                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                  selectedStory?.id === story.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setSelectedStory(story);
                  setSelectedScenario(story.scenarios[0] || null);
                  setSelectedCase(
                    story.scenarios[0]?.cases[0] || null
                  );
                }}
              >
                <Folder size={16} className="text-blue-600" />
                <span className="text-sm">{story.name}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* -------------------------------- */}
      {/* MAIN PANEL                      */}
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
      {/* MODALS                           */}
      {/* -------------------------------- */}

      {openScenarioModal && selectedStory && (
        <AddScenarioModal
           storyId={selectedStory.id}
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
