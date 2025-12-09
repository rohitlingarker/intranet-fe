// src/pages/Projects/manager/Sprint/SprintColumn.jsx

import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { ChevronRight, ChevronDown, MoreVertical } from "lucide-react";
import StoryCard from "./StoryCard";
import TaskCard from "./TaskCard";

const SprintColumn = ({
  sprint,
  stories = [],
  tasks = [],
  epics = [],
  allStories = [],
  statuses = [],
  sprints = [],

  onDropStory,
  onChangeStatus,
  onEditSprint,
  onDeleteSprint,
  onChangeStoryStatus,

  onSelectEpic,
  onSelectParentStory,
  onStoryClick,
  onTaskClick,
}) => {
  const [expanded, setExpanded] = useState(false); // collapsed by default
  const [menuOpen, setMenuOpen] = useState(false);

  const isCompleted = sprint.status === "COMPLETED";

  // Format as "2 Jan 2026"
  const formatPrettyDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const start = formatPrettyDate(sprint.startDateReadable || sprint.startDate);
  const end = formatPrettyDate(sprint.endDateReadable || sprint.endDate);

  const totalItems = stories.length + tasks.length;

  /** DRAG & DROP TARGET */
  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: "STORY",
      canDrop: () => !isCompleted,
      drop: (item) => {
        if (!isCompleted) onDropStory(item.id, sprint.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver() && !isCompleted,
      }),
    }),
    [isCompleted]
  );

  const sortedStories = [...stories].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div
      ref={dropRef}
      className={`border bg-white rounded-xl shadow-sm transition ${
        isOver ? "bg-blue-50 border-blue-400" : ""
      }`}
    >
      {/* ===========================
          HEADER (Azure DevOps Style)
      ============================ */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="px-5 py-3 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        {/* LEFT SECTION */}
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown /> : <ChevronRight />}

          {/* Sprint Name */}
          <h3 className="font-semibold text-gray-900 text-[16px]">
            {sprint.name || "Unnamed Sprint"}
          </h3>

          {/* Large inline date range */}
          <span className="text-sm text-gray-600">
            {start} – {end}
          </span>

          {/* Work items count */}
          <span className="text-sm text-gray-500">
            ({totalItems} work items)
          </span>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          {!isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeStatus(
                  sprint.id,
                  sprint.status === "ACTIVE" ? "complete" : "start"
                );
              }}
              className="px-4 py-1 border rounded-full text-sm text-green-700 border-green-700 hover:bg-green-50"
            >
              {sprint.status === "ACTIVE" ? "Complete sprint" : "Start sprint"}
            </button>
          )}

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="p-1"
            >
              <MoreVertical />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bg-white border shadow rounded w-40 z-20">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditSprint(sprint);
                  }}
                >
                  Edit Sprint
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteSprint(sprint.id);
                  }}
                >
                  Delete Sprint
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===========================
           BODY CONTENT
      ============================ */}
      {expanded && (
        <div className="p-4 space-y-3 min-h-[80px]">
          {totalItems === 0 && (
            <p className="text-gray-400 italic">No work items</p>
          )}

          {sortedStories.map((story) => (
            <StoryCard
              key={`story-${story.id}`}
              story={story}
              epics={epics}
              statuses={statuses}
              sprints={sprints}
              onSelectEpic={onSelectEpic}
              onChangeStatus={onChangeStoryStatus}
              onAddToSprint={onDropStory}
              onClick={() => onStoryClick(story.id)}
            />
          ))}

          {sortedTasks.map((task) => (
            <TaskCard
              key={`task-${task.id}`}
              task={task}
              stories={allStories}
              sprints={sprints}
              onSelectParentStory={onSelectParentStory}
              onAddToSprint={onDropStory}
              onClick={() => onTaskClick(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SprintColumn;
