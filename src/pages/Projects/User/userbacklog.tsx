import React, { useEffect, useState } from 'react';
import { Epic, Story, Task } from '../../types';
 
const UserBacklog = () => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
 
  useEffect(() => {
    // Fetch your actual data here
  }, []);
 
  return (
<div className="p-6">
<h1 className="text-xl font-bold mb-4">Backlog</h1>
      {epics.map(epic => (
<div key={epic.id}>
<h2 className="font-semibold text-blue-600">{epic.name}</h2>
          {stories
            .filter(story => story.epicId === epic.id)
            .map(story => (
<div key={story.id} className="ml-4">
<h3>{story.title}</h3>
<ul className="ml-4 list-disc">
                  {tasks
                    .filter(task => task.storyId === story.id)
                    .map(task => (
<li key={task.id}>{task.title} ({task.status})</li>
                    ))}
</ul>
</div>
            ))}
</div>
      ))}
</div>
  );
};
 
export default UserBacklog;