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
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // ---------- Fetch Data ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storyRes, userRes, epicRes, sprintRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`,
            axiosConfig
          ),
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/users?size=100`,
            axiosConfig
          ),
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`,
            axiosConfig
          ),
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`,
            axiosConfig
          ),
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

    if (storyId && projectId) fetchData();
  }, [storyId, projectId]);

  // ---------- Handle Input Change ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["epicId", "sprintId", "assigneeId", "reporterId", "storyPoints"].includes(name)
        ? value
          ? Number(value)
          : null
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
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`,
        payload,
        axiosConfig
      );
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

  if (loading)
    return <p className="text-gray-600 text-center py-6">Loading story details...</p>;

  // ---------- Render ----------
  return (
    <div className="relative bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl mx-auto max-h-[85vh] overflow-y-auto border border-gray-100">
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
      >
        <X size={22} />
      </button>

      <ToastContainer />

      {/* Header */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 border-b pb-3">
        Edit User Story
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <FormInput
          label="Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        {/* Description */}
        <FormTextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter a short summary or details about the story..."
        />

        {/* Epic */}
        <FormSelect
          label="Epic (optional)"
          name="epicId"
          value={formData.epicId || ""}
          onChange={handleChange}
          options={[
            { label: "Select Epic", value: "" },
            ...epics.map((e) => ({ label: e.name, value: e.id })),
          ]}
        />

        {/* Priority & Status in Two Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
        </div>

        {/* Story Points & Sprint in Two Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormInput
            label="Story Points"
            name="storyPoints"
            type="number"
            value={formData.storyPoints || ""}
            onChange={handleChange}
            placeholder="Enter points (optional)"
          />
          <FormSelect
            label="Sprint (optional)"
            name="sprintId"
            value={formData.sprintId || ""}
            onChange={handleChange}
            options={[
              { label: "Select Sprint", value: "" },
              ...sprints.map((s) => ({ label: s.name, value: s.id })),
            ]}
          />
        </div>

        {/* Acceptance Criteria */}
        <FormTextArea
          label="Acceptance Criteria"
          name="acceptanceCriteria"
          value={formData.acceptanceCriteria}
          onChange={handleChange}
          placeholder="Define what success looks like for this story..."
        />

        {/* Assignee & Reporter in Two Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormSelect
            label="Assignee"
            name="assigneeId"
            value={formData.assigneeId || ""}
            onChange={handleChange}
            options={[
              { label: "Select Assignee", value: "" },
              ...users.map((u) => ({ label: u.name, value: u.id })),
            ]}
          />
          <FormSelect
            label="Reporter"
            name="reporterId"
            value={formData.reporterId || ""}
            onChange={handleChange}
            options={[
              { label: "Select Reporter", value: "" },
              ...users.map((u) => ({ label: u.name, value: u.id })),
            ]}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Update Story"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStoryForm;
