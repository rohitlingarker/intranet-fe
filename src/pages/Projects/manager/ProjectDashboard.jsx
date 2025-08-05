import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "./CreateProjectModal"; // Adjust path if needed
import Button from "../../../components/Button/Button"; // ✅ Adjust path if needed

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    projectKey: "",
    description: "",
    status: "ACTIVE",
    ownerId: null,
    memberIds: [],
  });

  const [users, setUsers] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:8080/api/projects", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = res.data.content || res.data;
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const startEdit = (project) => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "ownerId") {
      setFormData((prev) => ({
        ...prev,
        ownerId: value ? parseInt(value) : null,
      }));
    } else if (name === "status") {
      setFormData((prev) => ({
        ...prev,
        status: value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMemberCheckboxChange = (userId) => {
    setFormData((prev) => {
      const updated = prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId];
      return { ...prev, memberIds: updated };
    });
  };

  const submitEdit = async () => {
    if (!editingProject || !formData.ownerId) {
      alert("Please complete all required fields.");
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

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/projects/${projectId}`);
      alert("Project deleted successfully!");
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err.response?.data || err.message || err);
      alert("Failed to delete project. Check console for details.");
    }
  };

  const goToProjectTab = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Project Dashboard</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
          + Create Project
        </Button>
      </div>

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && projects.length === 0 && <p>No projects found.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`bg-white rounded-lg shadow p-6 flex flex-col transition ${
              editingProject?.id !== project.id ? "cursor-pointer hover:shadow-lg" : ""
            }`}
            onClick={() =>
              editingProject?.id !== project.id ? goToProjectTab(project.id) : undefined
            }
          >
            {editingProject?.id === project.id ? (
              <>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 mb-2"
                  placeholder="Project Name"
                />
                <input
                  name="projectKey"
                  value={formData.projectKey}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 mb-2"
                  placeholder="Project Key"
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
                  <Button
                    onClick={submitEdit}
                    disabled={isSubmitting}
                    variant="success"
                    size="small"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                  <Button onClick={cancelEdit} variant="secondary" size="small">
                    Cancel
                  </Button>
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
                <div className="mt-3">
                  <strong>Owner:</strong>
                  {project.owner ? (
                    <div className="flex flex-col mt-1 text-sm text-gray-700">
                      <span className="font-medium">{project.owner.name}</span>
                      <span>{project.owner.role}</span>
                      <span className="text-xs text-gray-500">{project.owner.email}</span>
                    </div>
                  ) : (
                    <p className="text-gray-500">—</p>
                  )}
                </div>
                <div className="mt-3">
                  <strong>Members:</strong>
                  <div className="flex flex-wrap gap-2 mt-1 text-sm">
                    {project.members.length > 0 ? (
                      project.members.map((member) => (
                        <div
                          key={member.id}
                          className="border rounded px-2 py-1 bg-gray-100 text-gray-800"
                        >
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs">{member.role}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">—</p>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex space-x-2 pt-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(project);
                    }}
                    variant="primary"
                    size="small"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    variant="danger"
                    size="small"
                  >
                    Delete
                  </Button>
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
