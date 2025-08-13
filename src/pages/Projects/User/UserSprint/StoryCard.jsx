import React from 'react';

const StoryCard = ({ story }) => {
  return (
    <div className="bg-white p-3 rounded shadow-sm border hover:shadow-md">
      <p className="text-sm font-semibold text-indigo-900">{story.title}</p>
      <p className="text-xs text-pink-800">Status: {story.status}</p>
    </div>
  );
};

export default StoryCard;
