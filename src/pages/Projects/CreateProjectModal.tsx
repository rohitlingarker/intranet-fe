import React, { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ProjectFormData {
  name: string;
  projectKey: string;
  description: string;
  status: string;
  ownerId: number | null;
  memberIds: number[];
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    projectKey: "",
    description: "",
    status: "ACTIVE",
    ownerId: null,
    memberIds: [],
  });

  // Fetch users when modal is open
  useEffect(() => {
    if (!isOpen) return;

    axios
      .get("http://localhost:8080/api/users?page=0&size=100")
      .then((res) => {
        if (Array.isArray(res.data.content)) {
          setUsers(res.data.content);
        } else {
          console.error("Unexpected response format:", res.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, ownerId: parseInt(e.target.value, 10) });
  };

  const handleMemberCheckboxChange = (userId: number) => {
    setFormData((prev) => {
      const isSelected = prev.memberIds.includes(userId);
      const updatedMembers = isSelected
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId];

      return { ...prev, memberIds: updatedMembers };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      memberIds: formData.memberIds, // Just to be explicit
    };

    try {
      console.log("Submitting payload:", payload);
      await axios.post("http://localhost:8080/api/projects", payload);
      if (onProjectCreated) onProjectCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Project Name"
            className="w-full border px-4 py-2 rounded"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
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
            name="ownerId"
            className="w-full border px-4 py-2 rounded"
            value={formData.ownerId ?? ""}
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

          {/* Members as checkboxes */}
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
