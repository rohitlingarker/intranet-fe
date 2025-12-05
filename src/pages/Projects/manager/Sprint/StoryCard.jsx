// FULL UPDATED StoryCard.jsx

import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { MoreVertical } from "lucide-react";

const StoryCard = ({
  story,
  statuses,
  sprints = [],
  onAddToSprint,
  onMoveToBacklog,
  onChangeStatus,
}) => {
  const [, dragRef] = useDrag(() => ({
    type: "STORY",
    item: { id: story.id },
  }));

  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const statusName =
    story.status?.name || story.statusName || story.statusText || "Unknown";

  return (
    <div
      ref={dragRef}
      className="bg-white border rounded-lg shadow-sm p-3 mb-2 flex justify-between items-center hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold text-sm">{story.title}</span>

        {/* STATUS PILL */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStatusMenuOpen((x) => !x);
            }}
            className="px-2 py-1 text-xs rounded-md border bg-gray-50"
          >
            Status | <span className="font-bold">{statusName}</span> |
          </button>

          {statusMenuOpen && (
            <div className="absolute mt-2 bg-white border shadow rounded z-50 w-40">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => {
                    setStatusMenuOpen(false);
                    onChangeStatus(story.id, s.id);
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT MENU */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((x) => !x);
          }}
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 bg-white border shadow rounded w-44 z-50">
            {sprints.map((sp) => (
              <button
                key={sp.id}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                onClick={() => {
                  setMenuOpen(false);
                  onAddToSprint(story.id, sp.id);
                }}
              >
                Move to {sp.name}
              </button>
            ))}

            {onMoveToBacklog && (
              <button
                className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 text-sm"
                onClick={() => {
                  setMenuOpen(false);
                  onMoveToBacklog(story.id);
                }}
              >
                Move to Backlog
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCard;
