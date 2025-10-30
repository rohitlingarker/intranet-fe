import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";

import FormInput from "../../../../components/forms/FormInput";
import FormSelect from "../../../../components/forms/FormSelect";
import FormTextArea from "../../../../components/forms/FormTextArea";

const EditStoryForm = ({ storyId, projectId, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "BACKLOG",
    assigneeId: null,
    reporterId: null,
    sprintId: null,
    epicId: null,
    storyPoints: null,
    acceptanceCriteria: "",
  });

  const [users, setUsers] = useState([]);
  const [epics, setEpics] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  };

  // ---------- Fetch Initial Data ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storyRes, userRes, epicRes, sprintRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users?size=100`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`, axiosConfig),
        ]);

        setFormData({
          title: storyRes.data.title || "",
          description: storyRes.data.description || "",
          priority: storyRes.data.priority || "MEDIUM",
          status: storyRes.data.status || "BACKLOG",
          assigneeId: storyRes.data.assigneeId || null,
          reporterId: storyRes.data.reporterId || null,
          sprintId: storyRes.data.sprint?.id || null,
          epicId: storyRes.data.epic?.id || null,
          storyPoints: storyRes.data.storyPoints || null,
          acceptanceCriteria: storyRes.data.acceptanceCriteria || "",
        });

        setUsers(userRes.data.content || userRes.data || []);
        setEpics(epicRes.data || []);
        setSprints(sprintRes.data || []);
      } catch (error) {
        console.error("Error loading story data:", error);
        toast.error("Failed to load story details.");
      } finally {
        setLoading(false);
      }
    };

    if (storyId && projectId) {
      fetchData();
    }
  }, [storyId, projectId]);

  // ---------- Handle Input Change ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["epicId", "sprintId", "assigneeId", "reporterId", "storyPoints"].includes(name)
        ? value ? Number(value) : null
        : value,
    }));
  };

  // ---------- Handle Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title,
      description: formData.description || "",
      priority: formData.priority || "MEDIUM",
      status: formData.status || "BACKLOG",
      assigneeId: formData.assigneeId || null,
      reporterId: formData.reporterId || null,
      sprintId: formData.sprintId || null,
      epicId: formData.epicId || null,
      storyPoints: formData.storyPoints || null,
      acceptanceCriteria: formData.acceptanceCriteria || "",
      projectId: Number(projectId),
    };

    try {
      await axios.put(`${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`, payload, axiosConfig);
      toast.success("Story updated successfully!");
      setTimeout(() => {
        onUpdated?.();
        onClose?.();
      }, 800);
    } catch (error) {
      console.error("Error updating story:", error);
      toast.error("Failed to update story.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-gray-600 text-center">Loading...</p>;

  // ---------- Render ----------
  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg relative">
      <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
        <X size={20} />
      </button>

      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit User Story</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput label="Title *" name="title" value={formData.title} onChange={handleChange} required />
        <FormTextArea label="Description (optional)" name="description" value={formData.description} onChange={handleChange} />
        <FormSelect
          label="Epic (optional)"
          name="epicId"
          value={formData.epicId || ""}
          onChange={handleChange}
          options={[{ label: "Select", value: "" }, ...epics.map((e) => ({ label: e.name, value: e.id }))]}
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
          ]}
        />
        <FormInput
          label="Story Points (optional)"
          name="storyPoints"
          type="number"
          value={formData.storyPoints || ""}
          onChange={handleChange}
        />
        <FormTextArea
          label="Acceptance Criteria (optional)"
          name="acceptanceCriteria"
          value={formData.acceptanceCriteria}
          onChange={handleChange}
        />
        <FormSelect
          label="Sprint (optional)"
          name="sprintId"
          value={formData.sprintId || ""}
          onChange={handleChange}
          options={[{ label: "Select", value: "" }, ...sprints.map((s) => ({ label: s.name, value: s.id }))]}
        />
        <FormSelect
          label="Assignee (optional)"
          name="assigneeId"
          value={formData.assigneeId || ""}
          onChange={handleChange}
          options={[{ label: "Select", value: "" }, ...users.map((u) => ({ label: u.name, value: u.id }))]}
        />
        <FormSelect
          label="Reporter (optional)"
          name="reporterId"
          value={formData.reporterId || ""}
          onChange={handleChange}
          options={[{ label: "Select", value: "" }, ...users.map((u) => ({ label: u.name, value: u.id }))]}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Update Story"}
        </button>
      </form>
    </div>
  );
};

export default EditStoryForm;
