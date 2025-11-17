import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateProjectModal = ({
  isOpen,
  onClose,
  onProjectCreated,
  formData,
  setFormData,
  editingProjectId,
}) => {
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!isOpen) return;

    axios
      .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users?page=0&size=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const content = res.data.content;
        if (Array.isArray(content)) setUsers(content);
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, [isOpen, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const cleanedValue = value.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ");
      setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "startDate" || name === "endDate") {
      const { startDate, endDate } = { ...formData, [name]: value };
      setDateError(startDate && endDate && new Date(endDate) < new Date(startDate));
    }
  };

  const handleOwnerChange = (e) => {
    const newOwnerId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      ownerId: newOwnerId,
      memberIds: prev.memberIds.filter((id) => id.toString() !== newOwnerId),
    }));
  };

  const handleMemberCheckboxChange = (userId) => {
    if (userId.toString() === formData.ownerId.toString()) return;

    setFormData((prev) => {
      const updated = prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId];
      return { ...prev, memberIds: updated };
    });
  };

  const handleStatusChange = (e) => setFormData({ ...formData, status: e.target.value });
  const handleStageChange = (e) => setFormData({ ...formData, currentStage: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Project name is required.");
    if (!formData.projectKey.trim()) return toast.error("Project key is required.");
    if (!formData.ownerId) return toast.error("Please select a project owner.");
    if (dateError) return toast.error("End date cannot be before Start date.");

    const payload = {
      name: formData.name.trim(),
      projectKey: formData.projectKey.trim(),
      description: formData.description || null,
      status: formData.status,
      currentStage: formData.currentStage,
      ownerId: parseInt(formData.ownerId, 10),
      memberIds: formData.memberIds,
      startDate: formData.startDate ? `${formData.startDate}T00:00:00` : null,
      endDate: formData.endDate ? `${formData.endDate}T23:59:59` : null,
    };

    try {
      setIsSubmitting(true);

      if (editingProjectId) {
        await axios.put(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${editingProjectId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Project updated successfully!");
      } else {
        await axios.post(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Project created successfully!");
      }

      if (onProjectCreated) onProjectCreated();

      if (!editingProjectId) {
        setFormData({
          name: "",
          projectKey: "",
          description: "",
          status: "PLANNING",
          currentStage: "INITIATION",
          ownerId: "",
          memberIds: [],
          startDate: "",
          endDate: "",
        });
      }

      setDateError(false);
    } catch (error) {
      console.error("Failed to submit project:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to submit project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

   return (
  <div
    className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xs shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 px-6 pt-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingProjectId ? "Edit Project" : "Create New Project"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Project Name */}
            <label className="block w-full md:w-1/2">
              <span className="font-medium text-sm">Project Name *</span>
              <input
                name="name"
                placeholder="Enter project name"
                className="w-full border px-4 py-2 rounded mt-1"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </label>

            {/* Project Key */}
            <label className="block w-full md:w-1/2">
              <span className="font-medium text-sm">Project Key *</span>
              <input
                name="projectKey"
                placeholder="Enter project key"
                className="w-full border px-4 py-2 rounded mt-1"
                value={formData.projectKey}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>


          {/* Status */}
          <label className="block">
            <span className="font-medium text-sm">Project Status *</span>
            <select
              name="status"
              className="w-full border px-4 py-2 rounded mt-1"
              value={formData.status}
              onChange={handleStatusChange}
              required
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PLANNING">PLANNING</option>
              <option value="ARCHIVED">ARCHIVED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </label>

          {/* Current Stage */}
          <label className="block">
            <span className="font-medium text-sm">Current Stage *</span>
            <select
              name="currentStage"
              className="w-full border px-4 py-2 rounded mt-1"
              value={formData.currentStage}
              onChange={handleStageChange}
              required
            >
              <option value="INITIATION">INITIATION</option>
              <option value="PLANNING">PLANNING</option>
              <option value="DESIGN">DESIGN</option>
              <option value="DEVELOPMENT">DEVELOPMENT</option>
              <option value="TESTING">TESTING</option>
              <option value="DEPLOYMENT">DEPLOYMENT</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </label>

          {/* Owner */}
          <label className="block">
            <span className="font-medium text-sm">Project Owner *</span>
            <select
              name="ownerId"
              className="w-full border px-4 py-2 rounded mt-1"
              value={formData.ownerId}
              onChange={handleOwnerChange}
              required
            >
              <option value="">Select Owner</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.roles.join(", ")})
                </option>
              ))}
            </select>
          </label>

          {/* Description */}
          <label className="block">
            <span className="font-medium text-sm">Project Description</span>
            <textarea
              name="description"
              placeholder="Add project description"
              className="w-full border px-4 py-2 rounded mt-1"
              value={formData.description}
              onChange={handleInputChange}
            />
          </label>

          {/* Dates */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input
                type="date"
                name="startDate"
                className={`w-full border px-4 py-2 rounded ${
                  dateError ? "border-red-500" : ""
                }`}
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                className={`w-full border px-4 py-2 rounded ${
                  dateError ? "border-red-500" : ""
                }`}
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {dateError && (
            <p className="text-red-600 text-sm mt-1">
              ⚠️ End date cannot be before Start date
            </p>
          )}


          {/* Members */}
          <div className="border rounded p-4">
            <p className="font-medium mb-2">Select Members (Optional):</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.memberIds.includes(user.id)}
                    onChange={() => handleMemberCheckboxChange(user.id)}
                    disabled={formData.ownerId.toString() === user.id.toString()}
                  />
                  {user.name} ({user.roles.join(", ")})
                </label>
              ))}
            </div>
          </div>

          {/* Add extra padding at bottom so content doesn't get hidden behind footer */}
        {/* Sticky footer buttons */}
      <div className="flex justify-end gap-4 p-4 border-t bg-white sticky bottom-0 z-10">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          // form="projectForm" // optional if form has id
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting
            ? editingProjectId
              ? "Updating..."
              : "Creating..."
            : editingProjectId
            ? "Update Project"
            : "Create Project"}
        </button>
      </div>  
        </form>
      </div>

      
    </div>
  </div>
);

};

export default CreateProjectModal;
