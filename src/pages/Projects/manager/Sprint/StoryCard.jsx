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
      className="relative bg-white p-3 rounded shadow-sm border hover:shadow-md cursor-pointer flex justify-between items-center transition"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* LEFT SECTION — Title */}
      <div className="flex items-center gap-2">
        <span className="text-blue-500 text-sm">📑</span>
        <p className="text-[15px] font-medium text-indigo-900">
          {story.title}
        </p>
      </div>

      {/* RIGHT SECTION — Status + Epic + 3-dot */}
      <div className="flex items-center gap-4 relative">

        {/* STATUS */}
        <p className="text-sm text-pink-700 whitespace-nowrap">
          <span className="font-medium">Status:</span> {statusText}
        </p>

        {/* +Epic Button (Only if not already assigned) */}
        {story.epicId === null && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowEpicList((prev) => !prev);
            }}
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            <Plus size={12} /> Epic
          </button>
        )}

        {/* EPIC DROPDOWN */}
        {showEpicList && (
          <div className="absolute right-10 top-6 w-48 bg-white border rounded-md shadow-lg z-50">
            {epics.length === 0 ? (
              <p className="text-xs text-gray-500 p-2 text-center">
                No epics available
              </p>
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

        {/* 3-DOT MENU */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="p-1 rounded hover:bg-gray-100"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-6 w-40 bg-white border rounded shadow-md z-50">
              {sprints.length === 0 ? (
                <p className="text-xs text-gray-500 p-2 text-center">
                  No sprints
                </p>
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
    </div>
  );
};

export default StoryCard;
