import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import CreateProjectModal from "./CreateProjectModal";
import ManageStatusesModal from "./ManageStatusesModal";
import Button from "../../../components/Button/Button";
import ThreeCard from "../../../components/Cards/ThreeCards";
import Pagination from "../../../components/Pagination/pagination";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Bell,
  ListTodo,
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash,
} from "lucide-react";

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [formData, setFormData] = useState({});
  const [users, setUsers] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);

  const [dashboardData, setDashboardData] = useState(null);
  const [reminders, setReminders] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Fetch Projects (Owner + Member)
  const fetchProjects = async (status) => {
    setLoading(true);
    try {
      const base = import.meta.env.VITE_PMS_BASE_URL;
      const headers = { Authorization: `Bearer ${token}` };

      const ownerUrl =
        status && status !== "All"
          ? `${base}/api/projects/owner?status=${status}`
          : `${base}/api/projects/owner`;
      const ownerRes = await axios.get(ownerUrl, { headers });

      let memberRes = { data: [] };
      if (user?.user_id) {
        const memberUrl = `${base}/api/projects/member/${user.user_id}`;
        memberRes = await axios.get(memberUrl, { headers });
      }

      const allProjects = [...ownerRes.data, ...memberRes.data];
      const uniqueProjects = Array.from(
        new Map(allProjects.map((p) => [p.id, p])).values()
      );

      setProjects(uniqueProjects);
    } catch (error) {
      console.error("❌ Failed to fetch projects", error);
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/users?page=0&size=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setUsers(data);
    } catch (err) {
      console.error("❌ Failed to fetch users", err);
    }
  };

  // ✅ Fetch Dashboard Summary
  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/dashboard/summary/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDashboardData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setDashboardLoading(false);
    }
  };

  // ✅ Fetch Reminders
  const fetchReminders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/dashboard/reminders/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReminders(res.data);
    } catch (err) {
      console.error("Failed to fetch reminders:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchDashboard();
    fetchReminders();
  }, []);

  useEffect(() => {
    fetchProjects(filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ✅ Expand/Collapse
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setEditingProjectId(null);
  };

  // ✅ Edit Handlers
  const startEdit = (project) => {
    setExpandedId(project.id);
    setEditingProjectId(project.id);
    setFormData({
      name: project.name || "",
      projectKey: project.projectKey || "",
      description: project.description || "",
      status: project.status || "ACTIVE",
      currentStage: project.currentStage || "INITIATION",
      ownerId: project.owner?.id || user?.user_id || "",
      memberIds: project.members?.map((m) => m.id) || [],
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      endDate: project.endDate ? project.endDate.split("T")[0] : "",
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

  // ✅ Update Project
  const submitEdit = async (projectId) => {
    try {
      setIsSubmitting(true);
      const updatedProjectData = {
        ...formData,
        ownerId: Number(formData.ownerId),
        memberIds: formData.memberIds.map(Number),
        startDate: formData.startDate ? `${formData.startDate}T00:00:00` : null,
        endDate: formData.endDate ? `${formData.endDate}T00:00:00` : null,
      };

      const res = await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}`,
        updatedProjectData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...res.data } : p))
      );
      toast.success("Project updated successfully!");
      setEditingProjectId(null);
    } catch (err) {
      console.error("❌ Update failed", err);
      toast.error("Failed to update project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Delete Project
  const handleDelete = async (projectId) => {
    if (!window.confirm("🗑️ Delete this project?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Project deleted successfully!");
    } catch (err) {
      console.error("❌ Delete failed", err);
      toast.error("Failed to delete project.");
    }
  };

  // ✅ Handle successful project creation
  const handleProjectCreated = (newProject) => {
    fetchProjects(filterStatus); // Refresh the project list
    setIsCreateModalOpen(false); // Close the create modal
    setSelectedProjectId(newProject.id); // Set the ID for the status modal
    setIsStatusModalOpen(true); // Open the status modal
  };

  // ✅ Filter + Pagination
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectKey?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" ? true : p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLast = currentPage * projectsPerPage;
  const indexOfFirst = indexOfLast - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Project Dashboard</h1>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/block-leave-dates/${user?.user_id}`)}
            variant="secondary"
            size="medium"
          >
            Manage Leave Blocks
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="medium"
          >
            + Create Project
          </Button>
        </div>
      </div>

      {/* DASHBOARD SUMMARY */}
      {/* {dashboardLoading ? (
        <p className="text-gray-600">Loading summary...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
            <ThreeCard title="Projects" value={dashboardData?.totalProjects} />
            <ThreeCard title="Tasks" value={dashboardData?.totalTasks} />
            <ThreeCard title="Epics" value={dashboardData?.totalEpics} />
            <ThreeCard title="Stories" value={dashboardData?.totalStories} />
          </div> */}

          {/* REMINDERS */}
          {/* <div className="mb-6 bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" /> Reminders
            </h3>
            {reminders ? (
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  {reminders?.taskDueSoonCount ?? 0} tasks due soon
                </li>
                <li className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-blue-600" />
                  {reminders?.todoTaskCount ?? 0} tasks in TODO
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  {reminders?.todoStoryCount ?? 0} stories in TODO
                </li>
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Loading reminders...</p>
            )}
          </div>
        </>
      )} */}

      {/* PROJECT LIST SECTION */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">All Projects</h2>

        {/* Search + Filter */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search by name or key"
            className="border px-3 py-2 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          >
            <option value="All">All</option>
            <option value="ACTIVE">Active</option>
            <option value="PLANNING">Planning</option>
            <option value="ARCHIVED">Archived</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-gray-600">Loading projects...</p>
        ) : currentProjects.length === 0 ? (
          <p className="text-gray-600">No projects found.</p>
        ) : (
          <div className="space-y-4">
            {currentProjects.map((project) => (
              <div key={project.id} className="bg-gray-50 rounded-xl p-4">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(project.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedId === project.id ? <ChevronDown /> : <ChevronRight />}
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <span className="text-gray-500 text-sm">
                      ({project.projectKey})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      className="bg-transparent hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(project);
                      }}
                    >
                      <Pencil className="text-blue-600" size={14} />
                    </Button>
                    <Button
                      size="small"
                      className="bg-transparent hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                    >
                      <Trash className="text-red-500" size={14} />
                    </Button>
                  </div>
                </div>

                {/* Expanded Section */}
                {expandedId === project.id && (
                  <div className="mt-3 border-t pt-3 text-sm text-gray-700">
                    {editingProjectId === project.id ? (
                      <>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="border px-2 py-1 rounded w-full mb-2"
                          placeholder="Project Name"
                        />
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="border px-2 py-1 rounded w-full mb-2"
                          placeholder="Description"
                        />
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="border px-2 py-1 rounded w-full mb-2"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="PLANNING">Planning</option>
                          <option value="ARCHIVED">Archived</option>
                          <option value="COMPLETED">Completed</option>
                        </select>

                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="small" onClick={cancelEdit}>
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => submitEdit(project.id)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p><strong>Description:</strong> {project.description || "—"}</p>
                        <p><strong>Status:</strong> {project.status}</p>
                        <p><strong>Owner:</strong> {project.owner?.name || "—"}</p>
                        <p><strong>Members:</strong>{" "}
                          {project.members?.length
                            ? project.members.map((m) => m.name).join(", ")
                            : "None"}
                        </p>
                        <Button
                          variant="primary"
                          size="small"
                          className="mt-3"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          Open Project
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          />
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
      <ManageStatusesModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        projectId={selectedProjectId}
      />
      <ToastContainer position="top-right" />
    </div>
  );
};

export default ProjectDashboard;
