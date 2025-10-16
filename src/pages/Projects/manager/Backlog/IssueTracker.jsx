import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Button from "../../../../components/Button/Button";
import { FiEye, FiEdit, FiCheckCircle, FiTrash } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateIssueForm from "../Backlog/CreateIssueForm";

const IssueTracker = () => {
  const { projectId: paramProjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = location.state?.projectId || paramProjectId;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);

  // Form dropdowns
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [epics, setEpics] = useState([]);
  const [sprints, setSprints] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // Fetch issues
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const [epicsRes, storiesRes, tasksRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`, { headers }),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`, { headers }),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`, { headers }),
      ]);

      const epicsData = epicsRes.data.map((e) => ({ ...e, title: e.name, type: "Epic", projectName: e.project?.name || "" }));
      const storiesData = storiesRes.data.map((s) => ({
        ...s,
        type: "Story",
        reporterName: s.reporter?.name || s.reporter?.username || "",
        assigneeName: s.assignee?.name || s.assignee?.username || "",
        projectName: s.project?.name || "",
      }));
      const tasksData = tasksRes.data.map((t) => ({
        ...t,
        type: "Task",
        reporterName: t.reporter?.name || t.reporter?.username || "",
        assigneeName: t.assignee?.name || t.assignee?.username || "",
        projectName: t.project?.name || "",
      }));

      setIssues([...epicsData, ...storiesData, ...tasksData]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  // Fetch form options
  const fetchFormOptions = async () => {
    try {
      const [projectsRes, usersRes, epicsRes, sprintsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, { headers }),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users`, { headers }),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`, { headers }),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`, { headers }),
      ]);

      setProjects(projectsRes.data || []);
      setUsers(usersRes.data || []);
      setEpics(epicsRes.data || []);
      setSprints(sprintsRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load form options");
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchIssues();
      fetchFormOptions();
    }
  }, [projectId]);

  // ====== EDIT ======
  const handleEdit = (issue) => {
    let initialData = {};
    if (issue.type === "Epic") {
      initialData = {
        id: issue.id,
        title: issue.name || issue.title,
        description: issue.description || "",
        progressPercentage: issue.progressPercentage || 0,
        projectId,
        reporterId: issue.reporter?.id || "",
        dueDate: issue.dueDate ? issue.dueDate.split("T")[0] : "",
      };
    } else if (issue.type === "Story") {
      initialData = {
        id: issue.id,
        title: issue.title,
        description: issue.description || "",
        status: issue.status || "BACKLOG",
        priority: issue.priority || "MEDIUM",
        storyPoints: issue.storyPoints || 0,
        acceptanceCriteria: issue.acceptanceCriteria || "",
        epicId: issue.epicId || null,
        reporterId: issue.reporter?.id || "",
        assigneeId: issue.assignee?.id || null,
        sprintId: issue.sprint?.id || null,
        projectId,
        dueDate: issue.dueDate ? issue.dueDate.split("T")[0] : "",
      };
    } else if (issue.type === "Task") {
      initialData = {
        id: issue.id,
        title: issue.title,
        description: issue.description || "",
        status: issue.status || "TODO",
        priority: issue.priority || "MEDIUM",
        storyPoints: issue.storyPoints || 0,
        storyId: issue.storyId || null,
        reporterId: issue.reporter?.id || "",
        assigneeId: issue.assignee?.id || null,
        sprintId: issue.sprint?.id || null,
        projectId,
        dueDate: issue.dueDate ? issue.dueDate.split("T")[0] : "",
      };
    }
    setEditItem({ type: issue.type, initialData });
  };

  const handleEditClose = () => {
    setEditItem(null);
    fetchIssues();
  };

  // ====== DELETE ======
  const handleDelete = async (issue) => {
    let endpoint = "";
    if (issue.type === "Epic") endpoint = `/api/epics/${issue.id}`;
    if (issue.type === "Story") endpoint = `/api/stories/${issue.id}`;
    if (issue.type === "Task") endpoint = `/api/tasks/${issue.id}`;

    try {
      await axios.delete(`${import.meta.env.VITE_PMS_BASE_URL}${endpoint}`, { headers });
      toast.success(`${issue.type} deleted successfully!`);
      fetchIssues();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete ${issue.type}`);
    }
  };

  // ===== Project name for header =====
  const currentProject = projects.find((p) => p.id === Number(projectId));
  const projectName = currentProject ? currentProject.name : projectId;

  // Stats
  const totalIssues = issues.length;
  const openIssues = issues.filter((i) => ["OPEN", "TODO", "BACKLOG"].includes(i.status)).length;
  const inProgress = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const review = issues.filter((i) => i.status === "REVIEW").length;
  const resolved = issues.filter((i) => ["RESOLVED", "COMPLETED", "DONE"].includes(i.status)).length;
  const highPriority = issues.filter((i) => ["HIGH", "CRITICAL"].includes(i.priority)).length;

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4 space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-indigo-900">
          Issue Tracker ({projectName})
        </h1>
        <Button size="medium" variant="primary" onClick={() => navigate(-1)}>
          Back to Backlog
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <SummaryCard title="Total Issues" count={totalIssues} />
        <SummaryCard title="Open / Todo/Backlog" count={openIssues} />
        <SummaryCard title="In Progress" count={inProgress} />
        <SummaryCard title="In Review" count={review} />
        <SummaryCard title="Resolved / Done" count={resolved} />
        <SummaryCard title="High Priority" count={highPriority} />
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-4">Loading issues...</p>
        ) : (
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border px-4 py-2 text-left">Title</th>
                <th className="border px-4 py-2 text-left">Type</th>
                <th className="border px-4 py-2 text-left">Priority</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Reporter</th>
                <th className="border px-4 py-2 text-left">Assigned To</th>
                <th className="border px-4 py-2 text-left">Created On</th>
                <th className="border px-4 py-2 text-left">Due Date</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500 italic">
                    No issues found
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr
                    key={`${issue.type}-${issue.id}`}
                    className={`hover:bg-gray-50 transition ${issue.type === "Epic" ? "bg-purple-50" : ""}`}
                  >
                    <td className="border px-4 py-2 font-semibold text-indigo-900">{issue.title}</td>
                    <td className="border px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          issue.type === "Epic"
                            ? "bg-purple-200 text-purple-900"
                            : issue.type === "Story"
                            ? "bg-blue-200 text-blue-900"
                            : "bg-green-200 text-green-900"
                        }`}
                      >
                        {issue.type}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <BadgePriority priority={issue.priority} />
                    </td>
                    <td className="border px-4 py-2">
                      <BadgeStatus status={issue.status} />
                    </td>
                    <td className="border px-4 py-2">{issue.reporterName || "-"}</td>
                    <td className="border px-4 py-2">{issue.assigneeName || "-"}</td>
                    <td className="border px-4 py-2">
                      {issue.createdOn ? new Date(issue.createdOn).toLocaleDateString() : "-"}
                    </td>
                    <td className="border px-4 py-2">
                      {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="border px-4 py-2 flex items-center gap-3">
                      <ActionIcon
                        label="View"
                        onClick={() =>
                          navigate(
                            `/projects/${projectId}/issues/${issue.type.toLowerCase()}/${issue.id}/view`,
                            { state: { issue } }
                          )
                        }
                      >
                        <FiEye size={18} className="text-blue-600" />
                      </ActionIcon>
                      <ActionIcon label="Edit" onClick={() => handleEdit(issue)}>
                        <FiEdit size={18} className="text-green-600" />
                      </ActionIcon>
                      <ActionIcon label="Mark Complete">
                        <FiCheckCircle size={18} className="text-yellow-600" />
                      </ActionIcon>
                      <ActionIcon label="Delete" onClick={() => handleDelete(issue)}>
                        <FiTrash size={18} className="text-red-600" />
                      </ActionIcon>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-lg relative">
            <button onClick={() => setEditItem(null)} className="absolute top-2 right-2">
              ✖
            </button>
            <CreateIssueForm
              mode="edit"
              issueType={editItem.type === "Story" ? "User Story" : editItem.type === "Task" ? "Task" : "Epic"}
              initialData={editItem.initialData}
              projects={projects}
              users={users}
              epics={epics}
              sprints={sprints}
              onClose={handleEditClose}
              onCreated={handleEditClose}
              projectId={projectId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Helpers =====
const SummaryCard = ({ title, count }) => (
  <div className="border-2 border-gray-200 rounded-lg p-4 text-center bg-white shadow-sm">
    <h4 className="text-sm font-medium text-gray-600">{title}</h4>
    <p className="text-2xl font-bold text-indigo-900">{count}</p>
  </div>
);

const BadgePriority = ({ priority }) => {
  const colors = {
    LOW: "bg-gray-100 text-gray-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-red-600 text-white",
  };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority] || "bg-gray-100 text-gray-600"}`}>{priority || "-"}</span>;
};

const BadgeStatus = ({ status }) => {
  const colors = {
    BACKLOG: "bg-gray-200 text-gray-700",
    OPEN: "bg-yellow-100 text-yellow-700",
    TODO: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    REVIEW: "bg-purple-100 text-purple-700",
    RESOLVED: "bg-green-100 text-green-700",
    COMPLETED: "bg-green-200 text-green-800",
    CLOSED: "bg-gray-300 text-gray-800",
    REOPENED: "bg-orange-100 text-orange-700",
    BLOCKED: "bg-red-200 text-red-800",
  };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>{status || "-"}</span>;
};

const ActionIcon = ({ label, onClick, children }) => (
  <div className="relative group">
    <button onClick={onClick} className="hover:scale-110 transition">
      {children}
    </button>
    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
      {label}
    </span>
  </div>
);

export default IssueTracker;
