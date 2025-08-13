import React, { useEffect, useState } from "react";

import axios from "axios";
import StoryCard from "../UserSprint/StoryCard";
import SprintColumn from "../UserSprint/SprintColumn";
import Button from "../../../../components/Button/Button";

const Backlog = ({ projectId, projectName }) => {
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);

  const fetchStories = () => {
    axios
      .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`)
      .then((res) => setStories(res.data))
      .catch((err) => console.error("Failed to fetch stories", err));
  };

  const fetchSprints = () => {
    axios
      .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`)
      .then((res) =>
        setSprints(res.data.filter((s) => s.status === "PLANNING"))
      )
      .catch((err) => console.error("Failed to fetch sprints", err));
  };

  useEffect(() => {
    fetchStories();
    fetchSprints();
  }, [projectId]);

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-indigo-900">
          Backlog of {projectName}
        </h1>
        <div className="flex gap-3">
          {/* Optional Create Sprint Button */}
          {/* Uncomment this button if you want to allow sprint creation */}
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

      {/* Create Sprint Modal */}
      {showSprintForm && <CreateSprint onClose={() => setShowSprintForm(false)} />}

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

      {/* Sprint Assignment View (Read-only) */}
      <div>
        <h2 className="text-base font-medium text-indigo-900 mb-3">
          Assigned to Sprints
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sprints.map((sprint) => (
            <SprintColumn
              key={sprint.id}
              sprint={sprint}
              stories={stories.filter((s) => s.sprintId === sprint.id)}
              onDropStory={() => {}}
              onChangeStatus={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Backlog;
