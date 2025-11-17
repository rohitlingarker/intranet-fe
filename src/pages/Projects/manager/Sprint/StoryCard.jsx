import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { MoreVertical } from "lucide-react";

const StoryCard = ({ story, onOpen }) => {
  const [, dragRef] = useDrag({
    type: "STORY",
    item: { id: story.id },
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onOpen(story.id);
  }

  return (
    <div
      ref={dragRef}
      onClick={handleClick}
      className="bg-white p-3 rounded shadow-sm border hover:shadow-md cursor-pointer"
    >
      {/* Story Info */}
      <div>
        <p className="text-sm font-semibold text-indigo-900">{story.title}</p>
        <p className="text-xs text-pink-800">Status: {story.status}</p>
      </div>

      {/* Three-dot menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu((prev) => !prev)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
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
