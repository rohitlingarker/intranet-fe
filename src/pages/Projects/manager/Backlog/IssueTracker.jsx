import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Routes, Route } from "react-router-dom";
import axios from "axios";
import Button from "../../../../components/Button/Button";
import { FiEdit, FiTrash, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EditBugForm from "./EditBugForm";
import EditStoryForm from "./EditStoryForm";
import EditTaskForm from "./EditTaskForm";
import EditEpicForm from "./EditEpicForm";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import ViewSheet from "./ViewSheet";

const IssueTracker = () => {
  const { projectId: paramProjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = location.state?.projectId || paramProjectId;

  const [issues, setIssues] = useState({
    epicsData: [],
    storiesData: [],
    tasksData: [],
    bugsData: [],
  });

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [editModal, setEditModal] = useState({ visible: false, type: null, id: null });

  const [openEpics, setOpenEpics] = useState([]);
  const [openStories, setOpenStories] = useState([]);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

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
        type: "Epic",
        title: e.name,
        reporterName: e.reporterName || e.reporter?.name || "Not Applicable",
        assigneeName: e.assigneeName || e.assignee?.name || "Not Applicable",
        priority: e.priority || "MEDIUM",
        status: e.status || "BACKLOG",
      }));

      const storiesData = storiesRes.data.map((s) => ({
        ...s,
        type: "Story",
        title: s.title || s.name,
        epicId: s.epic?.id ?? null,
        reporterName: s.reporterName || s.reporter?.name || "Unassigned",
        assigneeName: s.assigneeName || s.assignee?.name || "Unassigned",
        priority: s.priority || "MEDIUM",
        status: s.status?.name || "BACKLOG",
      }));

      const tasksData = tasksRes.data.map((t) => ({
        ...t,
        type: "Task",
        title: t.title,
        storyId: t.story?.id ?? null,
        reporterName: t.reporterName || t.reporter?.name || "Unassigned",
        assigneeName: t.assigneeName || t.assignee?.name || "Unassigned",
        priority: t.priority || "MEDIUM",
        status: t.status || "BACKLOG",
      }));

      const bugsData = bugsRes.data.map((b) => ({
        ...b,
        type: "Bug",
        title: b.title,
        reporterName: b.reporterName || b.reporter?.name || "Unassigned",
        assigneeName: b.assigneeName || b.assignedTo?.name || "Unassigned",
        priority: b.priority || "MEDIUM",
        status: b.status || "OPEN",
      }));

      setIssues({ epicsData, storiesData, tasksData, bugsData });
    } catch (err) {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, { headers });
      setProjects(res.data || []);
    } catch (err) {
      toast.error("Failed to load projects");
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchIssues();
      fetchProjects();
    }
  }, [projectId]);

  const handleDelete = async (issue) => {
    const confirmed = window.confirm(`Delete this ${issue.type}?`);
    if (!confirmed) return;

    let endpoint = "";
    if (issue.type === "Epic") endpoint = `/api/epics/${issue.id}`;
    if (issue.type === "Story") endpoint = `/api/stories/${issue.id}`;
    if (issue.type === "Task") endpoint = `/api/tasks/${issue.id}`;
    if (issue.type === "Bug") endpoint = `/api/bugs/${issue.id}`;

    try {
      await axios.delete(`${import.meta.env.VITE_PMS_BASE_URL}${endpoint}`, { headers });
      fetchIssues();
      toast.success(`${issue.type} deleted`);
    } catch (err) {
      toast.error(`Failed to delete ${issue.type}`);
    }
  };

  const handleEdit = (issue) => setEditModal({ visible: true, type: issue.type, id: issue.id });
  const handleUpdated = (msg) => {
    setEditModal({ visible: false });
    fetchIssues();
    toast.success(`${msg} updated`);
  };

  const handleView = (issue) => {
    navigate(`/projects/${projectId}/issues/${issue.type.toLowerCase()}/${issue.id}/view`, {
      state: { issue },
    });
  };

  const currentProject = projects.find((p) => p.id === Number(projectId));
  const projectName = currentProject?.name || projectId;

  const typeColors = {
    Epic: "bg-purple-200 text-purple-800",
    Story: "bg-blue-200 text-blue-800",
    Task: "bg-green-200 text-green-800",
    Bug: "bg-rose-200 text-rose-800",
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
    OPEN: "bg-red-100 text-red-700",
  };

  const toggleEpic = (id) =>
    setOpenEpics((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggleStory = (id) =>
    setOpenStories((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const TableRow = ({ issue, level }) => (
    <tr
      className="hover:bg-gray-50 border-b cursor-pointer"
      onClick={() => handleView(issue)}
    >
      {/* Title with indentation only */}
      <td className="py-3">
        <div className="flex items-center gap-2">
          <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center gap-2">
            {/* Arrow only for expandable types */}
            {(issue.type === "Epic" || issue.type === "Story") && (
              <span
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  issue.type === "Epic" ? toggleEpic(issue.id) : toggleStory(issue.id);
                }}
              >
                {(issue.type === "Epic" && openEpics.includes(issue.id)) ||
                (issue.type === "Story" && openStories.includes(issue.id))
                  ? "▼"
                  : "▶"}
              </span>
            )}

            <span className="font-medium">{issue.title}</span>
          </div>
        </div>
      </td>

      <td>
        <span className={`px-2 py-1 rounded text-xs ${typeColors[issue.type]}`}>
          {issue.type}
        </span>
      </td>

      <td>
        <span className={`px-2 py-1 rounded text-xs ${priorityColors[issue.priority]}`}>
          {issue.priority}
        </span>
      </td>

      <td>
        <span className={`px-2 py-1 rounded text-xs ${statusColors[issue.status]}`}>
          {issue.status.replace("_", " ")}
        </span>
      </td>

      <td className="text-sm">{issue.assigneeName}</td>
      <td className="text-sm">{issue.reporterName}</td>

      <td className="flex gap-2 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(issue);
          }}
        >
          <FiEdit className="text-green-600" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(issue);
          }}
        >
          <FiTrash className="text-red-600" />
        </button>
      </td>
    </tr>
  );

  const renderHierarchy = () => (
    <table className="w-full text-left border rounded-lg shadow">
      <thead className="bg-gray-100 text-sm font-semibold text-gray-700">
        <tr>
          <th className="py-3 px-2 w-1/3">Title</th>
          <th className="px-2 w-20">Type</th>
          <th className="px-2 w-20">Priority</th>
          <th className="px-2 w-24">Status</th>
          <th className="px-2 w-32">Assignee</th>
          <th className="px-2 w-32">Reporter</th>
          <th className="px-2 w-24">Actions</th>
        </tr>
      </thead>

      <tbody>
        {issues.epicsData.map((epic) => (
          <React.Fragment key={`E-${epic.id}`}>
            <TableRow issue={epic} level={0} />

            {openEpics.includes(epic.id) &&
              issues.storiesData
                .filter((s) => s.epicId === epic.id)
                .map((story) => (
                  <React.Fragment key={`S-${story.id}`}>
                    <TableRow issue={story} level={1} />

                    {openStories.includes(story.id) &&
                      issues.tasksData
                        .filter((t) => t.storyId === story.id)
                        .map((task) => (
                          <TableRow key={`T-${task.id}`} issue={task} level={2} />
                        ))}
                  </React.Fragment>
                ))}
          </React.Fragment>
        ))}

        {/* Stories without epic */}
        {issues.storiesData
          .filter((s) => !s.epicId)
          .map((story) => (
            <React.Fragment key={`OS-${story.id}`}>
              <TableRow issue={story} level={0} />

              {openStories.includes(story.id) &&
                issues.tasksData
                  .filter((t) => t.storyId === story.id)
                  .map((task) => (
                    <TableRow key={`T2-${task.id}`} issue={task} level={1} />
                  ))}
            </React.Fragment>
          ))}

        {/* Tasks without story */}
        {issues.tasksData
          .filter((t) => !t.storyId)
          .map((task) => (
            <TableRow key={`OT-${task.id}`} issue={task} level={0} />
          ))}

        {/* Bugs */}
        {issues.bugsData.map((bug) => (
          <TableRow key={`B-${bug.id}`} issue={bug} level={0} />
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4 space-y-6">
      <ToastContainer />

      <div className="flex items-center justify-between sticky top-0 bg-white z-20 py-3 border-b">
        <h1 className="text-2xl font-semibold text-indigo-900">Issue Tracker ({projectName})</h1>

        <Button size="medium" variant="primary" onClick={() => navigate(-1)}>
          Back to Backlog
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner text="Loading issues..." />
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow p-4">{renderHierarchy()}</div>
      )}

      {editModal.visible && (
        <Modal onClose={() => setEditModal({ visible: false })}>
          {editModal.type === "Epic" && (
            <EditEpicForm
              epicId={editModal.id}
              projectId={projectId}
              onClose={() => setEditModal({ visible: false })}
              onUpdated={() => handleUpdated("Epic")}
            />
          )}
          {editModal.type === "Story" && (
            <EditStoryForm
              storyId={editModal.id}
              projectId={projectId}
              onClose={() => setEditModal({ visible: false })}
              onUpdated={() => handleUpdated("Story")}
            />
          )}
          {editModal.type === "Task" && (
            <EditTaskForm
              taskId={editModal.id}
              projectId={projectId}
              onClose={() => setEditModal({ visible: false })}
              onUpdated={() => handleUpdated("Task")}
            />
          )}
          {editModal.type === "Bug" && (
            <EditBugForm
              bugId={editModal.id}
              projectId={projectId}
              onClose={() => setEditModal({ visible: false })}
              onUpdated={() => handleUpdated("Bug")}
            />
          )}
        </Modal>
      )}

      <Routes>
        <Route
          path={`/projects/:projectId/issues/:type/:id/view`}
          element={
            <Modal onClose={() => navigate(-1)}>
              <ViewSheet />
            </Modal>
          }
        />
      </Routes>
    </div>
  );
};

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-auto max-w-4xl relative max-h-[90vh] overflow-y-auto">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-black">
        <FiX />
      </button>
      {children}
    </div>
  </div>
);

export default IssueTracker;
