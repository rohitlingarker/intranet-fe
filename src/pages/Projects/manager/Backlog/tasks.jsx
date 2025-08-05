import React, { useEffect, useState } from "react";
import axios from "axios";

const CreateTaskModal = ({ onTaskCreated }) => {
  const [showForm, setShowForm] = useState(true);

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: 0,
    dueDate: "",
    projectId: "",
    reporterId: "",
    assigneeId: "",
    storyId: "",
    sprintId: "",
  });

  useEffect(() => {
    axios.get("http://localhost:8080/api/users").then((res) => setUsers(res.data.content || []));
    axios.get("http://localhost:8080/api/projects").then((res) => setProjects(res.data.content || []));
    axios.get("http://localhost:8080/api/stories").then((res) => setStories(res.data.content || []));
    axios.get("http://localhost:8080/api/sprints").then((res) => setSprints(res.data.content || []));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        storyPoints: Number(formData.storyPoints),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        assigneeId: formData.assigneeId || null,
        sprintId: formData.sprintId || null,
        storyId: formData.storyId || null,
      };
      await axios.post("http://localhost:8080/api/tasks", payload);
      alert("✅ Task created successfully");
      onTaskCreated && onTaskCreated();
      setFormData({
        title: "",
        description: "",
        status: "BACKLOG",
        priority: "MEDIUM",
        storyPoints: 0,
        dueDate: "",
        projectId: "",
        reporterId: "",
        assigneeId: "",
        storyId: "",
        sprintId: "",
      });
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create task", err);
      alert("❌ Error creating task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="relative space-y-6 max-w-3xl mx-auto mt-10 p-6 border border-gray-200 rounded-xl shadow-lg bg-white"
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl font-bold"
        title="Close form"
      >
        ×
      </button>

      <h2 className="text-2xl font-bold text-center text-gray-800">Create New Task</h2>

      {/* Task Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">📝 Task Details</h3>
        <input
          name="title"
          placeholder="Title *"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2 focus:outline-blue-500"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded px-4 py-2 resize-none focus:outline-blue-500"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
          >
            {["BACKLOG", "TODO", "IN_PROGRESS", "DONE"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
          >
            {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="storyPoints"
            type="number"
            value={formData.storyPoints}
            onChange={handleChange}
            placeholder="Story Points"
            className="w-full border rounded px-4 py-2"
          />

          <input
            type="datetime-local"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
          />
        </div>
      </div>

      {/* Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">👤 Assignment</h3>

        <select
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2"
        >
          <option value="">Select Project *</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          name="reporterId"
          value={formData.reporterId}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2"
        >
          <option value="">Select Reporter *</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          name="assigneeId"
          value={formData.assigneeId}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        >
          <option value="">Select Assignee (Optional)</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Planning Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">📅 Planning (Optional)</h3>

        <select
          name="storyId"
          value={formData.storyId}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        >
          <option value="">Select Story</option>
          {stories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>

        <select
          name="sprintId"
          value={formData.sprintId}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        >
          <option value="">Select Sprint</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
};

export default CreateTaskModal;
