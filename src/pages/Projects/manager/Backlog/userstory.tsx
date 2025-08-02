import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CreateUserStory: React.FC = () => {
  const [showForm, setShowForm] = useState(true);

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
      .then((res) => setEpics(res.data?.content ?? res.data ?? []));
    axios.get('http://localhost:8080/api/users')
      .then((res) => setUsers(res.data?.content ?? res.data ?? []));
    axios.get('http://localhost:8080/api/projects')
      .then((res) => setProjects(res.data?.content ?? res.data ?? []));
    axios.get('http://localhost:8080/api/sprints')
      .then((res) => setSprints(res.data?.content ?? res.data ?? []))
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
      alert('✅ User story created successfully!');
      setShowForm(false); // optionally hide form on success
    } catch (error) {
      console.error('Error creating story:', error);
      alert('❌ Failed to create story.');
    }
  };

  if (!showForm) return null;

  return (
    <div className="relative max-w-2xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-lg">
      {/* Close Button */}
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl font-bold"
        title="Close form"
      >
        ×
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Create New User Story</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <input
          type="number"
          placeholder="Story Points"
          value={storyPoints}
          onChange={(e) => setStoryPoints(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        />

        <textarea
          placeholder="Acceptance Criteria"
          value={acceptanceCriteria}
          onChange={(e) => setAcceptanceCriteria(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <select
          value={epicId ?? ''}
          onChange={(e) => setEpicId(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select Epic</option>
          {epics.map((epic) => (
            <option key={epic.id} value={epic.id}>
              {epic.name}
            </option>
          ))}
        </select>

        <select
          value={assigneeId ?? ''}
          onChange={(e) => setAssigneeId(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Assign To</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={reporterId ?? ''}
          onChange={(e) => setReporterId(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Reporter</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={projectId ?? ''}
          onChange={(e) => setProjectId(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select Project</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.name}
            </option>
          ))}
        </select>

        <select
          value={sprintId ?? ''}
          onChange={(e) => setSprintId(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Assign to Sprint</option>
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow"
          >
            Create User Story
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserStory;
