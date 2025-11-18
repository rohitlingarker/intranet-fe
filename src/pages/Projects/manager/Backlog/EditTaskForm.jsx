import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
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
    statusId: "",
    sprintId: "",
    assigneeId: "",
    reporterId: "",
    isBillable: "false",
  });

  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!taskId || !projectId) return null;

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
        const [taskRes, userRes, storiesRes, sprintRes, statusRes] =
          await Promise.all([
            axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}`, axiosConfig),
            axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/members-with-owner`, axiosConfig),
            axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`, axiosConfig),
            axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`, axiosConfig),
            axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/statuses`, axiosConfig),
          ]);

        const task = taskRes.data;
        const allUsers = userRes.data.content || userRes.data || [];

        setUsers(allUsers);
        setStories(storiesRes.data || []);
        setSprints(sprintRes.data || []);
        setStatuses(statusRes.data || []);

        setFormData({
          title: task.title || "",
          description: task.description || "",
          storyId: task.storyId || "",
          assigneeId: task.assigneeId || "",
          reporterId: task.reporterId || "",
          sprintId: task.sprintId || "",
          statusId: task.statusId || "",
          priority: task.priority || "MEDIUM",
          isBillable: task.billable ? "true" : "false",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [taskId, projectId]);

  // ---------- HANDLE INPUT ----------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: ["storyId", "sprintId", "assigneeId", "reporterId", "statusId"].includes(name)
        ? value
          ? Number(value)
          : ""
        : value,
    }));
  };

  // ---------- SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      storyId: formData.storyId || null,
      sprintId: formData.sprintId || null,
      assigneeId: formData.assigneeId || null,
      reporterId: formData.reporterId || null,
      statusId: formData.statusId || null,
      priority: formData.priority,
      billable: formData.isBillable === "true",
      projectId: Number(projectId),
    };

    try {
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}`,
        payload,
        axiosConfig
      );

      toast.success("Task updated successfully!");

      setTimeout(() => {
        onUpdated?.();
        onClose?.();
      }, 600);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  // ---------- LOADING ----------
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p>Loading task...</p>
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
          <h2 className="text-2xl font-bold mb-6">Edit Task</h2>

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
              label="Story"
              name="storyId"
              value={formData.storyId}
              onChange={handleChange}
              options={[
                { label: "Select Story", value: "" },
                ...stories.map((s) => ({ label: s.title || s.name, value: s.id })),
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

        <style>
          {`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default EditTaskForm;
