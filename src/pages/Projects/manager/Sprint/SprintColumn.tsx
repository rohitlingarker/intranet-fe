import React from 'react';
import { useDrop } from 'react-dnd';
import StoryCard from './StoryCard';

const SprintColumn = ({
  sprint,
  stories,
  onDropStory,
}: {
  sprint: any;
  stories: any[];
  onDropStory: (storyId: number, sprintId: number) => void;
}) => {
  const [, dropRef] = useDrop({
    accept: 'STORY',
    drop: (item: { id: number }) => onDropStory(item.id, sprint.id),
  });

  return (
    <div ref={dropRef} className="border rounded-xl shadow bg-white p-4">
      <h3 className="text-lg font-semibold text-blue-700 mb-1">{sprint.goal}</h3>
      <p className="text-sm text-gray-500 mb-2">
        {sprint.startDate} → {sprint.endDate}
      </p>
      <div className="space-y-2 min-h-[100px]">
        {stories.length === 0 ? (
          <p className="text-gray-400 italic">No stories</p>
        ) : (
          stories.map(story => <StoryCard key={story.id} story={story} />)
        )}
      </div>
    </div>
  );
};

export default SprintColumn;
