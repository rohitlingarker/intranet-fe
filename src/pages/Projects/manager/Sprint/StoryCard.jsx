import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { MoreVertical } from "lucide-react";

const StoryCard = ({ story, sprints = [], onAddToSprint }) => {
  const [, dragRef] = useDrag({
    type: "STORY",
    item: { id: story.id },
  });

  const [showMenu, setShowMenu] = useState(false);

  const handleSelectSprint = (sprintId) => {
    onAddToSprint(story.id, sprintId);
    setShowMenu(false);
  };

  return (
    <div
      ref={dragRef}
      className="relative bg-white p-3 rounded shadow-sm border hover:shadow-md cursor-move flex justify-between items-start transition"
    >
      <div>
        <p className="text-sm font-semibold text-indigo-900">{story.title}</p>
        <p className="text-xs text-pink-800">
          Status: {story.statusText || story.status?.name || story.statusName}
        </p>
      </div>

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
