import React from 'react';
import { useDrop } from 'react-dnd';
import StoryCard from './StoryCard';

const SprintColumn = ({ sprint, stories, onDropStory, onChangeStatus, token }) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'STORY',
    drop: (item) => {
      // Pass token to parent handler if needed
      onDropStory(item.id, sprint.id, headers);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropRef}
      className={`border rounded-xl shadow p-4 transition ${
        isOver ? 'bg-pink-100' : 'bg-white'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-indigo-900">{sprint.name}</h3>
          <p className="text-sm text-gray-500">
            {sprint.startDate} → {sprint.endDate}
          </p>
        </div>

        {/* Sprint Status Actions */}
        {sprint.status === 'PLANNING' && (
          <button
            className="text-indigo-900 border border-indigo-900 px-2 py-1 rounded text-xs hover:bg-indigo-900 hover:text-white"
            onClick={() => onChangeStatus(sprint.id, 'start', headers)}
          >
            Start
          </button>
        )}

        {sprint.status === 'ACTIVE' && (
          <button
            className="text-pink-800 border border-pink-800 px-2 py-1 rounded text-xs hover:bg-pink-800 hover:text-white"
            onClick={() => onChangeStatus(sprint.id, 'complete', headers)}
          >
            Complete
          </button>
        )}
      </div>

      {/* Stories */}
      <div className="space-y-2 min-h-[100px]">
        {stories.length === 0 ? (
          <p className="text-gray-400 italic">No stories</p>
        ) : (
          stories.map((story) => <StoryCard key={story.id} story={story} />)
        )}
      </div>
    </div>
  );
};

export default SprintColumn;
