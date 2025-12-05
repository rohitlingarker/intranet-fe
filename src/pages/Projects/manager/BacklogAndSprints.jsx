// src/pages/Projects/manager/BacklogAndSprints.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, List, X } from "lucide-react";
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

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

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
      toast.error("Failed to fetch stories");
      console.error(err);
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
      toast.error("Failed to fetch sprints");
    }
  };

  useEffect(() => {
    fetchStories();
    fetchSprints();
  }, [projectId]);

  const goToIssueTracker = () => {
    navigate(`/projects/${projectId}/issuetracker`, { state: { projectId } });
  };

  const handleDropStory = async (storyId, sprintId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}/assign-sprint`,
        { sprintId },
        { headers }
      );
      toast.success("Story moved successfully");
      // fetchStories will refresh backlog & sprint lists
      fetchStories();
    } catch (err) {
      toast.error("Failed to assign story");
      console.error(err);
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
      setSprints((prev) => prev.map((s) => (s.id === sprintId ? res.data : s)));
      fetchStories();
    } catch (err) {
      toast.error("Failed to update sprint");
      console.error(err);
    }
  };

  const activeAndPlanningSprints = sprints.filter(
    (s) => s.status === "ACTIVE" || s.status === "PLANNING"
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <ToastContainer />

      <div className="max-w-7xl mx-auto px-8 py-6 space-y-8">
        <div className="flex justify-between items-center pb-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Backlog & Sprint Planning — {projectName}
          </h1>

          <div className="flex items-center gap-3">
            <Button
              size="medium"
              variant="outline"
              onClick={goToIssueTracker}
              className="flex items-center gap-2 shadow-sm hover:shadow-md transition rounded-xl"
            >
              <List size={18} /> Issue Tracker
            </Button>

            <Button
              onClick={() => setShowSprintModal(true)}
              className="flex items-center gap-2 shadow-sm hover:shadow-md transition rounded-xl"
            >
              <Plus size={18} /> Create Sprint
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowIssueForm(true)}
              className="flex items-center gap-2 shadow-sm hover:shadow-md transition rounded-xl"
            >
              <Plus size={18} /> Create Issue
            </Button>
          </div>
        </div>

        {/* SPRINTS LIST - SprintColumn now renders header (with drop zone) always */}
        <div className="space-y-5">
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
                  className="border rounded-2xl bg-white shadow-sm hover:shadow-md transition"
                >
                  <SprintColumn
                    sprint={sprint}
                    stories={sprintStories}
                    onDropStory={handleDropStory}
                    onChangeStatus={handleSprintStatus}
                    onStoryClick={() => {}}
                    isExpanded={isExpanded}
                    onToggleExpand={(id) =>
                      setExpandedSprint((prev) => (prev === id ? null : id))
                    }
                    formatDateShort={formatDateShort}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Backlog */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition overflow-visible">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Backlog</h2>

          {backlogStories.length === 0 ? (
            <p className="text-gray-400 italic">No stories in backlog.</p>
          ) : (
            <div className="space-y-3">
              {backlogStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  sprints={activeAndPlanningSprints}
                  onAddToSprint={handleDropStory}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Issue Modal */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <button
              onClick={() => setShowIssueForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-semibold text-gray-900 mb-5 border-b pb-3">
              Create Epic
            </h2>

            <CreateIssueForm
              onClose={() => setShowIssueForm(false)}
              onCreated={fetchStories}
              projectId={projectId}
            />
          </div>
        </div>
      )}

      {/* Create Sprint Modal */}
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
