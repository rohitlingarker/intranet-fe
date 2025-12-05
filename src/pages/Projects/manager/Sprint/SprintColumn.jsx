import React from "react";
import { useDrop } from "react-dnd";
import { ChevronDown, ChevronUp } from "lucide-react";
import StoryCard from "./StoryCard";

const SprintColumn = ({
  sprint,
  stories,
  onDropStory,
  onChangeStatus,
  onStoryClick,
  isExpanded,
  onToggleExpand,
  formatDateShort, // optional helper passed from parent
}) => {
  const isCompleted = sprint.status === "COMPLETED";

  /** ===============================
   *  DROP ZONE — Sprint Header (Always rendered)
   =============================== */
  const [{ isOverHeader }, dropHeaderRef] = useDrop(
    () => ({
      accept: "STORY",
      canDrop: () => !isCompleted,
      drop: (item) => {
        if (!isCompleted) {
          onDropStory(item.id, sprint.id);
        }
      },
      collect: (monitor) => ({
        isOverHeader: monitor.isOver() && !isCompleted,
      }),
    }),
    [isCompleted]
  );

  /** ===============================
   *  DROP ZONE — Expanded Content (for when expanded)
   =============================== */
  const [{ isOverContent }, dropContentRef] = useDrop(
    () => ({
      accept: "STORY",
      canDrop: () => !isCompleted,
      drop: (item) => {
        if (!isCompleted) {
          onDropStory(item.id, sprint.id);
        }
      },
      collect: (monitor) => ({
        isOverContent: monitor.isOver() && !isCompleted,
      }),
    }),
    [isCompleted]
  );

  const sortedStories = [...(stories || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="w-full">
      {/* HEADER (always present, acts as main drop zone) */}
      <div
        ref={dropHeaderRef}
        onClick={() => onToggleExpand?.(sprint.id)}
        role="button"
        tabIndex={0}
        className={`flex justify-between items-center px-6 py-4 rounded-2xl cursor-pointer
          border transition
          ${
            isOverHeader
              ? "bg-pink-100 border-pink-400"
              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          }
          ${isCompleted ? "opacity-70 cursor-not-allowed" : ""}
        `}
      >
        <div className="flex items-center gap-3">
          <div>
            <h3
              className={`text-base font-semibold ${
                isCompleted ? "text-gray-500" : "text-indigo-900"
              }`}
            >
              {sprint.name}
            </h3>

            {formatDateShort ? (
              <p className="text-sm text-gray-500">
                {formatDateShort(sprint.startDate)} – {formatDateShort(sprint.endDate)}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {sprint.startDate ? sprint.startDate.split("T")[0] : ""} –{" "}
                {sprint.endDate ? sprint.endDate.split("T")[0] : ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* actions */}
          {sprint.status === "PLANNING" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeStatus(sprint.id, "start");
              }}
              className="text-indigo-900 border border-indigo-900 px-2 py-1 rounded text-xs hover:bg-indigo-900 hover:text-white"
            >
              Start
            </button>
          )}

          {sprint.status === "ACTIVE" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeStatus(sprint.id, "complete");
              }}
              className="text-pink-800 border border-pink-800 px-2 py-1 rounded text-xs hover:bg-pink-800 hover:text-white"
            >
              Complete
            </button>
          )}

          <div className="text-gray-600">
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
      </div>

      {/* EXPANDED CONTENT (only when isExpanded) */}
      {isExpanded && (
        <div
          ref={dropContentRef}
          className={`border rounded-xl mt-3 p-4 transition ${
            isOverContent ? "bg-pink-100" : "bg-white"
          }`}
        >
          <div className="space-y-2 min-h-[100px]">
            {sortedStories.length === 0 ? (
              <p className="text-gray-400 italic">No stories</p>
            ) : (
              sortedStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  sprints={[]} // optional: pass sprints if StoryCard needs it
                  onAddToSprint={() => {}}
                  onClick={() => onStoryClick?.(story.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintColumn;
