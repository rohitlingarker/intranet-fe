import React, { useEffect, useState } from "react";
import CreateEpic from "./epic";
import CreateUserStory from "./userstory";
import CreateSprint from "./sprint";
import CreateTaskModal from "./tasks";
import { Plus } from "lucide-react";
import axios from "axios";

import StoryCard from "../Sprint/StoryCard";
import SprintColumn from "../Sprint/SprintColumn";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const Backlog: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [issueType, setIssueType] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [stories, setStories] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);

  const handleSelect = (type: string) => {
    setIssueType(type);
    setShowDropdown(false);
  };

  const handleCloseForm = () => {
    setIssueType("");
  };

  // Fetch backlog stories and sprints
  useEffect(() => {
    axios.get(`http://localhost:8080/api/projects/${projectId}/stories`).then((res) => {
      setStories(res.data);
    });

    axios.get(`http://localhost:8080/api/projects/${projectId}/sprints`).then((res) => {
      const planningSprints = res.data.filter((s: any) => s.status === "PLANNING");
      setSprints(planningSprints);
    });
  }, [projectId]);

  // Handle drop logic
  const handleDropStory = (storyId: number, sprintId: number) => {
    axios
      .put(`http://localhost:8080/api/stories/${storyId}/assign-sprint`, { sprintId })
      .then(() => {
        setStories((prev) =>
          prev.map((s) => (s.id === storyId ? { ...s, sprintId } : s))
        );
      });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Backlog</h1>

          <div className="flex gap-3">
            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={18} /> Create Issue
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md z-10">
                  <button
                    onClick={() => handleSelect("EPIC")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    🧩 Epic
                  </button>
                  <button
                    onClick={() => handleSelect("STORY")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    📘 User Story
                  </button>
                  <button
                    onClick={() => handleSelect("TASK")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    ✅ Task
                  </button>
                </div>
              )}
            </div>

            {/* Create Sprint */}
            <button
              onClick={() => handleSelect("SPRINT")}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Plus size={18} /> Create Sprint
            </button>
          </div>
        </div>

        {/* Render Form */}
        <div className="transition-all duration-300">{(() => {
          switch (issueType) {
            case "EPIC":
              return <CreateEpic onClose={handleCloseForm} />;
            case "STORY":
              return <CreateUserStory onClose={handleCloseForm} />;
            case "TASK":
              return <CreateTaskModal onClose={handleCloseForm} />;
            case "SPRINT":
              return <CreateSprint onClose={handleCloseForm} />;
            default:
              return null;
          }
        })()}</div>

        {/* Unassigned Stories */}
        <div className="bg-white border p-4 rounded-lg shadow-sm min-h-[120px]">
          <h2 className="text-lg font-semibold mb-3">Backlog Stories</h2>
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

        {/* Sprint Columns */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Assign to Sprint</h2>
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
