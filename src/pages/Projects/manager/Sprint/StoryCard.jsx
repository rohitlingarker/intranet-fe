// src/pages/Projects/manager/Sprint/StoryCard.jsx

import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { MoreVertical, Plus } from "lucide-react";

const StoryCard = ({
  story,
  sprints = [],
  epics = [],
  onAddToSprint,
  onSelectEpic,
  onClick,
}) => {
  const [, dragRef] = useDrag({
    type: "STORY",
    item: { id: story.id },
  });

  const [showMenu, setShowMenu] = useState(false);
  const [showEpicList, setShowEpicList] = useState(false);

  const handleSelectSprint = (sprintId) => {
    onAddToSprint?.(story.id, sprintId);
    setShowMenu(false);
  };

  const handleSelectEpic = (epicId) => {
    onSelectEpic?.(story.id, epicId);
    setShowEpicList(false);
  };

  const statusText =
    story.statusText || story.status?.name || story.statusName || "";

  return (
    <div
      ref={dragRef}
      className="relative bg-white p-3 rounded shadow-sm border hover:shadow-md cursor-pointer flex justify-between items-start transition"
      onClick={() => onClick?.()}   // ENTIRE CARD clickable
    >
      {/* LEFT + MIDDLE (no extra wrapper) */}
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <span className="text-blue-500 text-sm">📑</span>
          <p className="text-sm font-semibold text-indigo-900">{story.title}</p>
        </div>

        <p className="text-xs text-pink-800">
          Status: {story.statusText || story.status?.name || story.statusName}
        </p>
      </div>

      {/* RIGHT SECTION (stop events from opening form) */}
      <div
        className="relative flex items-start gap-2"
        onClick={(e) => e.stopPropagation()} // prevent form popup
      >
        {/* + Epic Button */}
        {story.epicId === null && (
          <button
            type="button"
            onClick={() => setShowEpicList((prev) => !prev)}
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            <Plus size={12} /> Epic
          </button>
        )}

        {/* Epic List Dropdown */}
        {showEpicList && (
          <div className="absolute right-10 top-6 w-48 bg-white border rounded-md shadow-lg z-50">
            {epics.length === 0 ? (
              <p className="text-xs text-gray-500 p-2 text-center">No epics available</p>
            ) : (
              epics.map((epic) => (
                <button
                  key={epic.id}
                  onClick={() => handleSelectEpic(epic.id)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {epic.name}
                </button>
              ))
            )}
          </div>
        )}

        {/* 3-Dot Menu */}
        <button
          onClick={() => setShowMenu((prev) => !prev)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <MoreVertical size={16} />
        </button>

        {/* Sprint Dropdown */}
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
      </div>
    </div>
  );
};

export default StoryCard;
