import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import StoryCard from './StoryCard';
import CreateSprintModal from './CreateSprintModal';
import SprintColumn from './SprintColumn';
import Button from '../../../../components/Button/Button';

const SprintBoard = ({ projectId, projectName }) => {
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [filter, setFilter] = useState('ALL');
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

  const handleDropStory = async (storyId, sprintId) => {
    try {
      await axios.put(`http://localhost:8080/api/stories/${storyId}/assign-sprint`, { sprintId });
      await fetchStories();
    } catch (err) {
      console.error('Error assigning story to sprint:', err);
    }
  };

  const handleStatusChange = async (sprintId, action) => {
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
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-indigo-900">
            Sprint Planning of {projectName}
          </h2>
          <Button
            className="bg-indigo-900 text-white rounded hover:bg-indigo-800 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            + Create Sprint
          </Button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3">
          {['ALL', 'PLANNING', 'ACTIVE', 'COMPLETED'].map(type => (
            <button
              key={type}
              className={`px-4 py-1 rounded transition ${
                filter === type
                  ? 'bg-pink-800 text-white'
                  : 'bg-white text-gray-800 border'
              }`}
              onClick={() => setFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sprint Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSprints.map(sprint => (
            <div
              key={sprint.id}
              className="bg-white rounded-2xl shadow p-6"
            >
              <SprintColumn
                sprint={sprint}
                stories={stories.filter(story => story.sprintId === sprint.id)}
                onDropStory={handleDropStory}
                onChangeStatus={handleStatusChange}
              />
            </div>
          ))}
        </div>

        {/* Modal */}
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
