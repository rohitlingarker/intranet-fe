import React, { useEffect, useState } from 'react';
import api from '../../hooks/api';

const STATUSES = ['TO_DO', 'IN_PROGRESS', 'DONE'];

const UserBoard = () => {
  const [stories, setStories] = useState([]);
  const assigneeId = 1; // Replace with actual logged-in user ID

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get(`/stories/assignee/${assigneeId}`);
        setStories(res.data);
      } catch (err) {
        console.error('Error fetching stories', err);
      }
    };

    fetchStories();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Scrum Board</h1>

      <div className="flex gap-4">
        {STATUSES.map(status => (
          <div key={status} className="flex-1 bg-gray-100 p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-3">{status.replace('_', ' ')}</h2>

            {stories
              .filter(story => story.status === status)
              .map(story => (
                <div key={story.id} className="bg-white p-3 rounded shadow mb-3">
                  <h3 className="font-medium">{story.title}</h3>
                  <p className="text-sm text-gray-600">👤 {story.assignee}</p>
                  <p className="text-xs italic text-gray-500 text-right">Priority: {story.priority}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserBoard;
