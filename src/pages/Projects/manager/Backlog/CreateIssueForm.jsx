import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify'; // ✅ Toastify
import 'react-toastify/dist/ReactToastify.css'; // ✅ Toastify CSS
 
import FormInput from '../../../../components/Forms/FormInput';
import FormDatePicker from '../../../../components/Forms/FormDatePicker';
import FormSelect from '../../../../components/Forms/FormSelect';
import FormTextArea from '../../../../components/Forms/FormTextArea';
 
const CreateIssueForm = ({ onClose, onCreated }) => {
  const [issueType, setIssueType] = useState('Epic');
  const [formData, setFormData] = useState({});
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
 
  useEffect(() => {
    axios.get('http://localhost:8080/api/projects').then((res) => setProjects(res.data.content || res.data || []));
    axios.get('http://localhost:8080/api/users').then((res) => setUsers(res.data.content || res.data || []));
    axios.get('http://localhost:8080/api/sprints').then((res) => setSprints(res.data.content || res.data || []));
  }, []);
 
  useEffect(() => {
    const projectId = formData.projectId;
    if (projectId) {
      axios.get(`http://localhost:8080/api/projects/${projectId}/epics`).then((res) => setEpics(res.data));
      axios.get(`http://localhost:8080/api/projects/${projectId}/stories`).then((res) => setStories(res.data));
      axios.get(`http://localhost:8080/api/projects/${projectId}/tasks`).then((res) => setTasks(res.data));
    } else {
      setEpics([]);
      setStories([]);
      setTasks([]);
    }
  }, [formData.projectId]);
 
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['storyPoints', 'progressPercentage'].includes(name) ? Number(value) : value,
    }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    let payload = {};
    const endpoint =
      issueType === 'Epic' ? '/api/epics' :
      issueType === 'User Story' ? '/api/stories' :
      '/api/tasks';
 
    if (issueType === 'Epic') {
      payload = {
        name: formData.name,
        description: formData.description,
        progressPercentage: formData.progressPercentage || 0,
        projectId: Number(formData.projectId),
        dueDate: formData.dueDate ? formData.dueDate + 'T00:00:00' : null,
      };
    } else if (issueType === 'User Story') {
      payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status || 'BACKLOG',
        priority: formData.priority || 'MEDIUM',
        storyPoints: Number(formData.storyPoints || 0),
        acceptanceCriteria: formData.acceptanceCriteria || '',
        epicId: Number(formData.epicId),
        reporterId: Number(formData.reporterId),
        assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
        projectId: Number(formData.projectId),
        sprintId: formData.sprintId ? Number(formData.sprintId) : null,
      };
    } else if (issueType === 'Task') {
      payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status || 'TODO',
        priority: formData.priority || 'MEDIUM',
        storyPoints: Number(formData.storyPoints || 0),
        acceptanceCriteria: formData.acceptanceCriteria || '',
        reporterId: Number(formData.reporterId),
        assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
        storyId: Number(formData.storyId),
        sprintId: formData.sprintId ? Number(formData.sprintId) : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        projectId: Number(formData.projectId),
      };
    }
 
    try {
      await axios.post(`http://localhost:8080${endpoint}`, payload);
      toast.success(`${issueType} created successfully`); // ✅ Toast success
      // onCreated?.();
      // onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(`Error creating ${issueType}`); // ✅ Toast error
    }
  };
 
  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <ToastContainer /> {/* ✅ Required for toast rendering */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create {issueType}</h2>
 
      <div className="mb-4">
        <FormSelect
          label="Issue Type"
          name="issueType"
          value={issueType}
          onChange={(e) => {
            setIssueType(e.target.value);
            setFormData({});
          }}
          options={[
            { label: 'Epic', value: 'Epic' },
            { label: 'User Story', value: 'User Story' },
            { label: 'Task', value: 'Task' },
          ]}
        />
      </div>
 
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Title"
          name={issueType === 'Epic' ? 'name' : 'title'}
          value={formData.title || formData.name || ''}
          onChange={handleChange}
          placeholder="Enter title"
          required
        />
 
        <FormTextArea
          label="Description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Enter description"
        />
 
        {(issueType === 'User Story' || issueType === 'Task') && (
          <>
            <FormSelect
              label="Status"
              name="status"
              value={formData.status || ''}
              onChange={handleChange}
              options={['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'].map((s) => ({ label: s, value: s }))}
            />
            <FormSelect
              label="Priority"
              name="priority"
              value={formData.priority || ''}
              onChange={handleChange}
              options={['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => ({ label: p, value: p }))}
            />
            <FormInput
              label="Story Points"
              name="storyPoints"
              type="number"
              value={formData.storyPoints || ''}
              onChange={handleChange}
            />
          </>
        )}
 
        {issueType === 'Epic' && (
          <FormInput
            label="Progress %"
            name="progressPercentage"
            type="number"
            value={formData.progressPercentage || ''}
            onChange={handleChange}
          />
        )}
 
        {issueType !== 'Epic' && (
          <FormTextArea
            label="Acceptance Criteria"
            name="acceptanceCriteria"
            value={formData.acceptanceCriteria || ''}
            onChange={handleChange}
            placeholder="Define acceptance criteria"
          />
        )}
 
        <FormSelect
          label="Project"
          name="projectId"
          value={formData.projectId || ''}
          onChange={handleChange}
          options={projects.map((p) => ({ label: p.name, value: p.id }))}
          required
        />
 
        {issueType === 'User Story' && (
          <FormSelect
            label="Epic"
            name="epicId"
            value={formData.epicId || ''}
            onChange={handleChange}
            options={epics.map((e) => ({ label: e.name, value: e.id }))}
            required
          />
        )}
 
        {(issueType === 'User Story' || issueType === 'Task') && (
          <>
            <FormSelect
              label="Reporter"
              name="reporterId"
              value={formData.reporterId || ''}
              onChange={handleChange}
              options={users.map((u) => ({ label: u.name, value: u.id }))}
              required
            />
            <FormSelect
              label="Assignee"
              name="assigneeId"
              value={formData.assigneeId || ''}
              onChange={handleChange}
              options={users.map((u) => ({ label: u.name, value: u.id }))}
            />
          </>
        )}
 
        {issueType === 'Task' && (
          <>
            <FormSelect
              label="User Story"
              name="storyId"
              value={formData.storyId || ''}
              onChange={handleChange}
              options={stories.map((s) => ({ label: s.title, value: s.id }))}
              required
            />
            <FormSelect
              label="Sprint"
              name="sprintId"
              value={formData.sprintId || ''}
              onChange={handleChange}
              options={sprints.map((s) => ({ label: s.name, value: s.id }))}
            />
            <FormDatePicker
              label="Due Date"
              name="dueDate"
              value={formData.dueDate || ''}
              onChange={handleChange}
            />
          </>
        )}
 
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Create {issueType}
          </button>
        </div>
      </form>
    </div>
  );
};
 
export default CreateIssueForm;