import React, { useEffect, useState } from 'react';
 
const STATUSES = ['TO_DO', 'IN_PROGRESS', 'DONE'];
 
const UserBoard = () => {

  const [activeSprint, setActiveSprint] = useState(null);

  const [stories, setStories] = useState([]);

  const [sprints, setSprints] = useState([]);
 
  useEffect(() => {

    const sampleSprints = [

      { id: 1, name: 'Sprint 1', status: 'ACTIVE' },

      { id: 2, name: 'Sprint 2', status: 'PLANNED' },

    ];

    const sampleStories = [

      { id: 101, title: 'Login UI', status: 'TO_DO', assignee: 'Ruchitha', priority: 'HIGH', sprintId: 1 },

      { id: 102, title: 'Password Reset', status: 'IN_PROGRESS', assignee: 'Asha', priority: 'MEDIUM', sprintId: 1 },

      { id: 103, title: 'Database Setup', status: 'DONE', assignee: 'Ruchitha', priority: 'LOW', sprintId: 1 },

    ];
 
    setSprints(sampleSprints);

    setActiveSprint(sampleSprints[0]);

    setStories(sampleStories);

  }, []);
 
  return (
<div className="p-6">
<h1 className="text-2xl font-bold mb-4">Scrum Board</h1>
 
      <div className="mb-4">
<label className="mr-2 font-medium">Sprint:</label>
<select

          className="p-2 border rounded"

          value={activeSprint?.id || ''}

          onChange={e => {

            const selectedId = parseInt(e.target.value);

            const selectedSprint = sprints.find(s => s.id === selectedId);

            setActiveSprint(selectedSprint || null);

          }}
>

          {sprints.map(sprint => (
<option key={sprint.id} value={sprint.id}>

              {sprint.name} ({sprint.status})
</option>

          ))}
</select>
</div>
 
      <div className="flex gap-4">

        {STATUSES.map(status => (
<div key={status} className="flex-1 bg-gray-100 p-4 rounded shadow">
<h2 className="text-lg font-semibold mb-3">

              {status.replace('_', ' ')}
</h2>
 
            {stories

              .filter(story => story.status === status && story.sprintId === activeSprint?.id)

              .map(story => (
<div key={story.id} className="bg-white p-3 rounded shadow mb-3">
<h3 className="font-medium">{story.title}</h3>
<p className="text-sm text-gray-600">👤 {story.assignee}</p>
<p className="text-xs text-right text-gray-500 italic">Priority: {story.priority}</p>
</div>

              ))}
</div>

        ))}
</div>
</div>

  );

};
 
export default UserBoard;

 