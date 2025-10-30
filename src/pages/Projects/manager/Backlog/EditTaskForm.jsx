import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";

import FormInput from "../../../../components/forms/FormInput";
import FormSelect from "../../../../components/forms/FormSelect";
import FormTextArea from "../../../../components/forms/FormTextArea";
import FormDatePicker from "../../../../components/forms/FormDatePicker";

const EditTaskForm = ({ taskId, projectId, onClose, onUpdated }) => {
  const [formData, setFormData] = useState(null);
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!taskId || !projectId) return null;

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  };

  // ---------- Fetch Data ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, storiesRes, sprintsRes, usersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users?size=100`, axiosConfig),
        ]);

        const task = taskRes.data;
        const allUsers = usersRes.data.content || usersRes.data || [];

        setStories(storiesRes.data || []);
        setSprints(sprintsRes.data || []);
        setUsers(allUsers);

        setFormData({
          title: task.title || "",
          description: task.description || "",
          priority: task.priority || "MEDIUM",
          status: task.status || "BACKLOG",
          storyPoints: task.storyPoints || "",
          dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
          sprintId: task.sprint?.id || "",
          storyId: task.story?.id || "",
          assigneeName: task.assignee?.name || "",
          reporterName: task.reporter?.name || "",
          isBillable: task.isBillable ? "Yes" : "No",
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

  // ---------- Handle Change ----------
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
    if (!formData) return;

    // Match user objects by name
    const selectedAssignee = users.find((u) => u.name === formData.assigneeName);
    const selectedReporter = users.find((u) => u.name === formData.reporterName);

    const payload = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      storyPoints: formData.storyPoints ? Number(formData.storyPoints) : null,
      dueDate: formData.dueDate || null,
      sprintId: formData.sprintId || null,
      storyId: formData.storyId || null,
      projectId: Number(projectId),
      assigneeId: selectedAssignee ? selectedAssignee.id : null,
      reporterId: selectedReporter ? selectedReporter.id : null,
      isBillable: formData.isBillable === "Yes",
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}`,
        payload,
        axiosConfig
      );

      toast.success("Task updated successfully!");
      onUpdated?.(response.data);
      onClose?.();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(error.response?.data?.message || "Failed to update task.");
    }
  };

  // ---------- Loading State ----------
  if (loading || !formData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg text-center">
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <ToastContainer />
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Edit Task
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
            />

            {/* Priority */}
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

            {/* Status */}
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

            {/* Story Points */}
            <FormInput
              label="Story Points"
              name="storyPoints"
              type="number"
              value={formData.storyPoints || ""}
              onChange={handleChange}
            />

            {/* Due Date */}
            <FormDatePicker
              label="Due Date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />

            {/* Sprint */}
            <FormSelect
              label="Sprint"
              name="sprintId"
              value={formData.sprintId}
              onChange={handleChange}
              options={sprints.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
              placeholder="Select sprint"
            />

            {/* Story */}
            <FormSelect
              label="Story"
              name="storyId"
              value={formData.storyId}
              onChange={handleChange}
              options={stories.map((st) => ({
                label: st.title,
                value: st.id,
              }))}
              placeholder="Select story"
            />

            {/* Assignee */}
            <FormSelect
              label="Assignee"
              name="assigneeName"
              value={formData.assigneeName}
              onChange={handleChange}
              options={users.map((u) => ({
                label: u.name,
                value: u.name,
              }))}
              placeholder="Select assignee"
            />

            {/* Reporter */}
            <FormSelect
              label="Reporter"
              name="reporterName"
              value={formData.reporterName}
              onChange={handleChange}
              options={users.map((u) => ({
                label: u.name,
                value: u.name,
              }))}
              placeholder="Select reporter"
            />

            {/* Billable */}
            <FormSelect
              label="Billable"
              name="isBillable"
              value={formData.isBillable}
              onChange={handleChange}
              options={[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ]}
            />

            {/* Buttons */}
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

      {/* Invisible Scrollbar */}
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

export default EditTaskForm;
