import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import StoryCard from './StoryCard';
import CreateSprintModal from './CreateSprintModal';
import SprintColumn from './SprintColumn';

interface Story {
  id: number;
  title: string;
  status: string;
  sprintId?: number | null;
}

interface Sprint {
  id: number;
  goal: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  startDate: string;
  endDate: string;
}

const SprintBoard: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PLANNING' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [showModal, setShowModal] = useState(false);

  const fetchStories = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/projects/${projectId}/stories`);
      setStories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load stories:', err);
      setStories([]);
    }
  };

  const fetchSprints = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/projects/${projectId}/sprints`);
      setSprints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load sprints:', err);
      setSprints([]);
    }
  };

  useEffect(() => {
    fetchStories();
    fetchSprints();
  }, [projectId]);

  const handleDropStory = async (storyId: number, sprintId: number) => {
    try {
      await axios.put(`http://localhost:8080/api/stories/${storyId}/assign-sprint`, { sprintId });
      await fetchStories();
    } catch (err) {
      console.error('Error assigning story to sprint:', err);
    }
  };

  const handleStatusChange = async (sprintId: number, action: 'start' | 'complete') => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/sprints/${sprintId}/${action}`
      );
      const updatedSprint = response.data;

      setSprints(prev =>
        prev.map(s => (s.id === sprintId ? updatedSprint : s))
      );

      await fetchStories();
    } catch (error) {
      console.error(`Failed to ${action} sprint:`, error);
    }
  };

  const filteredSprints = filter === 'ALL'
    ? sprints
    : sprints.filter(s => s.status === filter);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Sprint Planning</h2>
          <button
            className="px-4 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-800"
            onClick={() => setShowModal(true)}
          >
            + Create Sprint
          </button>
        </div>

        <div className="flex gap-4">
          {['ALL', 'PLANNING', 'ACTIVE', 'COMPLETED'].map(type => (
            <button
              key={type}
              className={`px-4 py-1 rounded ${
                filter === type
                  ? 'bg-pink-800 text-white'
                  : 'bg-gray-100 text-gray-800'
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
              onChangeStatus={handleStatusChange}
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
