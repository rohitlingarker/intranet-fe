import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Button from "../../../../components/Button/Button";
import { FiEye, FiEdit, FiTrash, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EditBugForm from "./EditBugForm";
import EditStoryForm from "./EditStoryForm";
import EditTaskForm from "./EditTaskForm";
import EditEpicForm from "./EditEpicForm";
import LoadingSpinner from "../../../../components/LoadingSpinner";

const IssueTracker = () => {
  const { projectId: paramProjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = location.state?.projectId || paramProjectId;

  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [editModal, setEditModal] = useState({ visible: false, type: null, id: null });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterBillable, setFilterBillable] = useState("");

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ===== FETCH ISSUES =====
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
        reporterName: e.reporterName || e.reporter?.name || "Not Applicable",
        assigneeName: e.assigneeName || e.assignee?.name || "Not Applicable",
        priority: e.priority || "MEDIUM",
        status: e.status || "BACKLOG",
        billable: e.billable || false,
      }));

      const storiesData = storiesRes.data.map((s) => ({
        ...s,
        type: "Story",
        title: s.title || s.name,
        reporterName: s.reporterName || s.reporter?.name || "Unassigned",
        assigneeName: s.assigneeName || s.assignee?.name || "Unassigned",
        priority: s.priority || "MEDIUM",
        status: s.status || "BACKLOG",
        createdAt: s.createdAt,
        dueDate: s.dueDate,
        billable: s.billable || false,
      }));

      const tasksData = tasksRes.data.map((t) => ({
        ...t,
        type: "Task",
        title: t.title || t.name,
        reporterName: t.reporterName || "Unassigned",
        assigneeName: t.assigneeName || "Unassigned",
        priority: t.priority || "MEDIUM",
        status: t.status || "BACKLOG",
        createdAt: t.createdAt,
        dueDate: t.dueDate,
        billable: t.billable || false,
      }));

      const bugsData = bugsRes.data.map((b) => ({
        ...b,
        type: "Bug",
        title: b.title || b.name,
        reporterName: b.reporterName || b.reporter?.name || "Unassigned",
        assigneeName: b.assigneeName || b.assignedTo?.name || "Unassigned",
        priority: b.priority || "MEDIUM",
        status: b.status || "OPEN",
        billable: b.billable || false,
      }));

      const allIssues = [...epicsData, ...storiesData, ...tasksData, ...bugsData];
      setIssues(allIssues);
      setFilteredIssues(allIssues);
    } catch (err) {
      console.error("Error fetching issues:", err);
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

  // ===== FILTER HANDLER =====
  useEffect(() => {
    let filtered = [...issues];
    if (searchTerm)
      filtered = filtered.filter((i) =>
        i.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (filterType) filtered = filtered.filter((i) => i.type === filterType);
    if (filterPriority) filtered = filtered.filter((i) => i.priority === filterPriority);
    if (filterStatus) filtered = filtered.filter((i) => i.status === filterStatus);
    if (filterUser)
      filtered = filtered.filter(
        (i) =>
          i.reporterName?.toLowerCase() === filterUser.toLowerCase() ||
          i.assigneeName?.toLowerCase() === filterUser.toLowerCase()
      );
    if (filterBillable)
      filtered = filtered.filter((i) =>
        filterBillable === "Yes" ? i.billable === true : i.billable === false
      );
    setFilteredIssues(filtered);
  }, [searchTerm, filterType, filterPriority, filterStatus, filterUser, filterBillable, issues]);

  // ===== DELETE ISSUE =====
  const handleDelete = async (issue) => {
    const confirmed = window.confirm(`Are you sure you want to delete this ${issue.type}?`);
    if (!confirmed) return;

    let endpoint = "";
    if (issue.type === "Epic") endpoint = `/api/epics/${issue.id}`;
    else if (issue.type === "Story") endpoint = `/api/stories/${issue.id}`;
    else if (issue.type === "Task") endpoint = `/api/tasks/${issue.id}`;
    else if (issue.type === "Bug") endpoint = `/api/bugs/${issue.id}`;

    try {
      await axios.delete(`${import.meta.env.VITE_PMS_BASE_URL}${endpoint}`, { headers });
      toast.success(`${issue.type} deleted successfully!`);
      setIssues((prev) => prev.filter((i) => !(i.id === issue.id && i.type === issue.type)));
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete ${issue.type}`);
    }
  };

  const handleEdit = (issue) => {
    setEditModal({ visible: true, type: issue.type, id: issue.id });
  };

  const handleUpdated = (updatedType) => {
    setEditModal({ visible: false, type: null, id: null });
    fetchIssues();
    toast.success(`${updatedType || "Issue"} updated successfully!`);
  };

  useEffect(() => {
    if (location.state?.createdIssueType) {
      toast.success(`${location.state.createdIssueType} created successfully!`);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const currentProject = projects.find((p) => p.id === Number(projectId));
  const projectName = currentProject ? currentProject.name : projectId;

  const userNames = Array.from(
    new Set(issues.flatMap((i) => [i.reporterName, i.assigneeName].filter(Boolean)))
  ).sort();

  // ===== COLOR HELPERS =====
  const typeColors = {
    Epic: "bg-purple-100 text-purple-700",
    Story: "bg-blue-100 text-blue-700",
    Task: "bg-green-100 text-green-700",
    Bug: "bg-rose-100 text-rose-700",
  };

  const rowColors = {
    Epic: "bg-purple-50",
    Story: "bg-blue-50",
    Task: "bg-green-50",
    Bug: "bg-rose-50",
  };

  const priorityColors = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-red-100 text-red-700",
  };

  const statusColors = {
    BACKLOG: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    REVIEW: "bg-amber-100 text-amber-700",
    DONE: "bg-green-100 text-green-700",
  };

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4 space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        pauseOnHover
        theme="colored"
        style={{ zIndex: 9999 }}
      />
      <div className="flex items-center justify-between sticky top-0 bg-white z-30 py-3 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-indigo-900">
          Issue Tracker ({projectName})
        </h1>
        <Button size="medium" variant="primary" onClick={() => navigate(-1)}>
          Back to Backlog
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-lg shadow-md flex flex-wrap gap-3 items-center border border-gray-100">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:ring-2 focus:ring-indigo-500"
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-48">
          <option value="">All Types</option>
          <option value="Epic">Epic</option>
          <option value="Story">Story</option>
          <option value="Task">Task</option>
          <option value="Bug">Bug</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-48">
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-48">
          <option value="">All Status</option>
          <option value="BACKLOG">Backlog</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="DONE">Done</option>
        </select>
        <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-48">
          <option value="">All Users</option>
          {userNames.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <select value={filterBillable} onChange={(e) => setFilterBillable(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-48">
          <option value="">All Billable</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        {(filterType || filterPriority || filterStatus || searchTerm || filterUser || filterBillable) && (
          <Button variant="secondary" size="small" onClick={() => {
            setSearchTerm(""); setFilterType(""); setFilterPriority("");
            setFilterStatus(""); setFilterUser(""); setFilterBillable("");
          }}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner text="Loading issues..." />
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
              <tr>
                <th className="border px-4 py-2 text-left">Title</th>
                <th className="border px-4 py-2 text-left">Type</th>
                <th className="border px-4 py-2 text-left">Priority</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Reporter</th>
                <th className="border px-4 py-2 text-left">Assignee</th>
                <th className="border px-4 py-2 text-left">Created On</th>
                <th className="border px-4 py-2 text-left">Due Date</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-6 text-center text-gray-500">
                    No issues found
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr
                    key={`${issue.type}-${issue.id}`}
                    className={`hover:bg-gray-100 transition ${rowColors[issue.type]}`}
                  >
                    <td className="border px-4 py-2 font-medium">{issue.title}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[issue.type]}`}>
                        {issue.type}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                        {issue.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="border px-4 py-2">{issue.reporterName}</td>
                    <td className="border px-4 py-2">{issue.assigneeName}</td>
                    <td className="border px-4 py-2">
                      {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="border px-4 py-2">
                      {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="border px-4 py-2 flex items-center gap-3">
                      <button
                        title="View"
                        onClick={() =>
                          navigate(`/projects/${projectId}/issues/${issue.type.toLowerCase()}/${issue.id}/view`, {
                            state: { issue },
                          })
                        }
                      >
                        <FiEye className="text-blue-600" />
                      </button>
                      <button title="Edit" onClick={() => handleEdit(issue)}>
                        <FiEdit className="text-green-600" />
                      </button>
                      <button title="Delete" onClick={() => handleDelete(issue)}>
                        <FiTrash className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.visible && (
        <Modal onClose={() => setEditModal({ visible: false, type: null, id: null })}>
          {editModal.type === "Bug" && (
            <EditBugForm
              bugId={editModal.id}
              projectId={projectId}
              onClose={() => setEditModal({ visible: false, type: null, id: null })}
              onUpdated={() => handleUpdated("Bug")}
            />
          )}
          {editModal.type === "Story" && (
            <EditStoryForm
              storyId={editModal.id}
              projectId={projectId}
              onClose={() => setEditModal({ visible: false, type: null, id: null })}
              onUpdated={() => handleUpdated("Story")}
            />
          )}
          {editModal.type === "Task" && (
            <EditTaskForm
              taskId={editModal.id}
              projectId={projectId}
              onClose={() => setEditModal({ visible: false, type: null, id: null })}
              onUpdated={() => handleUpdated("Task")}
            />
          )}
          {editModal.type === "Epic" && (
            <EditEpicForm
              epicId={editModal.id}
              projectId={projectId}
              onClose={() => setEditModal({ visible: false, type: null, id: null })}
              onUpdated={() => handleUpdated("Epic")}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-auto max-w-2xl relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
      >
        <FiX />
      </button>
      {children}
    </div>
  </div>
);

export default IssueTracker;
