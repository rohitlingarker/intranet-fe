import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash,
  Check,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button";
import CreateProjectModal from "./CreateProjectModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [formData, setFormData] = useState({});
  const [users, setUsers] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.content || [];
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/users?page=0&size=100",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.content || [];
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingProjectId(null);
    } else {
      setExpandedId(id);
      setEditingProjectId(null);
    }
  };

  const startEdit = (project) => {
    setExpandedId(project.id);
    setEditingProjectId(project.id);
    setFormData({
      name: project.name,
      projectKey: project.projectKey,
      description: project.description,
      status: project.status,
      ownerId: project.owner?.id || "",
      memberIds: project.members?.map((m) => m.id) || [],
    });
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberToggle = (userId) => {
    setFormData((prev) => {
      const updated = prev.memberIds?.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...(prev.memberIds || []), userId];
      return { ...prev, memberIds: updated };
    });
  };

  const submitEdit = async (projectId) => {
    try {
      setIsSubmitting(true);
      await axios.put(
        `http://localhost:8080/api/projects/${projectId}`,
        {
          ...formData,
          ownerId: formData.ownerId
            ? parseInt(formData.ownerId)
            : null,
          memberIds: formData.memberIds || [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Project updated successfully!", { position: "top-right" });
      setEditingProjectId(null);
      fetchProjects();
    } catch (err) {
      console.error("Failed to update project", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      await axios.delete(
        `http://localhost:8080/api/projects/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Project deleted successfully!", { position: "top-right" });
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectKey?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Heading */}
      <h1 className="text-2xl font-bold text-black mb-6">Projects</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by name or key"
            className="border px-3 py-2 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="primary"
          size="medium"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Create Project
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading projects...</p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-gray-600">No projects found.</p>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow p-4"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(project.id)}
              >
                <div className="flex items-center gap-2">
                  {expandedId === project.id ? <ChevronDown /> : <ChevronRight />}
                  <h2 className="text-xl font-semibold">{project.name}</h2>
                  <span className="text-gray-500 text-sm">
                    ({project.projectKey})
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="bg-transparent hover:bg-transparent"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(project);
                    }}
                  >
                    <Pencil className="text-blue-600" size={14} />
                  </Button>
                  <Button
                    className="bg-transparent hover:bg-transparent"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                  >
                    <Trash className="text-red-500" size={14} />
                  </Button>
                </div>
              </div>

              {expandedId === project.id && (
                <div className="mt-4 border-t pt-4">
                  {editingProjectId === project.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        className="w-full border px-3 py-2 rounded-xl"
                        placeholder="Project Name"
                      />
                      <input
                        type="text"
                        name="projectKey"
                        value={formData.projectKey || ""}
                        onChange={handleInputChange}
                        className="w-full border px-3 py-2 rounded-xl"
                        placeholder="Project Key"
                      />
                      <textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleInputChange}
                        className="w-full border px-3 py-2 rounded-xl resize-none"
                        placeholder="Project Description"
                      />
                      <select
                        name="status"
                        value={formData.status || ""}
                        onChange={handleInputChange}
                        className="w-full border px-3 py-2 rounded-xl"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PLANNING">PLANNING</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                      <select
                        name="ownerId"
                        value={formData.ownerId || ""}
                        onChange={handleInputChange}
                        className="w-full border px-3 py-2 rounded-xl"
                      >
                        <option value="">Select Owner</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        {users.map((user) => (
                          <label
                            key={user.id}
                            className="flex gap-2 items-center text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={formData.memberIds?.includes(user.id)}
                              onChange={() => handleMemberToggle(user.id)}
                            />
                            {user.name} ({user.role})
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="success"
                          size="small"
                          onClick={() => submitEdit(project.id)}
                          disabled={isSubmitting}
                        >
                          <Check size={14} className="mr-1" />
                          {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={cancelEdit}
                        >
                          <X size={14} className="mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <strong>Description:</strong>{" "}
                        {project.description || "—"}
                      </p>
                      <p>
                        <strong>Status:</strong> {project.status}
                      </p>
                      <p>
                        <strong>Owner:</strong>{" "}
                        {project.owner?.name || "—"}
                      </p>
                      <div>
                        <strong>Members:</strong>
                        <ul className="ml-4 list-disc">
                          {project.members?.map((m) => (
                            <li key={m.id}>
                              {m.name} ({m.role})
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-4">
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          Go to Project Tabs
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={fetchProjects}
      />

      <ToastContainer position="top-right" />
    </div>
  );
};

export default ProjectList;
