import React, { useEffect, useState } from 'react';
import api from '../../hooks/api';

const UserBacklog = () => {
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const assigneeId = 1; // Replace with actual user ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storyRes, taskRes] = await Promise.all([
          api.get(`/stories/assignee/${assigneeId}`),
          api.get(`/tasks/assignee/${assigneeId}`),
        ]);
        setStories(storyRes.data);
        setTasks(taskRes.data);
      } catch (err) {
        console.error('Error fetching backlog data', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">User Backlog</h1>

      {stories.map(story => (
        <div key={story.id} className="mb-4">
          <h2 className="text-blue-600 font-semibold">{story.title}</h2>
          <ul className="ml-6 list-disc">
            {tasks
              .filter(task => task.storyId === story.id)
              .map(task => (
                <li key={task.id}>{task.title} ({task.status})</li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default UserBacklog;
