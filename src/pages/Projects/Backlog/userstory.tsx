import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CreateUserStory: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [storyPoints, setStoryPoints] = useState(3);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [epicId, setEpicId] = useState<number | null>(null);
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [reporterId, setReporterId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [sprintId, setSprintId] = useState<number | null>(null);

  const [epics, setEpics] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/epics')
      .then((res) => {
        const data = res.data?.content ?? res.data;
        setEpics(Array.isArray(data) ? data : []);
      });

    axios.get('http://localhost:8080/api/users')
      .then((res) => {
        const data = res.data?.content ?? res.data;
        setUsers(Array.isArray(data) ? data : []);
      });

    axios.get('http://localhost:8080/api/projects')
      .then((res) => {
        const data = res.data?.content ?? res.data;
        setProjects(Array.isArray(data) ? data : []);
      });

     axios.get('http://localhost:8080/api/sprints')
    .then((res) => {
      console.log("SPRINTS API RESPONSE:", res.data);
      const data = res.data?.content ?? res.data;
      if (Array.isArray(data)) {
        setSprints(data);
      } else {
        console.warn('Sprints response is not an array:', data);
        setSprints([]);
      }
    })
    .catch((err) => {
      console.error('Failed to load sprints:', err);
      setSprints([]);
    });
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      description,
      status,
      priority,
      storyPoints,
      acceptanceCriteria,
      epicId,
      assigneeId,
      reporterId,
      projectId,
      sprintId,
    };

    try {
      await axios.post('http://localhost:8080/api/stories', payload);
      alert('Story created successfully!');
    } catch (error) {
      console.error('Error creating story:', error);
      alert('Failed to create story');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Create User Story</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border p-2"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border p-2"
          required
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border p-2"
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border p-2"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <input
          type="number"
          value={storyPoints}
          onChange={(e) => setStoryPoints(Number(e.target.value))}
          placeholder="Story Points"
          className="w-full border p-2"
        />

        <input
          value={acceptanceCriteria}
          onChange={(e) => setAcceptanceCriteria(e.target.value)}
          placeholder="Acceptance Criteria"
          className="w-full border p-2"
        />

        <select
          value={epicId ?? ''}
          onChange={(e) => setEpicId(Number(e.target.value))}
          className="w-full border p-2"
        >
          <option value="">Select Epic</option>
          {epics.length > 0 ? (
            epics.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.name}
              </option>
            ))
          ) : (
            <option disabled>No epics available</option>
          )}
        </select>

        <select
          value={assigneeId ?? ''}
          onChange={(e) => setAssigneeId(Number(e.target.value))}
          className="w-full border p-2"
        >
          <option value="">Select Assignee</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={reporterId ?? ''}
          onChange={(e) => setReporterId(Number(e.target.value))}
          className="w-full border p-2"
        >
          <option value="">Select Reporter</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={projectId ?? ''}
          onChange={(e) => setProjectId(Number(e.target.value))}
          className="w-full border p-2"
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          value={sprintId ?? ''}
          onChange={(e) => setSprintId(Number(e.target.value))}
          className="w-full border p-2"
        >
          <option value="">Select Sprint</option>
          {sprints.length > 0 ? (
            sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))
          ) : (
            <option disabled>No sprints available</option>
          )}
        </select>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Story
        </button>
      </form>
    </div>
  );
};

export default CreateUserStory;
