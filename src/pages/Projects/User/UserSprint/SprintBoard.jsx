import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StoryCard from './StoryCard';
import SprintColumn from './SprintColumn';
import Button from '../../../../components/Button/Button';

const SprintBoard = ({ projectId, projectName }) => {
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [filter, setFilter] = useState('ALL');

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

  const filteredSprints =
    filter === 'ALL'
      ? sprints
      : sprints.filter(s => s.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-indigo-900">
          Sprint Planning of {projectName}
        </h2>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSprints.map(sprint => (
          <div
            key={sprint.id}
            className="bg-white rounded-2xl shadow p-6"
          >
            <SprintColumn
              sprint={sprint}
              stories={stories.filter(story => story.sprintId === sprint.id)}
              onChangeStatus={handleStatusChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SprintBoard;
