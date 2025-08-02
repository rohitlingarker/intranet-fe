import React from 'react';
import { useDrop } from 'react-dnd';
import StoryCard from './StoryCard';

interface SprintColumnProps {
  sprint: any;
  stories: any[];
  onDropStory: (storyId: number, sprintId: number) => void;
  onChangeStatus: (sprintId: number, action: 'start' | 'complete') => void;
}

const SprintColumn: React.FC<SprintColumnProps> = ({
  sprint,
  stories,
  onDropStory,
  onChangeStatus,
}) => {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'STORY',
    drop: (item: { id: number }) => onDropStory(item.id, sprint.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropRef}
      className={`border rounded-xl shadow p-4 transition ${
        isOver ? 'bg-blue-100' : 'bg-white'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-blue-700">{sprint.goal}</h3>
          <p className="text-sm text-gray-500">
            {sprint.startDate} → {sprint.endDate}
          </p>
        </div>

        {/* Sprint Status Actions */}
        {sprint.status === 'PLANNING' && (
          <button
            className="text-green-700 border border-green-600 px-2 py-1 rounded text-xs hover:bg-green-600 hover:text-white"
            onClick={() => onChangeStatus(sprint.id, 'start')}
          >
            Start
          </button>
        )}

        {sprint.status === 'ACTIVE' && (
          <button
            className="text-gray-700 border border-gray-600 px-2 py-1 rounded text-xs hover:bg-gray-700 hover:text-white"
            onClick={() => onChangeStatus(sprint.id, 'complete')}
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
