import React from 'react';
import StoryCard from './StoryCard';

const SprintColumn = ({ sprint, stories }) => {
  return (
    <div className="border rounded-xl shadow p-4 bg-white transition">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-indigo-900">{sprint.name}</h3>
          <p className="text-sm text-gray-500">
            {sprint.startDate} → {sprint.endDate}
          </p>
        </div>
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
