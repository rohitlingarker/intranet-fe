import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CreateUserStory = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [storyPoints, setStoryPoints] = useState(1);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');

  const [epicId, setEpicId] = useState(null);
  const [reporterId, setReporterId] = useState(null);
  const [assigneeId, setAssigneeId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [sprintId, setSprintId] = useState(null);

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [epics, setEpics] = useState([]);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, projectsRes, sprintsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/sprints`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setUsers(usersRes.data?.content ?? usersRes.data ?? []);
        setProjects(projectsRes.data?.content ?? projectsRes.data ?? []);
        setSprints(sprintsRes.data?.content ?? sprintsRes.data ?? []);
      } catch (err) {
        console.error('Failed to fetch users, projects, or sprints:', err);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (projectId) {
      axios
        .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setEpics(res.data?.content ?? res.data ?? []))
        .catch((err) => {
          console.error('Failed to load epics for project:', err);
          setEpics([]);
        });
    } else {
      setEpics([]);
    }
  }, [projectId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title,
        description,
        status,
        priority,
        storyPoints: Number(storyPoints),
        acceptanceCriteria,
        epicId,
        reporterId,
        assigneeId,
        projectId,
      };

      if (sprintId) {
        payload.sprintId = sprintId;
      }

      console.log('Submitting story:', payload);

      const response = await axios.post(`${import.meta.env.VITE_PMS_BASE_URL}/api/stories`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Story created:', response.data);
      onClose();
    } catch (error) {
      console.error('Error creating story:', error);
      alert(error?.response?.data?.message ?? 'Failed to create story');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create User Story</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <textarea
          placeholder="Acceptance Criteria"
          value={acceptanceCriteria}
          onChange={(e) => setAcceptanceCriteria(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>

        <input
          type="number"
          placeholder="Story Points"
          value={storyPoints}
          onChange={(e) => setStoryPoints(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        />

        <select
          value={projectId ?? ''}
          onChange={(e) => setProjectId(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={epicId ?? ''}
          onChange={(e) => setEpicId(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select Epic</option>
          {epics.map((epic) => (
            <option key={epic.id} value={epic.id}>
              {epic.name}
            </option>
          ))}
        </select>

        <select
          value={reporterId ?? ''}
          onChange={(e) => setReporterId(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select Reporter</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={assigneeId ?? ''}
          onChange={(e) => setAssigneeId(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select Assignee</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={sprintId ?? ''}
          onChange={(e) => setSprintId(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Sprint (optional)</option>
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserStory;
