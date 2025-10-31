// src/pages/Projects/manager/Backlog.jsx
import React, { useEffect, useState } from "react";
import CreateSprint from "./sprint";
import { Plus, List } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateIssueForm from "./CreateIssueForm";
import StoryCard from "../Sprint/StoryCard";
import SprintColumn from "../Sprint/SprintColumn";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Button from "../../../../components/Button/Button";

const Backlog = ({ projectId, projectName }) => {
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [noEpicStories, setNoEpicStories] = useState([]);
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const handleCloseForms = () => {
    setShowIssueForm(false);
    setShowSprintForm(false);
  };

  const fetchProjects = () => {
    axios
      .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, { headers })
      .then((res) => setProjects(res.data.content || res.data || []))
      .catch((err) => console.error("Failed to fetch projects", err));
  };

  const fetchStories = () => {
    axios
      .get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`,
        { headers }
      )
      .then((res) => setStories(res.data))
      .catch((err) => console.error("Failed to fetch stories", err));
  };

  const fetchNoEpicStories = () => {
    axios
      .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/stories/no-epic`, {
        params: { projectId },
        headers,
      })
      .then((res) => setNoEpicStories(res.data))
      .catch((err) => console.error("Failed to fetch no epic stories", err));
  };

  const fetchSprints = () => {
    axios
      .get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`,
        { headers }
      )
      .then((res) => setSprints(res.data))
      .catch((err) => console.error("Failed to fetch sprints", err));
  };

  useEffect(() => {
    fetchProjects();
    fetchStories();
    fetchSprints();
    fetchNoEpicStories();
  }, [projectId]);

  // ✅ Handle story drop & update lists immediately
  const handleDropStory = (storyId, sprintId) => {
    axios
      .put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}/assign-sprint`,
        { sprintId },
        { headers }
      )
      .then(() => {
        // Update local state instantly
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId ? { ...s, sprintId: sprintId } : s
          )
        );
        // Remove from backlog stories (noEpicStories)
        setNoEpicStories((prev) => prev.filter((s) => s.id !== storyId));
      })
      .catch((err) => console.error("Failed to assign story to sprint", err));
  };

  const selectedProject = projects.find((p) => p.id === projectId);

  const goToIssueTracker = () => {
    navigate(`/projects/${projectId}/issuetracker`, {
      state: { projectId },
    });
  };

  const filteredNoEpicStories = noEpicStories || [];
  const filteredStories = stories || [];

  // ✅ Sort sprints by latest created
  const sortedSprints = [...sprints].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-indigo-900">
            Backlog of {projectName}
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
              size="medium"
              variant="primary"
              className="flex items-center gap-2"
              onClick={() => setShowIssueForm(true)}
            >
              <Plus size={18} /> Create Issue
            </Button>
          </div>
        </div>

        {/* ✅ Create Issue Modal */}
        {showIssueForm && selectedProject && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
              <CreateIssueForm
                onClose={handleCloseForms}
                onCreated={() => {
                  fetchStories();
                  fetchNoEpicStories();
                }}
                projectId={projectId}
                ownerId={selectedProject.owner?.id}
                memberIds={selectedProject.members?.map((m) => m.id) || []}
              />
            </div>
          </div>
        )}

        {/* Create Sprint Modal */}
        {showSprintForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
              <CreateSprint onClose={handleCloseForms} projectId={projectId} />
            </div>
          </div>
        )}

        {/* Backlog Stories Section */}
        <div className="bg-white border p-4 rounded-lg shadow-sm min-h-[120px]">
          <h2 className="text-base font-medium text-indigo-900 mb-3">
            Backlog Stories
          </h2>
          {filteredNoEpicStories.length === 0 ? (
            <p className="text-gray-400 italic">No unassigned stories</p>
          ) : (
            <div className="space-y-2">
              {filteredNoEpicStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={{ ...story, status: "BACKLOG" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sprint Columns */}
        <div>
          <h2 className="text-base font-medium text-indigo-900 mb-3">
            Assign to Sprint
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedSprints.map((sprint) => (
              <SprintColumn
                key={sprint.id}
                sprint={sprint}
                stories={filteredStories.filter(
                  (s) => s.sprintId === sprint.id
                )}
                onDropStory={handleDropStory}
                onChangeStatus={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default Backlog;
