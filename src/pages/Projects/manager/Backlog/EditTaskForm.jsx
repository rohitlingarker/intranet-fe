import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";

import FormInput from "../../../../components/forms/FormInput";
import FormSelect from "../../../../components/forms/FormSelect";
import FormTextArea from "../../../../components/forms/FormTextArea";

const EditTaskForm = ({ taskId, projectId, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    storyId: "",
    priority: "MEDIUM",
    status: "BACKLOG",
    sprintId: "",
    assigneeId: "",
    reporterId: "",
    isBillable: "false",
  });
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!taskId || !projectId) return null;

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // ---------- Fetch Data ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, userRes, storyRes, sprintRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/members-with-owner`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`, axiosConfig),
        ]);

        const task = taskRes.data;
        const allUsers = userRes.data.content || userRes.data || [];

        setUsers(allUsers);
        setStories(storyRes.data || []);
        setSprints(sprintRes.data || []);

        setFormData({
          title: task.title || "",
          description: task.description || "",
          storyId: task.story?.id || "",
          priority: task.priority || "MEDIUM",
          status: task.status || "BACKLOG",
          sprintId: task.sprint?.id || "",
          assigneeId: task.assigneeId || "",
          reporterId: task.reporterId || "",
          isBillable: task.billable ? "true" : "false",
        });
      } catch (error) {
        console.error("Error loading task data:", error);
        toast.error("Failed to load task details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, projectId]);

  // ---------- Handle Input Change ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title,
      description: formData.description || "",
      priority: formData.priority || "MEDIUM",
      status: formData.status || "BACKLOG",
      projectId: Number(projectId),
      reporterId: formData.reporterId ? Number(formData.reporterId) : null,
      assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
      storyId: formData.storyId || null,
      sprintId: formData.sprintId || null,
      billable: formData.isBillable === "true",
    };

    try {
      await axios.put(`${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}`, payload, axiosConfig);
      toast.success("Task updated successfully!");
      setTimeout(() => {
        onUpdated?.();
        onClose?.();
      }, 600);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(error.response?.data?.message || "Failed to update task.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-500">Loading task details...</p>
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className="relative bg-white rounded-xl shadow-md p-6">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
        Edit Task
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Description */}
        <FormInput
          label="Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <FormTextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        {/* Story & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Story *"
            name="storyId"
            value={formData.storyId}
            onChange={handleChange}
            options={stories.map((s) => ({ label: s.title, value: s.id }))}
          />
          <FormSelect
            label="Priority *"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={[
              { label: "Low", value: "LOW" },
              { label: "Medium", value: "MEDIUM" },
              { label: "High", value: "HIGH" },
              { label: "Critical", value: "CRITICAL" },
            ]}
          />
        </div>

        {/* Status & Sprint */}
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Status *"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { label: "Backlog", value: "BACKLOG" },
              { label: "To Do", value: "TODO" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Done", value: "DONE" },
              { label: "Closed", value: "CLOSED" },
            ]}
          />
          <FormSelect
            label="Sprint"
            name="sprintId"
            value={formData.sprintId}
            onChange={handleChange}
            options={sprints.map((s) => ({ label: s.name, value: s.id }))}
          />
        </div>

        {/* Assignee & Reporter */}
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Assignee"
            name="assigneeId"
            value={formData.assigneeId}
            onChange={handleChange}
            options={users.map((u) => ({ label: u.fullName || u.username, value: u.id }))}
          />
          <FormSelect
            label="Reporter *"
            name="reporterId"
            value={formData.reporterId}
            onChange={handleChange}
            options={users.map((u) => ({ label: u.fullName || u.username, value: u.id }))}
          />
        </div>

        {/* Billable */}
        <FormSelect
          label="Billable"
          name="isBillable"
          value={formData.isBillable}
          onChange={handleChange}
          options={[
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ]}
        />

        {/* Submit */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTaskForm;
