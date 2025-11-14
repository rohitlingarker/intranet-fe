import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";

import FormInput from "../../../../components/forms/FormInput";
import FormSelect from "../../../../components/forms/FormSelect";
import FormTextArea from "../../../../components/forms/FormTextArea";

const EditStoryForm = ({ storyId, projectId, onClose, onUpdated }) => {
  const [formData, setFormData] = useState(null);
  const [users, setUsers] = useState([]);
  const [epics, setEpics] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!storyId || !projectId) return null;

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
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/members-with-owner`,
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

        const story = storyRes.data;
        const allUsers = userRes.data.content || userRes.data || [];

        setUsers(allUsers);
        setEpics(epicRes.data || []);
        setSprints(sprintRes.data || []);

        setFormData({
          title: story.title || "",
          description: story.description || "",
          priority: story.priority || "MEDIUM",
          status: story.status || "BACKLOG",
          assigneeId: story.assigneeId || null,
          reporterId: story.reporterId || null,
          sprintId: story.sprint?.id || null,
          epicId: story.epic?.id || null,
          storyPoints: story.storyPoints || null,
          acceptanceCriteria: story.acceptanceCriteria || "",
        });
      } catch (error) {
        console.error("Error loading story data:", error);
        toast.error("Failed to load story details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;

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
      }, 500);
    } catch (error) {
      console.error("Error updating story:", error);
      toast.error(
        error.response?.data?.message || "Failed to update story. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- Loading State ----------
  if (loading || !formData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg text-center">
          <p className="text-gray-600">Loading story details...</p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <ToastContainer />
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Story</h2>

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
            />

            {/* Epic */}
            <FormSelect
              label="Epic"
              name="epicId"
              value={formData.epicId || ""}
              onChange={handleChange}
              options={[
                { label: "Select Epic", value: "" },
                ...epics.map((e) => ({ label: e.name, value: e.id })),
              ]}
            />

            {/* Priority & Status */}
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

            {/* Story Points & Sprint */}
            <FormInput
              label="Story Points"
              name="storyPoints"
              type="number"
              value={formData.storyPoints || ""}
              onChange={handleChange}
            />

            <FormSelect
              label="Sprint"
              name="sprintId"
              value={formData.sprintId || ""}
              onChange={handleChange}
              options={[
                { label: "Select Sprint", value: "" },
                ...sprints.map((s) => ({ label: s.name, value: s.id })),
              ]}
            />

            {/* Acceptance Criteria */}
            <FormTextArea
              label="Acceptance Criteria"
              name="acceptanceCriteria"
              value={formData.acceptanceCriteria}
              onChange={handleChange}
            />

            {/* Assignee & Reporter */}
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
              label="Reporter *"
              name="reporterId"
              value={formData.reporterId || ""}
              onChange={handleChange}
              options={[
                { label: "Select Reporter", value: "" },
                ...users.map((u) => ({ label: u.name, value: u.id })),
              ]}
            />

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            width: 0px;
            background: transparent;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
};

export default EditStoryForm;
