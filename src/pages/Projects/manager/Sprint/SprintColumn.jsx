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
  const [expanded, setExpanded] = useState(true); // auto-expanded by default
  const [menuOpen, setMenuOpen] = useState(false);

  const isCompleted = sprint.status === "COMPLETED";

  /** Drag & Drop setup */
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
    <div className="border bg-white rounded-xl shadow-sm">
      {/* ===== HEADER ===== */}
      <div
        ref={dropRef}
        onClick={() => setExpanded((e) => !e)}
        className={`px-5 py-3 flex justify-between items-center cursor-pointer transition
          ${isOver ? "bg-pink-100" : "bg-gray-50 hover:bg-gray-100"}
          ${isCompleted ? "opacity-80 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown /> : <ChevronRight />}
          <h3 className="font-semibold text-gray-900">{sprint.name || "Unnamed Sprint"}</h3>
          <span className="text-sm text-gray-500">
            {sprint.startDateReadable || sprint.startDate} – {sprint.endDateReadable || sprint.endDate}
          </span>
          <span className="text-sm text-gray-500">
            ({stories.length + tasks.length} items)
          </span>
        </div>

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
              className={`px-4 py-1 border rounded-lg text-sm ${
                sprint.status === "ACTIVE"
                  ? "text-pink-700 border-pink-700 hover:bg-pink-50"
                  : "text-indigo-700 border-indigo-700 hover:bg-indigo-50"
              }`}
            >
              {sprint.status === "ACTIVE" ? "Complete sprint" : "Start sprint"}
            </button>
          )}

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((x) => !x);
              }}
            >
              <MoreVertical />
            </button>
            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bg-white border shadow rounded w-40 z-10"
              >
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditSprint(sprint);
                  }}
                >
                  Edit sprint
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteSprint(sprint.id);
                  }}
                >
                  Delete sprint
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      {expanded && (
        <div className="p-4 space-y-3 min-h-[100px]">
          {sortedStories.length === 0 && sortedTasks.length === 0 ? (
            <p className="text-gray-400 italic">No stories or tasks in this sprint</p>
          ) : (
            <>
              {sortedStories.map((story) => (
                <StoryCard
                  key={`story-${story.id}`}
                  story={story}
                  epics={epics}
                  statuses={statuses}
                  sprints={[]}
                  onSelectEpic={onSelectEpic}
                  onChangeStatus={onChangeStoryStatus}
                  onAddToSprint={onDropStory}
                  onClick={() => onStoryClick?.(story.id)}
                />
              ))}
              {sortedTasks.map((task) => (
                <TaskCard
                  key={`task-${task.id}`}
                  task={task}
                  stories={allStories}
                  sprints={[]}
                  onSelectParentStory={onSelectParentStory}
                  onAddToSprint={onDropStory}
                  onClick={() => onTaskClick?.(task.id)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SprintColumn;
