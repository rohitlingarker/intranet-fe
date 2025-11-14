import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", // 🟩 Project Name
    projectKey: "", // 🟩 Project Key
    description: "", // 🟩 Project Description
    status: "PLANNING", // 🟩 Project Status
    currentStage: "INITIATION", // 🟩 Current Stage (NEW COLUMN)
    ownerId: "", // 🟩 Project Owner
    memberIds: [], // 🟩 Project Members
    startDate: "", // 🟩 Start Date
    endDate: "", // 🟩 End Date
  });
  const [dateError, setDateError] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ Fetch users for Owner & Member dropdowns
  useEffect(() => {
    if (!isOpen) return;

    axios
      .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users?page=0&size=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const content = res.data.content;
        if (Array.isArray(content)) setUsers(content);
        else console.error("Invalid users response format:", res.data);
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, [isOpen, token]);

  // ✅ Handle all form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      // Prevent special characters
      const cleanedValue = value.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ");
      setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // ✅ Date validation
    if (name === "startDate" || name === "endDate") {
      const { startDate, endDate } = { ...formData, [name]: value };
      setDateError(startDate && endDate && new Date(endDate) < new Date(startDate));
    }
  };

  // ✅ Handle Owner selection
  const handleOwnerChange = (e) => {
    const newOwnerId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      ownerId: newOwnerId,
      memberIds: prev.memberIds.filter((id) => id.toString() !== newOwnerId),
    }));
  };

  const [searchQuery, setSearchQuery] = useState(""); // 🟩 Added for search
  const filteredUsers = users.filter((user) =>
  user.name.toLowerCase().includes(searchQuery.toLowerCase())
);


  // ✅ Handle Member checkboxes
  const handleMemberCheckboxChange = (userId) => {
    if (userId.toString() === formData.ownerId.toString()) return;

    setFormData((prev) => {
      const updated = prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId];
      return { ...prev, memberIds: updated };
    });
  };

  // ✅ Handle Status change
  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.value });
  };

  // ✅ Handle Current Stage change
  const handleStageChange = (e) => {
    setFormData({ ...formData, currentStage: e.target.value });
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectName = formData.name.trim();
    if (!projectName) return toast.error("❌ Project name is required.");
    if (!formData.projectKey.trim()) return toast.error("❌ Project key is required.");
    if (!formData.ownerId) return toast.error("❌ Please select a project owner.");
    if (dateError) return toast.error("❌ End date cannot be before Start date.");

    const payload = {
      name: projectName,
      projectKey: formData.projectKey.trim(),
      description: formData.description || null,
      status: formData.status,
      currentStage: formData.currentStage, 
      ownerId: parseInt(formData.ownerId, 10),
      memberIds: formData.memberIds,
      memberCount: formData.memberIds.length,
      startDate: formData.startDate ? `${formData.startDate}T00:00:00` : null,
      endDate: formData.endDate ? `${formData.endDate}T23:59:59` : null,
    };

    try {
      setIsSubmitting(true);
      await axios.post(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(" Project created successfully!");
      if (onProjectCreated) onProjectCreated();

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
      setDateError(false);
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error.response?.data || error);
      toast.error(error.response?.data?.message || " Failed to create project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-semibold">Create New Project</h2>
  <button
    type="button"
    onClick={onClose}
    className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
  >
    &times;
  </button>
</div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 🟩 Project Name */}
          <label className="block">
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

          {/* 🟩 Project Key */}
          <label className="block">
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

          {/* 🟩 Project Status */}
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

          {/* 🟩 Current Stage (NEW COLUMN) */}
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

          {/* 🟩 Project Owner */}
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

          {/* 🟩 Description */}
          <label className="block">
            <span className="font-medium text-sm">Project Description (Optional)</span>
            <textarea
              name="description"
              placeholder="Add project description"
              className="w-full border px-4 py-2 rounded mt-1"
              value={formData.description}
              onChange={handleInputChange}
            />
          </label>

          {/* 🟩 Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input
                type="date"
                name="startDate"
                className={`w-full border px-4 py-2 rounded ${
                  dateError ? "border-red-500" : ""
                }`}
                value={formData.startDate}
                onChange={handleInputChange}
                onKeyDown={(e) => e.preventDefault()}
                required
              />
             
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                className={`w-full border px-4 py-2 rounded ${
                  dateError ? "border-red-500" : ""
                }`}
                value={formData.endDate}
                onChange={handleInputChange}
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
          </div>
          {dateError && (
            <p className="text-red-600 text-sm mt-1">
              ⚠️ End date cannot be before Start date
            </p>
          )}

          {/* 🟩 Members */}
          <div className="border rounded p-4">
            <p className="font-medium mb-2">Select Members (Optional):</p>
<input
  type="text"
  placeholder="Search users..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full border px-3 py-2 rounded mb-3"
/>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {filteredUsers.map((user) => (
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

          {/* 🟩 Buttons */}
          <div className="flex justify-end gap-4 pt-2">
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
