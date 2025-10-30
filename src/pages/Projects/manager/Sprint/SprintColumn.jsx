import React from 'react';
import { useDrop } from 'react-dnd';
import StoryCard from './StoryCard';

const SprintColumn = ({ sprint, stories, onDropStory, onChangeStatus }) => {
  const isCompleted = sprint.status === 'COMPLETED';

  // Only enable drop if sprint is not completed
  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: 'STORY',
      canDrop: () => !isCompleted,
      drop: (item) => {
        if (!isCompleted) {
          console.log('Dropped story:', item.id, 'in sprint:', sprint.id);
          onDropStory(item.id, sprint.id);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver() && !isCompleted,
      }),
    }),
    [isCompleted]
  );

  // Sort stories by createdAt descending (latest first)
  const sortedStories = [...stories].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div
      ref={dropRef}
      className={`border rounded-xl shadow p-4 transition ${
        isOver ? 'bg-pink-100' : isCompleted ? 'bg-gray-100' : 'bg-white'
      } ${isCompleted ? 'opacity-90 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3
            className={`text-lg font-semibold ${
              isCompleted ? 'text-gray-600' : 'text-indigo-900'
            }`}
          >
            {sprint.name}
          </h3>
          <p
            className={`text-sm ${
              isCompleted ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {sprint.startDate} → {sprint.endDate}
          </p>
        </div>

        {/* Sprint Status Actions */}
        {sprint.status === 'PLANNING' && (
          <button
            className="text-indigo-900 border border-indigo-900 px-2 py-1 rounded text-xs hover:bg-indigo-900 hover:text-white"
            onClick={() => onChangeStatus(sprint.id, 'start')}
          >
            Start
          </button>
        )}

        {sprint.status === 'ACTIVE' && (
          <button
            className="text-pink-800 border border-pink-800 px-2 py-1 rounded text-xs hover:bg-pink-800 hover:text-white"
            onClick={() => onChangeStatus(sprint.id, 'complete')}
          >
            Complete
          </button>
        )}
      </div>

      {/* Stories */}
      <div className="space-y-2 min-h-[100px]">
        {sortedStories.length === 0 ? (
          <p className="text-gray-400 italic">No stories</p>
        ) : (
          sortedStories.map((story) => (
            <StoryCard key={story.id} story={story} isCompleted={isCompleted} />
          ))
        )}
      </div>
    </div>
  );
};

export default SprintColumn;
