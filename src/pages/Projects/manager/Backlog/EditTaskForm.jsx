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
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!storyId || !projectId) return null;

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // ---------- FETCH DATA ----------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [storyRes, userRes, epicRes, sprintRes, statusRes] = await Promise.all([
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
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/statuses`,
            axiosConfig
          ),
        ]);

        const story = storyRes.data;
        const allUsers = userRes.data.content || userRes.data || [];

        setUsers(allUsers);
        setEpics(epicRes.data || []);
        setSprints(sprintRes.data || []);
        setStatuses(statusRes.data || []);

        setFormData({
          title: story.title,
          description: story.description,
          acceptanceCriteria: story.acceptanceCriteria,
          storyPoints: story.storyPoints || 0,
          assigneeId: story.assigneeId || "",
          reporterId: story.reporterId || "",

          epicId: story.epic?.id || "",
          sprintId: story.sprint?.id || "",

          // IMPORTANT: using statusId now
          statusId: story.status?.id || "",

          priority: story.priority || "MEDIUM",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load story details");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [storyId, projectId]);

  // ---------- HANDLE INPUT ----------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: ["epicId", "sprintId", "assigneeId", "reporterId", "storyPoints", "statusId"].includes(name)
        ? value ? Number(value) : ""
        : value,
    }));
  };

  // ---------- SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      acceptanceCriteria: formData.acceptanceCriteria,
      storyPoints: formData.storyPoints || 0,

      assigneeId: formData.assigneeId || null,
      reporterId: formData.reporterId || null,

      epicId: formData.epicId || null,
      sprintId: formData.sprintId || null,

      statusId: formData.statusId, // important

      priority: formData.priority,
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
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update story");
    }
  };

  // ---------- LOADING ----------
  if (loading || !formData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  // ---------- FORM ----------
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <ToastContainer />
          <h2 className="text-2xl font-bold mb-6">Edit Story</h2>

          <form onSubmit={handleSubmit} className="space-y-6">

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

            <FormSelect
              label="Epic"
              name="epicId"
              value={formData.epicId}
              onChange={handleChange}
              options={[
                { label: "Select Epic", value: "" },
                ...epics.map((e) => ({ label: e.name, value: e.id })),
              ]}
            />

            <FormSelect
              label="Priority"
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

            {/* NEW: STATUS FROM API */}
            <FormSelect
              label="Status *"
              name="statusId"
              value={formData.statusId}
              onChange={handleChange}
              options={[
                { label: "Select Status", value: "" },
                ...statuses.map((st) => ({ label: st.name, value: st.id })),
              ]}
            />

            <FormInput
              label="Story Points"
              name="storyPoints"
              type="number"
              value={formData.storyPoints}
              onChange={handleChange}
            />

            <FormSelect
              label="Sprint"
              name="sprintId"
              value={formData.sprintId}
              onChange={handleChange}
              options={[
                { label: "Select Sprint", value: "" },
                ...sprints.map((s) => ({ label: s.name, value: s.id })),
              ]}
            />

            <FormTextArea
              label="Acceptance Criteria"
              name="acceptanceCriteria"
              value={formData.acceptanceCriteria}
              onChange={handleChange}
            />

            <FormSelect
              label="Assignee"
              name="assigneeId"
              value={formData.assigneeId}
              onChange={handleChange}
              options={[
                { label: "Select Assignee", value: "" },
                ...users.map((u) => ({ label: u.name, value: u.id })),
              ]}
            />

            <FormSelect
              label="Reporter"
              name="reporterId"
              value={formData.reporterId}
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default EditStoryForm;
