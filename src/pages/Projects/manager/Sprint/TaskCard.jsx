import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { MoreVertical, Plus } from "lucide-react";

const TaskCard = ({
  task,
  sprints = [],
  stories = [],
  onAddToSprint,
  onSelectParentStory,
  onClick,
}) => {
  const [, dragRef] = useDrag({
    type: "TASK",
    item: { id: task.id },
  });

  const [showMenu, setShowMenu] = useState(false);
  const [showStoryList, setShowStoryList] = useState(false);

  const handleSelectSprint = (sprintId) => {
    onAddToSprint?.(task.id, sprintId);
    setShowMenu(false);
  };

  const handleSelectStory = (storyId) => {
    onSelectParentStory?.(task.id, storyId);
    setShowStoryList(false);
  };

  return (
    <div
      ref={dragRef}
      className="relative bg-white p-3 rounded shadow-sm border hover:shadow-md cursor-pointer flex justify-between items-start transition"
    >
      {/* ===== Left Content ===== */}
      <div
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
      >
        <div className="flex items-center gap-1">
          <span className="text-green-600 text-sm cursor-default">☑️</span>
          <p className="text-sm font-semibold text-blue-900">{task.title}</p>
        </div>

        <p className="text-xs text-pink-800">
          Status: {task.statusText || task.status?.name || task.statusName}
        </p>
      </div>


      {/* ===== Right Controls (Story Button + Menu) ===== */}
      <div className="relative flex items-start gap-2">
        {/* + Story Button (Right Side) */}
        {task.storyId === null && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowStoryList((prev) => !prev);   // ✅ FIXED
            }}
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            <Plus size={12} /> Story
          </button>
        )}

        

        {/* 3-dot menu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu((prev) => !prev);
          }}
          className="p-1 rounded hover:bg-gray-100"
        >
          <MoreVertical size={16} />
        </button>

        {/* Dropdown: Add to Sprint */}
        {showMenu && (
          <div className="absolute right-0 mt-6 w-40 bg-white border rounded-md shadow-lg z-50">
            {sprints.length === 0 ? (
              <p className="text-xs text-gray-500 p-2 text-center">No sprints</p>
            ) : (
              sprints.map((sprint) => (
                <button
                  key={sprint.id}
                  onClick={() => handleSelectSprint(sprint.id)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  Add to {sprint.name}
                </button>
              ))
            )}
          </div>
        )}

        {/* Dropdown: Stories List */}
        {showStoryList && (
          <div className="absolute right-10 mt-6 w-48 bg-white border rounded-md shadow-lg z-50">
            {stories.length === 0 ? (
              <p className="text-xs text-gray-500 p-2 text-center">
                No stories available
              </p>
            ) : (
              stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => handleSelectStory(story.id)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {story.title}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
