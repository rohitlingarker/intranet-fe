import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateProjectModal from "./CreateProjectModal"; // Adjust path if needed

type ProjectStatus = "ACTIVE" | "ARCHIVED" | "PLANNING";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Project {
  id: number;
  name: string;
  projectKey: string;
  description: string;
  status: ProjectStatus;
  owner: User | null;
  members: User[];
}

interface ProjectFormData {
  name: string;
  projectKey: string;
  description: string;
  status: ProjectStatus;
  ownerId: number | null;
  memberIds: number[];
}

const ProjectDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    projectKey: "",
    description: "",
    status: "ACTIVE",
    ownerId: null,
    memberIds: [],
  });

  const [users, setUsers] = useState<User[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:8080/api/projects");
      const data = res.data.content || res.data;
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for owner/member selection
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/users?page=0&size=100");
      const content = res.data.content;
      if (Array.isArray(content)) setUsers(content);
      else console.error("Invalid users response format:", res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  // When starting edit, populate formData with project info + ownerId and memberIds
  const startEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      projectKey: project.projectKey,
      description: project.description,
      status: project.status,
      ownerId: project.owner ? project.owner.id : null,
      memberIds: project.members.map((m) => m.id),
    });
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setFormData({
      name: "",
      projectKey: "",
      description: "",
      status: "ACTIVE",
      ownerId: null,
      memberIds: [],
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "ownerId") {
      setFormData((prev) => ({
        ...prev,
        ownerId: value ? parseInt(value) : null,
      }));
    } else if (name === "status") {
      setFormData((prev) => ({
        ...prev,
        status: value as ProjectStatus,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // For toggling members in memberIds array
  const handleMemberCheckboxChange = (userId: number) => {
    setFormData((prev) => {
      const updated = prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId];
      return { ...prev, memberIds: updated };
    });
  };

  const submitEdit = async () => {
    if (!editingProject) return;

    if (!formData.ownerId) {
      alert("Please select a project owner.");
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.put(`http://localhost:8080/api/projects/${editingProject.id}`, {
        name: formData.name.trim(),
        projectKey: formData.projectKey.trim(),
        description: formData.description.trim(),
        status: formData.status,
        ownerId: formData.ownerId,
        memberIds: formData.memberIds,
      });

      alert("Project updated successfully!");
      cancelEdit();
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to update project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/projects/${projectId}`);
      alert("Project deleted successfully!");
      fetchProjects();
    } catch (err: any) {
      console.error("Failed to delete project:", err.response?.data || err.message || err);
      alert("Failed to delete project. Check console for details.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Project Dashboard</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Project
        </button>
      </div>

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && projects.length === 0 && <p>No projects found.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
            {editingProject?.id === project.id ? (
              <>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 mb-2"
                  placeholder="Project Name"
                  required
                />
                <input
                  name="projectKey"
                  value={formData.projectKey}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 mb-2"
                  placeholder="Project Key"
                  required
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 mb-2 resize-none"
                  placeholder="Description"
                />

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 mb-2"
                  required
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PLANNING">PLANNING</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>

                <select
                  name="ownerId"
                  value={formData.ownerId ?? ""}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 mb-2"
                  required
                >
                  <option value="">Select Owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>

                <div className="border rounded p-3 mb-2 max-h-32 overflow-y-auto">
                  <p className="font-medium mb-1">Select Members:</p>
                  <div className="grid grid-cols-2 gap-2">
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

                <div className="flex space-x-2 mt-auto">
                  <button
                    onClick={submitEdit}
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                <p>
                  <strong>Key:</strong> {project.projectKey}
                </p>
                <p className="mb-2">
                  <strong>Description:</strong> {project.description || "—"}
                </p>
                <p>
                  <strong>Status:</strong> {project.status}
                </p>

                <div className="mt-2">
                  <strong>Owner:</strong>{" "}
                  {project.owner ? (
                    <span>
                      {project.owner.name} ({project.owner.role})
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                </div>

                <div className="mt-2">
                  <strong>Members:</strong>
                  <ul className="list-disc list-inside">
                    {project.members.length > 0 ? (
                      project.members.map((member) => (
                        <li key={member.id}>
                          {member.name} ({member.role})
                        </li>
                      ))
                    ) : (
                      <li>—</li>
                    )}
                  </ul>
                </div>

                <div className="mt-auto flex space-x-2 pt-4">
                  <button
                    onClick={() => startEdit(project)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};

export default ProjectDashboard;
