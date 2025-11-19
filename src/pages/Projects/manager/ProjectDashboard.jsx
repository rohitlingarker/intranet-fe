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
import { MoreVertical } from "lucide-react";
import LoadingSpinner from "../../../components/LoadingSpinner";
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

// Add this at the very top of your file, after imports, but before `const ProjectDashboard = () => {`
const ProjectMenu = ({ project, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-3 right-3">
      <button
        onClick={(e) => {
          e.stopPropagation(); // ⛔ Prevent card navigation
          setOpen((prev) => !prev);
        }}
        className="p-1 rounded-full hover:bg-gray-100"
      >
        <MoreVertical className="h-5 w-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <button
            onClick={(e) => {
              e.stopPropagation(); // ⛔ Prevent card navigation
              onEdit(project);
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // ⛔ Prevent card navigation
              onDelete(project.id);
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};


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
  const [projectsPerPage] = useState(6);

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

    let url = `${base}/api/projects/access`;
    if (status && status !== "All") url += `?status=${status}`;

    const { data } = await axios.get(url, { headers });

    setProjects(data);
  } catch (error) {
    console.error("❌ Failed to load projects", error);
    toast.error("Failed to load projects.");
  } finally {
    setLoading(false);
  }
};


  // ✅ Fetch Users
  // const fetchUsers = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${import.meta.env.VITE_PMS_BASE_URL}/api/users?page=0&size=100`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     const data = Array.isArray(res.data) ? res.data : res.data.content || [];
  //     setUsers(data);
  //   } catch (err) {
  //     console.error("❌ Failed to fetch users", err);
  //   }
  // };

  // ✅ Fetch Dashboard Summary
  // const fetchDashboard = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${import.meta.env.VITE_PMS_BASE_URL}/api/dashboard/summary/`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     setDashboardData(res.data);
  //   } catch (err) {
  //     console.error("Failed to fetch dashboard data:", err);
  //   } finally {
  //     setDashboardLoading(false);
  //   }
  // };

  // ✅ Fetch Reminders
  // const fetchReminders = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${import.meta.env.VITE_PMS_BASE_URL}/api/dashboard/reminders/`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     setReminders(res.data);
  //   } catch (err) {
  //     console.error("Failed to fetch reminders:", err);
  //   }
  // };

  useEffect(() => {
    fetchProjects();
    // fetchUsers();
    // fetchDashboard();
    // fetchReminders();
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

  // ⭐ ADD THIS ABOVE handleDelete
  const confirmDeleteToast = (onConfirm) => {
    toast.warn(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-red-600"> Delete this project?</p>

          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200"
              onClick={closeToast}
            >
              Cancel
            </button>

            <button
              className="px-3 py-1 rounded bg-red-600 text-white"
              onClick={() => {
                onConfirm();
                closeToast();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        closeOnClick: false,
        autoClose: false,
        position: "top-center",
      }
    );
  };


  // ✅ Delete Project
  // ⭐ REPLACE handleDelete WITH THIS
  const handleDelete = (projectId) => {
    confirmDeleteToast(async () => {
      try {
        await axios.delete(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        toast.success("Project deleted successfully!");
      } catch (err) {
        console.error("❌ Delete failed", err);
        toast.error("Failed to delete project.",err);
      }
    });
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/block-leave-dates/${user?.user_id}`)}
            variant="secondary"
            size="medium"
          >
            Manage Leave Blocks
          </Button>
          <Button
            onClick={() => {
              // Reset form for creating a new project
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
              setEditingProjectId(null); // make sure it’s not in edit mode
              setIsCreateModalOpen(true); // open modal
            }}
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
      <div className="bg-gray-50 rounded-2xl shadow-none p-6">
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
            className="border w-40 h-10 px-3 py-2 rounded-xl"
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
          <LoadingSpinner text="Loading projects..." />
        ) : currentProjects.length === 0 ? (
          <p className="text-gray-600">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col justify-between"
              >
                {/* 3 Dots Menu */}
                {project.status !== "COMPLETED" && (
                  <ProjectMenu
                    project={project}
                    onEdit={(p) => {
                      startEdit(p);        // set the editing project
                      setIsCreateModalOpen(true); // open the modal
                    }}
                    onDelete={handleDelete}
                  />
                )}



                {/* Project Info */}
                <div>
                  <h3 className="text-xl font-semibold text-indigo-700 mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">Key: {project.projectKey}</p>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {project.description || "No description available."}
                  </p>
                </div>

                {/* Status + View Button */}
                <div className="mt-4 flex justify-between items-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      project.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : project.status === "PLANNING"
                        ? "bg-yellow-100 text-yellow-700"
                        : project.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {project.status}
                  </span>

                  {/* <Button
                    variant="primary"
                    size="small"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    View
                  </Button> */}
                </div>
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
        editingProjectId={editingProjectId}
        formData={editingProjectId ? formData : null}
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
