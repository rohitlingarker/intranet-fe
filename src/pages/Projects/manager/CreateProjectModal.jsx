import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",          // Required
    projectKey: "",    // Required
    description: "",   // Optional
    status: "ACTIVE",  // Required
    ownerId: "",       // Required
    memberIds: [],     // Optional
    startDate: "",     // Optional
    endDate: "",       // Optional
  });
  const [dateError, setDateError] = useState(false);

  const token = localStorage.getItem("token"); // JWT token

  useEffect(() => {
    if (!isOpen) return;

    axios
      .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users?page=0&size=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const content = res.data.content;
        if (Array.isArray(content)) {
          setUsers(content);
        } else {
          console.error("Invalid users response format:", res.data);
        }
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, [isOpen, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const cleanedValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
      const finalValue = cleanedValue.replace(/\s+/g, " ");
      setFormData((prev) => ({ ...prev, [name]: finalValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "startDate" || name === "endDate") {
      const { startDate, endDate } = { ...formData, [name]: value };
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        setDateError(true);
      } else {
        setDateError(false);
      }
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

  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectName = formData.name.trim();
    if (!projectName || /^[^a-zA-Z0-9]+$/.test(projectName)) {
      toast.error("❌ Project name must contain valid characters (letters/numbers).");
      return;
    }

    if (!formData.ownerId) {
      alert("Please select a project owner.");
      return;
    }

    if (dateError) {
      toast.error("❌ End date cannot be before Start date.");
      return;
    }

    const payload = {
      ...formData,
      name: projectName,
      ownerId: parseInt(formData.ownerId),
      startDate: formData.startDate ? `${formData.startDate}T00:00:00` : null,
      endDate: formData.endDate ? `${formData.endDate}T23:59:59` : null,
    };

    try {
      setIsSubmitting(true);
      await axios.post(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✅ Project created successfully!");

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

      setDateError(false);
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error.response?.data || error);
      toast.error("❌ Failed to create project. Check required fields or console for more info.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Project Name *"
            className="w-full border px-4 py-2 rounded"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            name="projectKey"
            placeholder="Project Key *"
            className="w-full border px-4 py-2 rounded"
            value={formData.projectKey}
            onChange={handleInputChange}
            required
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
            <option value="">Select Owner *</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>

          <textarea
            name="description"
            placeholder="Project Description (Optional)"
            className="w-full border px-4 py-2 rounded"
            value={formData.description}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date </label>
              <input
                type="date"
                name="startDate"
                className={`w-full border px-4 py-2 rounded ${dateError ? "border-red-500" : ""}`}
                value={formData.startDate}
                onChange={handleInputChange}
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date </label>
              <input
                type="date"
                name="endDate"
                className={`w-full border px-4 py-2 rounded ${dateError ? "border-red-500" : ""}`}
                value={formData.endDate}
                onChange={handleInputChange}
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
          </div>
          {dateError && (
            <p className="text-red-600 text-sm mt-1">⚠️ End date cannot be before Start date</p>
          )}

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
