import React, { useEffect, useState } from "react";
import CreateSprint from "./sprint";
import { Plus } from "lucide-react";
import axios from "axios";

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

  const handleCloseForms = () => {
    setShowIssueForm(false);
    setShowSprintForm(false);
  };

  const fetchStories = () => {
    axios
      .get(`http://localhost:8080/api/projects/${projectId}/stories`)
      .then((res) => setStories(res.data))
      .catch((err) => console.error("Failed to fetch stories", err));
  };

  const fetchSprints = () => {
    axios
      .get(`http://localhost:8080/api/projects/${projectId}/sprints`)
      .then((res) =>
        setSprints(res.data.filter((s) => s.status === "PLANNING"))
      )
      .catch((err) => console.error("Failed to fetch sprints", err));
  };

  useEffect(() => {
    fetchStories();
    fetchSprints();
  }, [projectId]);

  const handleDropStory = (storyId, sprintId) => {
    axios
      .put(`http://localhost:8080/api/stories/${storyId}/assign-sprint`, {
        sprintId,
      })
      .then(() => {
        setStories((prev) =>
          prev.map((s) => (s.id === storyId ? { ...s, sprintId } : s))
        );
      })
      .catch((err) => console.error("Failed to assign story to sprint", err));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-indigo-900">
            Backlog of {projectName}
          </h1>
          <div className="flex gap-3">
            {/* Create Issue Button */}
            <Button
              size="medium"
              variant="primary"
              className="flex items-center gap-2"
              onClick={() => setShowIssueForm(true)}
            >
              <Plus size={18} /> Create Issue
            </Button>

            {/* Optional Create Sprint Button */}
            {/* <Button
              size="medium"
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => setShowSprintForm(true)}
            >
              <Plus size={18} /> Create Sprint
            </Button> */}
          </div>
        </div>

        {/* Create Issue Form */}
        {showIssueForm && (
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <CreateIssueForm
              onClose={handleCloseForms}
              onCreated={fetchStories}
              projectId={projectId}
            />
          </div>
        )}

        {/* Create Sprint Modal */}
        {showSprintForm && <CreateSprint onClose={handleCloseForms} />}

        {/* Backlog Stories */}
        <div className="bg-white border p-4 rounded-lg shadow-sm min-h-[120px]">
          <h2 className="text-base font-medium text-indigo-900 mb-3">
            Backlog Stories
          </h2>
          {stories.filter((s) => !s.sprintId).length === 0 ? (
            <p className="text-gray-400 italic">No unassigned stories</p>
          ) : (
            <div className="space-y-2">
              {stories
                .filter((s) => !s.sprintId)
                .map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
            </div>
          )}
        </div>

        {/* Sprint Assignment */}
        <div>
          <h2 className="text-base font-medium text-indigo-900 mb-3">
            Assign to Sprint
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sprints.map((sprint) => (
              <SprintColumn
                key={sprint.id}
                sprint={sprint}
                stories={stories.filter((s) => s.sprintId === sprint.id)}
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
