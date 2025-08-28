import React, { useEffect, useState } from "react";
import axios from "axios";
import StoryCard from "../UserSprint/StoryCard";
import SprintColumn from "../UserSprint/SprintColumn";

const Backlog = ({ projectId, projectName }) => {
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchStories = () => {
    axios
      .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`, { headers })
      .then((res) => setStories(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch stories", err));
  };

  const fetchSprints = () => {
    axios
      .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`, { headers })
      .then((res) =>
        setSprints(Array.isArray(res.data) ? res.data.filter((s) => s.status === "PLANNING") : [])
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
      </div>

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

      {/* Sprint Assignment (Read-only) */}
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
              onDropStory={null} // drag removed
              onChangeStatus={null} // read-only
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Backlog;
