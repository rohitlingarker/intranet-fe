import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Button from "../../../../components/Button/Button";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditBugForm from "./EditBugForm"; // ✅ Import

const IssueTracker = () => {
  const { projectId: paramProjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = location.state?.projectId || paramProjectId;

  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  // For Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBugId, setEditingBugId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ===== FETCH ALL ISSUES =====
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const [epicsRes, storiesRes, tasksRes, bugsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`, { headers }),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`, { headers }),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`, { headers }),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/bugs/project/${projectId}`, { headers }),
      ]);

      const epicsData = epicsRes.data.map((e) => ({
        ...e,
        title: e.name,
        type: "Epic",
        projectName: e.project?.name || "",
      }));

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

      const bugsData = bugsRes.data.map((b) => ({
        ...b,
        type: "Bug",
        reporterName: b.reporterName || b.reporter?.name || "",
        assigneeName: b.assigneeName || b.assignedTo?.name || "",
        projectName: b.project?.name || "",
        priority: b.priority || "MEDIUM",
        status: b.status || "OPEN",
      }));

      const allIssues = [...epicsData, ...storiesData, ...tasksData, ...bugsData];
      setIssues(allIssues);
      setFilteredIssues(allIssues);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  // ===== FETCH PROJECTS =====
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, { headers });
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchIssues();
      fetchProjects();
    }
  }, [projectId]);

  // ===== FILTERS =====
  useEffect(() => {
    let filtered = [...issues];
    if (searchTerm)
      filtered = filtered.filter((i) =>
        i.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (filterType) filtered = filtered.filter((i) => i.type === filterType);
    if (filterPriority) filtered = filtered.filter((i) => i.priority === filterPriority);
    if (filterStatus) filtered = filtered.filter((i) => i.status === filterStatus);
    setFilteredIssues(filtered);
  }, [searchTerm, filterType, filterPriority, filterStatus, issues]);

  // ===== DELETE =====
  const handleDelete = async (issue) => {
    if (!window.confirm(`Are you sure you want to delete this ${issue.type}?`)) return;

    let endpoint = "";
    if (issue.type === "Epic") endpoint = `/api/epics/${issue.id}`;
    else if (issue.type === "Story") endpoint = `/api/stories/${issue.id}`;
    else if (issue.type === "Task") endpoint = `/api/tasks/${issue.id}`;
    else if (issue.type === "Bug") endpoint = `/api/bugs/${issue.id}`;
    else {
      toast.error("Unknown issue type!");
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_PMS_BASE_URL}${endpoint}`, { headers });
      toast.success(`${issue.type} deleted successfully!`);
      setIssues((prev) => prev.filter((i) => !(i.type === issue.type && i.id === issue.id)));
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete ${issue.type}`);
    }
  };

  // ===== EDIT (BUG ONLY) =====
  const handleEdit = (issue) => {
    if (issue.type !== "Bug") {
      toast.info("Editing is available only for bugs currently");
      return;
    }
    setEditingBugId(issue.id);
    setShowEditModal(true);
  };

  const handleBugUpdated = () => {
    setShowEditModal(false);
    setEditingBugId(null);
    fetchIssues(); // refresh after update
  };

  // ===== PROJECT NAME =====
  const currentProject = projects.find((p) => p.id === Number(projectId));
  const projectName = currentProject ? currentProject.name : projectId;

  // ===== STATS =====
  const totalIssues = issues.length;
  const openIssues = issues.filter((i) => ["OPEN", "TODO", "BACKLOG"].includes(i.status)).length;
  const inProgress = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const review = issues.filter((i) => i.status === "REVIEW").length;
  const resolved = issues.filter((i) => ["RESOLVED", "DONE", "CLOSED"].includes(i.status)).length;
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <SummaryCard title="Total Issues" count={totalIssues} />
        <SummaryCard title="Open / Todo / Backlog" count={openIssues} />
        <SummaryCard title="In Progress" count={inProgress} />
        <SummaryCard title="In Review" count={review} />
        <SummaryCard title="Resolved / Done" count={resolved} />
        <SummaryCard title="High Priority" count={highPriority} />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <select
          className="border p-2 rounded"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Epic">Epic</option>
          <option value="Story">Story</option>
          <option value="Task">Task</option>
          <option value="Bug">Bug</option>
        </select>
        <select
          className="border p-2 rounded"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <select
          className="border p-2 rounded"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="BACKLOG">Backlog</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DONE">Done</option>
          <option value="CLOSED">Closed</option>
          <option value="BLOCKED">Blocked</option>
        </select>
        {(filterType || filterPriority || filterStatus || searchTerm) && (
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setSearchTerm("");
              setFilterType("");
              setFilterPriority("");
              setFilterStatus("");
            }}
          >
            Clear Filters
          </Button>
        )}
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
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500 italic">
                    No issues found
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr
                    key={`${issue.type}-${issue.id}`}
                    className={`hover:bg-gray-50 transition ${
                      issue.type === "Epic"
                        ? "bg-purple-50"
                        : issue.type === "Bug"
                        ? "bg-red-50"
                        : ""
                    }`}
                  >
                    <td className="border px-4 py-2 font-semibold text-indigo-900">
                      {issue.title}
                    </td>
                    <td className="border px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          issue.type === "Epic"
                            ? "bg-purple-200 text-purple-900"
                            : issue.type === "Story"
                            ? "bg-blue-200 text-blue-900"
                            : issue.type === "Task"
                            ? "bg-green-200 text-green-900"
                            : "bg-red-200 text-red-900"
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

      {/* ✅ Edit Bug Modal */}
      {showEditModal && editingBugId && (
        <EditBugForm
          bugId={editingBugId}
          projectId={projectId} // ✅ Pass projectId prop
          onClose={() => setShowEditModal(false)}
          onUpdated={handleBugUpdated}
        />
      )}
    </div>
  );
};

// ===== Helper Components =====
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
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[priority] || "bg-gray-100 text-gray-600"
      }`}
    >
      {priority || "-"}
    </span>
  );
};

const BadgeStatus = ({ status }) => {
  const colors = {
    BACKLOG: "bg-gray-200 text-gray-700",
    OPEN: "bg-yellow-100 text-yellow-700",
    TODO: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    REVIEW: "bg-purple-100 text-purple-700",
    RESOLVED: "bg-green-100 text-green-700",
    DONE: "bg-green-200 text-green-800",
    CLOSED: "bg-gray-300 text-gray-800",
    REOPENED: "bg-orange-100 text-orange-700",
    BLOCKED: "bg-red-200 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "-"}
    </span>
  );
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
