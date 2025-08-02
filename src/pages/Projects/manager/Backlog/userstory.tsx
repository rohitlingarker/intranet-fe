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
      epicId: epicId || null,
      assigneeId: assigneeId || null,
      reporterId,
      projectId,
      sprintId: sprintId || null,
    };

    try {
      await axios.post('http://localhost:8080/api/stories', payload);
      alert('✅ User story created successfully!');
    } catch (error) {
      console.error('Error creating story:', error);
      alert('❌ Failed to create story.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Create New User Story</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter user story title"
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            className="w-full border px-3 py-2 rounded-md h-24 resize-none"
            required
          />
        </div>

        {/* Status & Priority */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block font-semibold mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
          <div className="w-1/2">
            <label className="block font-semibold mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
        </div>

        {/* Story Points & Criteria */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block font-semibold mb-1">Story Points</label>
            <input
              type="number"
              value={storyPoints}
              onChange={(e) => setStoryPoints(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div className="w-1/2">
            <label className="block font-semibold mb-1">Acceptance Criteria</label>
            <input
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
        </div>

        {/* Epic, Project, Sprint */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Epic (optional)</label>
            <select
              value={epicId ?? ''}
              onChange={(e) =>
                setEpicId(e.target.value === '' ? null : Number(e.target.value))
              }
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">Select Epic</option>
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>{epic.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Project</label>
            <select
              value={projectId ?? ''}
              onChange={(e) =>
                setProjectId(e.target.value === '' ? null : Number(e.target.value))
              }
              className="w-full border px-3 py-2 rounded-md"
              required
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Sprint (optional)</label>
            <select
              value={sprintId ?? ''}
              onChange={(e) =>
                setSprintId(e.target.value === '' ? null : Number(e.target.value))
              }
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">Select Sprint</option>
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignee & Reporter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Assignee</label>
            <select
              value={assigneeId ?? ''}
              onChange={(e) =>
                setAssigneeId(e.target.value === '' ? null : Number(e.target.value))
              }
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">Select Assignee</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Reporter</label>
            <select
              value={reporterId ?? ''}
              onChange={(e) =>
                setReporterId(e.target.value === '' ? null : Number(e.target.value))
              }
              className="w-full border px-3 py-2 rounded-md"
              required
            >
              <option value="">Select Reporter</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="text-center pt-4">
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
