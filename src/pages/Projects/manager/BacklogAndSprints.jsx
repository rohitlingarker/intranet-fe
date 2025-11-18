// src/pages/Projects/manager/BacklogAndSprints.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, List, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Button from "../../../components/Button/Button";
import StoryCard from "./Sprint/StoryCard";
import SprintColumn from "./Sprint/SprintColumn";
import CreateSprintModal from "./Sprint/CreateSprintModal";
import CreateIssueForm from "./Backlog/CreateIssueForm";

const BacklogAndSprints = ({ projectId, projectName }) => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [backlogStories, setBacklogStories] = useState([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [expandedSprint, setExpandedSprint] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  /** ==============================
   * Fetch Data
   ============================== */
  const fetchStories = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`,
        { headers }
      );
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      setStories(list);
      setBacklogStories(list.filter((s) => !s.sprintId && !s.sprint));
    } catch (err) {
      console.error("Failed to fetch stories", err);
      toast.error("Failed to fetch stories");
    }
  };

  const fetchSprints = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`,
        { headers }
      );
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      setSprints(list);
    } catch (err) {
      console.error("Failed to fetch sprints", err);
      toast.error("Failed to fetch sprints");
    }
  };

  useEffect(() => {
    fetchStories();
    fetchSprints();
  }, [projectId]);

  const goToIssueTracker = () => {
    navigate(`/projects/${projectId}/issuetracker`, {
      state: { projectId },
    });
  };

  /** ==============================
   * Handlers
   ============================== */
  const handleDropStory = async (storyId, sprintId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}/assign-sprint`,
        { sprintId },
        { headers }
      );
      toast.success("Story moved successfully");
      fetchStories();
    } catch (err) {
      console.error("Failed to assign story", err);
      toast.error("Failed to assign story");
    }
  };

  const handleSprintStatus = async (sprintId, action) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/sprints/${sprintId}/${action}`,
        {},
        { headers }
      );
      toast.success(`Sprint ${action === "start" ? "started" : "completed"}!`);
      setSprints((prev) =>
        prev.map((s) => (s.id === sprintId ? res.data : s))
      );
      fetchStories();
    } catch (err) {
      console.error("Failed to update sprint", err);
      toast.error("Failed to update sprint");
    }
  };

  /** ==============================
   * UI Helpers
   ============================== */
  const activeAndPlanningSprints = sprints.filter(
    (s) => s.status === "ACTIVE" || s.status === "PLANNING"
  );

  /** ==============================
   * Render
   ============================== */
  return (
    <DndProvider backend={HTML5Backend}>
      <ToastContainer />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* ===== Header ===== */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-indigo-900">
            Backlog & Sprint Planning – {projectName}
          </h1>
          <div className="flex gap-3">
            <Button
              size="medium"
              variant="outline"
              className="flex items-center gap-2"
              onClick={goToIssueTracker}
            >
              <List size={18} /> Issue Tracker
            </Button>

            <Button
              onClick={() => setShowSprintModal(true)}
              className="flex items-center gap-2"
            >
              <Plus size={18} /> Create Sprint
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowIssueForm(true)}
            >
              <Plus size={18} /> Create Issue
            </Button>
          </div>
        </div>

        {/* ===== Sprint List (Expandable Panels) ===== */}
        <div className="space-y-4">
          {activeAndPlanningSprints.length === 0 ? (
            <p className="text-gray-400 italic">No active or planning sprints.</p>
          ) : (
            activeAndPlanningSprints.map((sprint) => {
              const isExpanded = expandedSprint === sprint.id;
              const sprintStories = stories.filter(
                (s) => s.sprintId === sprint.id || s.sprint?.id === sprint.id
              );

              return (
                <div
                  key={sprint.id}
                  className="border rounded-xl bg-white shadow hover:shadow-md transition overflow-hidden"
                >
                  <div
                    className="flex justify-between items-center px-5 py-4 cursor-pointer bg-white-50 hover:bg-white-100 transition"
                    onClick={() =>
                      setExpandedSprint(isExpanded ? null : sprint.id)
                    }
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-900">
                        {sprint.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {sprint.startDate} → {sprint.endDate}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </div>

                  {/* SprintColumn always rendered for drag/drop */}
                  <div
                    className={`transition-all ${
                      isExpanded ? "p-4 bg-gray-50" : "h-4 overflow-hidden"
                    }`}
                  >
                    <SprintColumn
                      sprint={sprint}
                      stories={sprintStories}
                      onDropStory={handleDropStory}
                      onChangeStatus={handleSprintStatus}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ===== Backlog Section ===== */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-900 mb-3">
            Product Backlog
          </h2>
          {backlogStories.length === 0 ? (
            <p className="text-gray-400 italic">No stories in backlog.</p>
          ) : (
            <div className="space-y-2">
              {backlogStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  sprints={activeAndPlanningSprints}
                  onAddToSprint={handleDropStory} // enables drag from backlog to sprint
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== Modals ===== */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowIssueForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
            >
              <X size={22} />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
              Create Epic
            </h2>

            {/* Form Component */}
            <CreateIssueForm
              onClose={() => setShowIssueForm(false)}
              onCreated={() => fetchStories()}
              projectId={projectId}
            />
          </div>
        </div>
      )}

      <CreateSprintModal
        isOpen={showSprintModal}
        projectId={projectId}
        onClose={() => setShowSprintModal(false)}
        onCreated={(newSprint) => setSprints((prev) => [...prev, newSprint])}
      />
    </DndProvider>
  );
};

export default BacklogAndSprints;
