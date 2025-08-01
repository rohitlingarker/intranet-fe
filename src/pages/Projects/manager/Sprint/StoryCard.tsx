import React from 'react';
import { useDrag } from 'react-dnd';

const StoryCard = ({ story }: { story: any }) => {
  const [, dragRef] = useDrag({
    type: 'STORY',
    item: { id: story.id },
  });

  return (
    <div
      ref={dragRef}
      className="bg-slate-100 p-3 rounded shadow-sm border hover:shadow-md cursor-move"
    >
      <p className="text-sm font-medium text-gray-800">{story.title}</p>
      <p className="text-xs text-gray-500">Status: {story.status}</p>
    </div>
  );
};

export default StoryCard;
