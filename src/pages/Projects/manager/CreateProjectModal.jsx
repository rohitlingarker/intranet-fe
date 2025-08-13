import React, { useEffect, useState } from "react";
import axios from "axios";

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    projectKey: "",
    description: "",
    status: "ACTIVE",
    ownerId: "",
    memberIds: [],
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    axios
      .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users?page=0&size=100`)
      .then((res) => {
        const content = res.data.content;
        if (Array.isArray(content)) {
          setUsers(content);
        } else {
          console.error("Invalid users response format:", res.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });

    setSuccessMessage("");
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOwnerChange = (e) => {
    setFormData({ ...formData, ownerId: e.target.value });
  };

  const handleMemberCheckboxChange = (userId) => {
    setFormData((prev) => {
      const updated = prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId];
      return { ...prev, memberIds: updated };
    });
  };

  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.ownerId) {
      alert("Please select a project owner.");
      return;
    }

    const payload = {
      ...formData,
      ownerId: parseInt(formData.ownerId),
      startDate: formData.startDate ? `${formData.startDate}T00:00:00` : null,
      endDate: formData.endDate ? `${formData.endDate}T23:59:59` : null,
    };

    try {
      setIsSubmitting(true);
      await axios.post(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, payload);

      setSuccessMessage("✅ Project created successfully!");
      if (onProjectCreated) onProjectCreated();

      setFormData({
        name: "",
        projectKey: "",
        description: "",
        status: "ACTIVE",
        ownerId: "",
        memberIds: [],
        startDate: "",
        endDate: "",
      });

      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1500);
    } catch (error) {
      console.error("Failed to create project:", error.response?.data || error);
      alert("Failed to create project. Check required fields or console for more info.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

        {successMessage && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 border border-green-300">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Project Name"
            className="w-full border px-4 py-2 rounded"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            name="projectKey"
            placeholder="Project Key"
            className="w-full border px-4 py-2 rounded"
            value={formData.projectKey}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Project Description"
            className="w-full border px-4 py-2 rounded"
            value={formData.description}
            onChange={handleInputChange}
          />

          <select
            name="status"
            className="w-full border px-4 py-2 rounded"
            value={formData.status}
            onChange={handleStatusChange}
            required
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="PLANNING">PLANNING</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          <select
            name="ownerId"
            className="w-full border px-4 py-2 rounded"
            value={formData.ownerId}
            onChange={handleOwnerChange}
            required
          >
            <option value="">Select Owner</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="w-full border px-4 py-2 rounded"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                className="w-full border px-4 py-2 rounded"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="border rounded p-4">
            <p className="font-medium mb-2">Select Members:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.memberIds.includes(user.id)}
                    onChange={() => handleMemberCheckboxChange(user.id)}
                  />
                  {user.name} ({user.role})
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
