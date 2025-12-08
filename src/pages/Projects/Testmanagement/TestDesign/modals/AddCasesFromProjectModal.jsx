import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import { ChevronDown, ChevronRight, Folder, FileText } from "lucide-react";
import { useParams } from "react-router-dom";
import { cy } from "date-fns/locale";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

/**
 * Component for selecting existing Test Cases from an existing Project's stories/scenarios.
 * This is a selection tool, not a creation tool.
 */
export default function AddCasesFromProjectModal({
  // projectId,
  onClose,
  onAddCases, // Function to pass selected case IDs back to the parent
}) {
  const { projectId, runId } = useParams();
  // State for data fetching
  const [stories, setStories] = useState([]);
  const [expandedStories, setExpandedStories] = useState({});
  const [isLoadingStories, setIsLoadingStories] = useState(true);

  // State for selection management
  const [selectedCases, setSelectedCases] = useState([]);
  const navigate = useNavigate();

  // =================================================
  // API FETCH LOGIC (No Change)
  // =================================================

  const fetchStories = async () => {
    setIsLoadingStories(true);
    try {
      console.log("Fetching stories for project:", projectId);
      const res = await axiosInstance.get(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-design/test-stories/projects/${projectId}`
      );
      setStories((res.data || []).map((s) => ({ ...s, scenarios: [] })));
    } catch (error) {
      console.error("Error fetching stories", error);
    } finally {
      setIsLoadingStories(false);
    }
  };

  const fetchScenarios = async (storyId) => {
    try {
      const res = await axiosInstance.get(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-design/scenarios/test-stories/${storyId}`
      );
      return (res.data || []).map((sc) => ({ ...sc, cases: [] }));
    } catch (error) {
      console.error("Error fetching scenarios", error);
      return [];
    }
  };

  const fetchCasesWithSteps = async (scenarioId) => {
    try {
      const casesRes = await axiosInstance.get(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-design/test-cases/scenarios/${scenarioId}`
      );

      const casesList = casesRes.data || [];
      const finalCases = [];

      for (const tc of casesList) {
        // Only fetch steps if absolutely necessary, otherwise keep it lean
        const stepsRes = await axiosInstance.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/test-cases/${
            tc.id
          }`
        );

        finalCases.push({
          ...tc,
          steps: stepsRes.data.steps || [],
        });
      }

      return finalCases;
    } catch (error) {
      console.error("Error fetching cases/steps", error);
      return [];
    }
  };

  useEffect(() => {
    fetchStories();
  }, [projectId]);

  // =================================================
  // HIERARCHY EXPANSION & DATA LOADING (No Change)
  // =================================================

  const toggleStory = async (story) => {
    const isOpen = expandedStories[story.id];

    if (isOpen) {
      setExpandedStories((prev) => ({ ...prev, [story.id]: false }));
      return;
    }

    if (story.scenarios.length === 0) {
      const scenarios = await fetchScenarios(story.id);

      const scenariosWithCases = await Promise.all(
        scenarios.map(async (sc) => {
          sc.cases = await fetchCasesWithSteps(sc.id);
          return sc;
        })
      );

      setStories((prev) =>
        prev.map((s) =>
          s.id === story.id ? { ...s, scenarios: scenariosWithCases } : s
        )
      );
    }

    setExpandedStories((prev) => ({ ...prev, [story.id]: true }));
  };

  // =================================================
  // SELECTION LOGIC (No Change)
  // =================================================

  const getAllCaseIdsInStory = (story) => {
    if (!story.scenarios) return [];
    return story.scenarios.flatMap((scenario) =>
      scenario.cases.map((tc) => tc.id)
    );
  };

  const getAllCaseIdsInScenario = (scenario) => {
    return scenario.cases.map((tc) => tc.id);
  };

  const toggleStorySelection = (story, isSelected) => {
    const allCaseIds = getAllCaseIdsInStory(story);
    if (allCaseIds.length === 0) return;

    setSelectedCases((prev) => {
      let newSelected = [...prev];
      if (isSelected) {
        newSelected = Array.from(new Set([...newSelected, ...allCaseIds]));
      } else {
        newSelected = newSelected.filter((id) => !allCaseIds.includes(id));
      }
      return newSelected;
    });
  };

  const toggleScenarioSelection = (scenario, isSelected) => {
    const allCaseIds = getAllCaseIdsInScenario(scenario);
    if (allCaseIds.length === 0) return;

    setSelectedCases((prev) => {
      let newSelected = [...prev];
      if (isSelected) {
        newSelected = Array.from(new Set([...newSelected, ...allCaseIds]));
      } else {
        newSelected = newSelected.filter((id) => !allCaseIds.includes(id));
      }
      return newSelected;
    });
  };

  const toggleCase = (caseId) => {
    setSelectedCases((prev) =>
      prev.includes(caseId)
        ? prev.filter((id) => id !== caseId)
        : [...prev, caseId]
    );
  };

  const selectionStatus = useMemo(() => {
    const status = { stories: {}, scenarios: {} };

    for (const story of stories) {
      const storyCaseIds = getAllCaseIdsInStory(story);
      const selectedStoryCases = storyCaseIds.filter((id) =>
        selectedCases.includes(id)
      );

      // Story status
      if (storyCaseIds.length === 0) {
        status.stories[story.id] = "disabled";
      } else if (selectedStoryCases.length === storyCaseIds.length) {
        status.stories[story.id] = "checked";
      } else if (selectedStoryCases.length > 0) {
        status.stories[story.id] = "indeterminate";
      } else {
        status.stories[story.id] = "unchecked";
      }

      // Scenario status
      if (story.scenarios) {
        for (const scenario of story.scenarios) {
          const scenarioCaseIds = getAllCaseIdsInScenario(scenario);
          const selectedScenarioCases = scenarioCaseIds.filter((id) =>
            selectedCases.includes(id)
          );

          if (scenarioCaseIds.length === 0) {
            status.scenarios[scenario.id] = "disabled";
          } else if (selectedScenarioCases.length === scenarioCaseIds.length) {
            status.scenarios[scenario.id] = "checked";
          } else if (selectedScenarioCases.length > 0) {
            status.scenarios[scenario.id] = "indeterminate";
          } else {
            status.scenarios[scenario.id] = "unchecked";
          }
        }
      }
    }
    return status;
  }, [stories, selectedCases]);

  // =================================================
  // FINAL ACTION HANDLER (Selection Only) 🎯
  // =================================================

  // const handleAddSelection = () => {
  //   if (selectedCases.length === 0) {
  //       // Optionally show a notification that no cases are selected
  //       return;
  //   }
  //   // Pass the selected IDs array back to the parent component
  //   onAddCases(selectedCases);
  // };

  //   const handleAddCasesSubmit = async (selectedCaseIds) => {

  //     console.log("Adding cases to run:", selectedCaseIds);
  //   // if (!selectedRunId) return;

  //   try {
  //     await axiosInstance.post(
  //       `${
  //         import.meta.env.VITE_PMS_BASE_URL
  //       }/api/test-execution/test-runs/${runId}/add-cases`,
  //       { testCaseIds: selectedCaseIds }
  //     );

  //     toast.success("Test cases added to run");
  //     // setShowAddCasesModal(false);

  //     // setRunsRefreshKey((k) => k + 1);
  //   } catch (err) {
  //     console.error("Error:", err);
  //     toast.error("Failed to add test cases");
  //   }
  // };

  const handleAddCasesSubmit = async (selectedCaseIds) => {
    console.log("Adding cases to run:", selectedCaseIds);

    try {
      await axiosInstance.post(
        `${
          import.meta.env.VITE_PMS_BASE_URL
        }/api/test-execution/test-runs/${runId}/add-cases`,
        { testCaseIds: selectedCaseIds }
      );

      toast.success("Test cases added to run");

      // Navigate back to the page that shows TestRunAccordion
      navigate(-1);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to add test cases");
    }
  };

  // =================================================
  // COMPONENTS / RENDER
  // =================================================

  const IndeterminateCheckbox = ({ id, status, onChange, entity }) => {
    const checkboxRef = React.useRef(null);
    const isDisabled = status === "disabled";

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = status === "indeterminate";
      }
    }, [status]);

    const isChecked = status === "checked" || status === "indeterminate";

    const baseClasses =
      "form-checkbox rounded border-gray-300 transition duration-150";
    const enabledClasses =
      "text-indigo-600 focus:ring-indigo-500 cursor-pointer";
    const disabledClasses = "text-gray-400 cursor-not-allowed";

    return (
      <input
        type="checkbox"
        ref={checkboxRef}
        id={`${entity}-${id}`}
        className={`${baseClasses} ${
          isDisabled ? disabledClasses : enabledClasses
        }`}
        checked={isChecked}
        disabled={isDisabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  };

  const StoryRow = ({ story }) => {
    const isExpanded = expandedStories[story.id];
    const status = selectionStatus.stories[story.id] || "unchecked";
    const isDisabled = status === "disabled";
    const caseCount = getAllCaseIdsInStory(story).length;

    return (
      <div>
        <div
          className={`flex items-center gap-2 p-2 rounded transition duration-150 ease-in-out ${
            isDisabled ? "cursor-not-allowed" : "hover:bg-indigo-50/50"
          }`}
        >
          <button
            onClick={() => toggleStory(story)}
            className="text-gray-500 hover:text-indigo-600 focus:outline-none p-1 -ml-1 rounded"
          >
            {isExpanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
          <IndeterminateCheckbox
            id={story.id}
            status={status}
            onChange={(isSelected) => toggleStorySelection(story, isSelected)}
            entity="story"
          />
          <Folder
            size={18}
            className={`mr-1 ${
              isDisabled ? "text-gray-400" : "text-indigo-600"
            }`}
          />
          <span
            className={`text-sm font-semibold cursor-default ${
              isDisabled ? "text-gray-500" : "text-gray-800"
            }`}
          >
            {story.name}
            <span className="font-normal text-xs text-gray-500 ml-1">
              ({caseCount} Cases)
            </span>
          </span>
        </div>

        {isExpanded && (
          <div className="ml-8 border-l border-gray-200 pl-4 mt-1 space-y-2">
            {story.scenarios.length === 0 ? (
              <div className="text-xs text-gray-500 italic py-2">
                No scenarios found for this story.
              </div>
            ) : (
              story.scenarios.map((sc) => (
                <ScenarioBlock key={sc.id} scenario={sc} />
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const ScenarioBlock = ({ scenario }) => {
    const status = selectionStatus.scenarios[scenario.id] || "unchecked";
    const isDisabled = status === "disabled";
    const caseCount = getAllCaseIdsInScenario(scenario).length;

    return (
      <div
        className={`p-3 rounded-lg shadow-sm border ${
          isDisabled
            ? "bg-gray-100 border-gray-200 cursor-not-allowed"
            : "bg-gray-50 border-gray-100"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <IndeterminateCheckbox
            id={scenario.id}
            status={status}
            onChange={(isSelected) =>
              toggleScenarioSelection(scenario, isSelected)
            }
            entity="scenario"
          />
          <span
            className={`text-sm font-medium ${
              isDisabled ? "text-gray-500" : "text-indigo-800"
            }`}
          >
            {scenario.title}
          </span>
        </div>

        <div className="ml-7 space-y-1">
          {scenario.cases.length === 0 ? (
            <div className="text-xs text-gray-400 italic">
              No test cases available.
            </div>
          ) : (
            scenario.cases.map((tc) => (
              <div
                key={tc.id}
                className="flex items-center gap-2 text-sm p-1 rounded hover:bg-white transition duration-100"
              >
                <input
                  type="checkbox"
                  id={`case-${tc.id}`}
                  className="form-checkbox text-green-600 rounded border-gray-300 focus:ring-green-500"
                  checked={selectedCases.includes(tc.id)}
                  onChange={() => toggleCase(tc.id)}
                />
                <FileText size={14} className="text-gray-500" />
                <label
                  htmlFor={`case-${tc.id}`}
                  className="text-gray-700 cursor-pointer flex-1"
                >
                  {tc.title}
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // =================================================
  // MAIN RENDER
  // =================================================

  return (
    <div>
      <div className=" w-[100%] max-h-[100%] flex flex-col rounded-xl shadow-2xl transition-transform duration-300 scale-100">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            ➕ Add Existing Test Cases
          </h2>
          <p className="text-sm text-gray-500">
            Select stories, scenarios, or individual cases to add. (
            {selectedCases.length} selected)
          </p>
        </div>

        {/* HIERARCHY TREE */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoadingStories ? (
            <div className="text-center py-10 text-gray-500">
              Loading Test Stories...
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-10 text-gray-500 italic">
              No Test Stories found for this project.
            </div>
          ) : (
            stories.map((story) => <StoryRow key={story.id} story={story} />)
          )}
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className={`px-6 py-2 text-white rounded-lg transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selectedCases.length > 0
                ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                : "bg-indigo-400 cursor-not-allowed"
            }`}
            onClick={() => handleAddCasesSubmit(selectedCases)}
            disabled={selectedCases.length === 0}
          >
            Add {selectedCases.length} Selected Case(s)
          </button>
        </div>
      </div>
    </div>
  );
}
