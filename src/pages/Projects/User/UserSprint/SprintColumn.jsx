import React from 'react';
import StoryCard from './StoryCard';

const SprintColumn = ({ sprint, stories }) => {
  const isCompleted = sprint.status === 'COMPLETED';

  // Sort stories by createdAt descending (latest first)
  const sortedStories = [...stories].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div
      className={`border rounded-xl shadow p-4 transition ${
        isCompleted ? 'bg-gray-100' : 'bg-white'
      } ${isCompleted ? 'opacity-90 cursor-not-allowed' : 'cursor-default'}`}
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
