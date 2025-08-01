import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import StoryCard from './StoryCard'; // Reusable card component
import CreateSprintModal from './CreateSprintModal';
import SprintColumn from './SprintColumn'; // Column component for each sprint


interface Story {
  id: number;
  title: string;
  status: string;
  sprintId?: number | null;
}

interface Sprint {
  id: number;
  goal: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  startDate: string;
  endDate: string;
}

const SprintBoard: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprintId, setActiveSprintId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PLANNED' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.get(`/api/projects/${projectId}/stories`).then(res => setStories(res.data));
    axios.get(`/api/projects/${projectId}/sprints`).then(res => setSprints(res.data));
  }, [projectId]);

  const handleDropStory = (storyId: number, sprintId: number) => {
    axios
      .put(`/api/stories/${storyId}/assign-sprint`, { sprintId })
      .then(() => {
        setStories(prev =>
          prev.map(s => (s.id === storyId ? { ...s, sprintId } : s))
        );
      })
      .catch(console.error);
  };

  const filteredSprints = filter === 'ALL' ? sprints : sprints.filter(s => s.status === filter);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Sprint Planning</h2>
          <button
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
            onClick={() => setShowModal(true)}
          >
            + Create Sprint
          </button>
        </div>

        <div className="flex gap-4">
          {['ALL', 'PLANNED', 'ACTIVE', 'COMPLETED'].map(type => (
            <button
              key={type}
              className={`px-4 py-1 rounded ${
                filter === type ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => setFilter(type as any)}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSprints.map(sprint => (
            <SprintColumn
              key={sprint.id}
              sprint={sprint}
              stories={stories.filter(story => story.sprintId === sprint.id)}
              onDropStory={handleDropStory}
            />
          ))}
        </div>

        <CreateSprintModal
          projectId={projectId}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onCreated={(newSprint) => setSprints(prev => [...prev, newSprint])}
        />
      </div>
    </DndProvider>
  );
};

export default SprintBoard;
