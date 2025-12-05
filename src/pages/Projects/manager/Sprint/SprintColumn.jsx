// FULL UPDATED SprintColumn.jsx

import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { ChevronRight, ChevronDown, MoreVertical } from "lucide-react";
import StoryCard from "./StoryCard";

const SprintColumn = ({
  sprint,
  stories,
  statuses,
  onDropStory,
  onChangeStatus,
  onEditSprint,
  onDeleteSprint,
  onChangeStoryStatus,
}) => {
  const [expand, setExpand] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "STORY",
    drop: (item) => onDropStory(item.id, sprint.id),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  return (
    <div className="border bg-white rounded-xl shadow-sm">
      {/* HEADER */}
      <div
        ref={dropRef}
        onClick={() => setExpand((e) => !e)}
        className={`px-5 py-3 flex justify-between items-center cursor-pointer ${
          isOver ? "bg-blue-50" : "bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-3">
          {expand ? <ChevronDown /> : <ChevronRight />}
          <h3 className="font-semibold text-gray-900">{sprint.name}</h3>
          <span className="text-sm text-gray-500">
            {sprint.startDateReadable} – {sprint.endDateReadable}
          </span>
          <span className="text-sm text-gray-500">
            ({stories.length} work items)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* ALWAYS SHOW BUTTON (AS YOU REQUESTED) */}
          {sprint.status !== "COMPLETED" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeStatus(
                  sprint.id,
                  sprint.status === "ACTIVE" ? "complete" : "start"
                );
              }}
              className="px-4 py-1 border rounded-lg text-sm text-green-700 border-green-700 hover:bg-green-50"
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
                className="absolute right-0 bg-white border shadow rounded w-40"
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

      {/* EXPANDED STORY LIST */}
      {expand && (
        <div className="p-4">
          {stories.length === 0 ? (
            <p className="text-gray-400">No stories</p>
          ) : (
            stories.map((st) => (
              <StoryCard
                key={st.id}
                story={st}
                statuses={statuses}
                sprints={[]} // no sprint move inside sprint
                onChangeStatus={onChangeStoryStatus} // FIXED
                onAddToSprint={() => {}}
                onMoveToBacklog={() => {}}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SprintColumn;
