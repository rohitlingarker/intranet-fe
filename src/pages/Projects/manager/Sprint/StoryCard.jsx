import React from 'react';
import { useDrag } from 'react-dnd';

const StoryCard = ({ story, onOpen }) => {
  const [, dragRef] = useDrag({
    type: 'STORY',
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
      <p className="text-sm font-semibold text-indigo-900">{story.title}</p>
      <p className="text-xs text-pink-800">Status: {story.status}</p>
    </div>
  );
};

export default StoryCard;
