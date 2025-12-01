import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Button from "../../../../components/Button/Button";
import { FiEdit, FiTrash, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronDown, ChevronRight } from "lucide-react";
import EditBugForm from "./EditBugForm";
import EditStoryForm from "./EditStoryForm";
import EditTaskForm from "./EditTaskForm";
import EditEpicForm from "./EditEpicForm";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import ViewSheet from "./ViewSheet";
import { ArrowLeft } from "lucide-react";
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

  // --- Filter state ---
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [filters, setFilters] = useState({
    types: [], // Epic, Story, Task, Bug
    statuses: [], // BACKLOG, IN_PROGRESS, REVIEW, DONE, OPEN, TO_DO
    priorities: [], // LOW, MEDIUM, HIGH, CRITICAL
  });

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        priority: (e.priority || "MEDIUM").toUpperCase(),
        status: e.status || "BACKLOG",
        
      }));

      const storiesData = storiesRes.data.map((s) => ({
        ...s,
        type: "Story",
        title: s.title || s.name,
        epicId: s.epic?.id ?? null,
        reporterName: s.reporterName || s.reporter?.name || "Unassigned",
        assigneeName: s.assigneeName || s.assignee?.name || "Unassigned",
        priority: (s.priority || "MEDIUM").toUpperCase(),
        status: s.status?.name || s.statusName || "BACKLOG",
      }));

      // <<< UPDATED: tasks mapping to match TaskViewDto >>>
      const tasksData = tasksRes.data.map((t) => {
        // Normalize status to keys used in statusColors (UPPERCASE_WITH_UNDERSCORES)
        const normalizedStatus = t.statusName
          ? String(t.statusName).toUpperCase().replace(/\s+/g, "_")
          : t.status
          ? String(t.status).toUpperCase().replace(/\s+/g, "_")
          : "BACKLOG";

        return {
          ...t,
          type: "Task",
          title: t.title,
          // TaskViewDto fields
          storyId: t.storyId ?? null,
          storyTitle: t.storyTitle || "",
          sprintId: t.sprintId ?? null,
          sprintName: t.sprintName || "",
          reporterName: t.reporterName || "Unassigned",
          assigneeName: t.assigneeName || "Unassigned",
          priority: (t.priority || "MEDIUM").toUpperCase(),
          // store normalized status so it matches statusColors keys
          status: normalizedStatus,
        };
      });

      const bugsData = bugsRes.data.map((b) => ({
        ...b,
        type: "Bug",
        title: b.title,
        reporterName: b.reporterName || b.reporter?.name || "Unassigned",
        assigneeName: b.assigneeName || b.assignedTo?.name || "Unassigned",
        priority: (b.priority || "MEDIUM").toUpperCase(),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setTimeout(() => {
    setOpenEpics([]);
    setOpenStories([]);
    fetchIssues();
    }, 300);
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
    TO_DO: "bg-gray-100 text-gray-700",
  };

  const toggleEpic = (id) =>
    setOpenEpics((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggleStory = (id) =>
    setOpenStories((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // --- Filter helpers ---
  const isFiltersEmpty = () =>
    filters.types.length === 0 && filters.statuses.length === 0 && filters.priorities.length === 0;

  const matchesFilters = (issue) => {
    // If no filters selected -> match everything
    if (isFiltersEmpty()) return true;

    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(issue.type)) return false;

    // Priority filter (issue.priority stored uppercase)
    if (filters.priorities.length > 0) {
      const pr = (issue.priority || "").toUpperCase();
      if (!filters.priorities.includes(pr)) return false;
    }

    // Status filter: issue.status might be "BACKLOG" or "IN_PROGRESS" or "Open" etc.
    if (filters.statuses.length > 0) {
      const st = String(issue.status || "").toUpperCase().replace(/\s+/g, "_");
      if (!filters.statuses.includes(st)) return false;
    }

    return true;
  };

  // For hierarchy: check if epic matches or any of its stories/tasks match
  const epicMatchesHierarchy = (epic) => {
    if (matchesFilters(epic)) return true;
    const epicStories = issues.storiesData.filter((s) => s.epicId === epic.id);
    for (const story of epicStories) {
      if (matchesFilters(story)) return true;
      const storyTasks = issues.tasksData.filter((t) => t.storyId === story.id);
      for (const task of storyTasks) {
        if (matchesFilters(task)) return true;
      }
    }
    return false;
  };

  // For story: matches itself or its tasks
  const storyMatchesHierarchy = (story) => {
    if (matchesFilters(story)) return true;
    const storyTasks = issues.tasksData.filter((t) => t.storyId === story.id);
    for (const task of storyTasks) {
      if (matchesFilters(task)) return true;
    }
    return false;
  };

  // --- TableRow component ---
  const TableRow = ({ issue, level }) => (
    <tr
      className="hover:bg-gray-50 border-b cursor-pointer"
      onClick={() => handleView(issue)}
    >
      {/* Title with indentation only */}
      <td className="py-3">
        <div className="flex items-center gap-2">
          <div
            style={{ paddingLeft: `${level * 24}px` }}
            className="flex items-center gap-2"
          >
            {(issue.type === "Epic" || issue.type === "Story") && (
              <span
                className="cursor-pointer p-1 rounded hover:bg-gray-200 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  issue.type === "Epic" ? toggleEpic(issue.id) : toggleStory(issue.id);
                }}
              >
                {(issue.type === "Epic" && openEpics.includes(issue.id)) ||
                (issue.type === "Story" && openStories.includes(issue.id)) ? (
                  <ChevronDown size={16} className="text-gray-600" />
                ) : (
                  <ChevronRight size={16} className="text-gray-600" />
                )}
              </span>
            )}

            <span className="font-medium text-gray-900">{issue.title}</span>
          </div>
        </div>
      </td>

      <td>
        <span className={`px-2 py-1 rounded text-xs ${typeColors[issue.type]}`}>
          {issue.type}
        </span>
      </td>

      <td>
        <span className={`px-2 py-1 rounded text-xs ${priorityColors[issue.priority] || "bg-gray-100 text-gray-700"}`}>
          {issue.priority}
        </span>
      </td>

      <td>
        <span className={`px-2 py-1 rounded text-xs ${statusColors[issue.status] || "bg-gray-100 text-gray-700"}`}>
          {String(issue.status).replace("_", " ")}
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

  // --- Rendered hierarchy using filters ---
  const renderHierarchy = () => (
    <table className="w-full text-left border rounded-lg ">
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
        {/* Epics */}
        {issues.epicsData
          .filter((epic) => epicMatchesHierarchy(epic))
          .map((epic) => (
            <React.Fragment key={`E-${epic.id}`}>
              <TableRow issue={epic} level={0} />

              {openEpics.includes(epic.id) &&
                issues.storiesData
                  .filter((s) => s.epicId === epic.id)
                  .filter((s) => storyMatchesHierarchy(s))
                  .map((story) => (
                    <React.Fragment key={`S-${story.id}`}>
                      <TableRow issue={story} level={1} />

                      {openStories.includes(story.id) &&
                        issues.tasksData
                          .filter((t) => t.storyId === story.id)
                          .filter((t) => matchesFilters(t))
                          .map((task) => (
                            <TableRow key={`T-${task.id}`} issue={task} level={2} />
                          ))}
                    </React.Fragment>
                  ))}
            </React.Fragment>
          ))}

        {/* Unassigned Stories heading and list (stories without epic) */}
        {(() => {
          const orphanStories = issues.storiesData.filter((s) => !s.epicId).filter((s) => storyMatchesHierarchy(s));
          if (orphanStories.length === 0) return null;
          return (
            <React.Fragment>
              <tr>
                <td colSpan={7} className="pt-4 pb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Stories Unassigned to Epics</h3>
                </td>
              </tr>
              {orphanStories.map((story) => (
                <React.Fragment key={`OS-${story.id}`}>
                  <TableRow issue={story} level={0} />
                  {openStories.includes(story.id) &&
                    issues.tasksData
                      .filter((t) => t.storyId === story.id)
                      .filter((t) => matchesFilters(t))
                      .map((task) => <TableRow key={`T2-${task.id}`} issue={task} level={1} />)}
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        })()}

        {/* Unassigned Tasks (tasks without story) */}
        {(() => {
          const orphanTasks = issues.tasksData.filter((t) => !t.storyId).filter((t) => matchesFilters(t));
          if (orphanTasks.length === 0) return null;
          return (
            <React.Fragment>
              <tr>
                <td colSpan={7} className="pt-4 pb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Tasks Unassigned to stories</h3>
                </td>
              </tr>
              {orphanTasks.map((task) => (
                <TableRow key={`OT-${task.id}`} issue={task} level={0} />
              ))}
            </React.Fragment>
          );
        })()}

        {/* Bugs (filtered independently) */}
        {(() => {
          const visibleBugs = issues.bugsData.filter((b) => matchesFilters(b));
          if (visibleBugs.length === 0) return null;
          return visibleBugs.map((bug) => <TableRow key={`B-${bug.id}`} issue={bug} level={0} />);
        })()}
      </tbody>
    </table>
  );

  // --- Filter option lists ---
  const TYPE_OPTIONS = ["Epic", "Story", "Task", "Bug"];
  const STATUS_OPTIONS = [
    { label: "Backlog", value: "BACKLOG" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Review", value: "REVIEW" },
    { label: "Done", value: "DONE" },
    { label: "Open", value: "OPEN" },
    { label: "To Do", value: "TO_DO" },
  ];
  const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  const toggleFilterValue = (group, value) => {
    setFilters((prev) => {
      const arr = prev[group];
      if (arr.includes(value)) {
        return { ...prev, [group]: arr.filter((v) => v !== value) };
      }
      return { ...prev, [group]: [...arr, value] };
    });
  };

  const clearFilters = () => setFilters({ types: [], statuses: [], priorities: [] });

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4 space-y-6">
      <ToastContainer />

      <div className="flex items-center justify-between sticky top-0 bg-white z-20 py-3 border-b">
        <h1 className="text-2xl font-semibold text-indigo-900">Issue Tracker ({projectName})</h1>

        <div className="flex items-center gap-3">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((s) => !s)}
              className="px-3 py-1 text-sm rounded-md border hover:shadow-sm bg-white"
            >
              Filter ▾
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg p-3 z-30">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-sm">Filters</strong>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-auto pr-1">
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">Types</div>
                    <div className="grid grid-cols-2 gap-2">
                      {TYPE_OPTIONS.map((t) => (
                        <label key={t} className="text-sm flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.types.includes(t)}
                            onChange={() => toggleFilterValue("types", t)}
                            className="w-3 h-3"
                          />
                          <span className="ml-1">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs font-medium text-gray-600 mb-1">Status</div>
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_OPTIONS.map((s) => (
                        <label key={s.value} className="text-sm flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.statuses.includes(s.value)}
                            onChange={() => toggleFilterValue("statuses", s.value)}
                            className="w-3 h-3"
                          />
                          <span className="ml-1">{s.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs font-medium text-gray-600 mb-1">Priority</div>
                    <div className="grid grid-cols-2 gap-2">
                      {PRIORITY_OPTIONS.map((p) => (
                        <label key={p} className="text-sm flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.priorities.includes(p)}
                            onChange={() => toggleFilterValue("priorities", p)}
                            className="w-3 h-3"
                          />
                          <span className="ml-1">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="px-3 py-1 text-sm rounded-md border hover:shadow-sm bg-white"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

         <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
>
  <ArrowLeft size={20} />
</button>
        </div>
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
              mode="modal"
              onClose={() => setEditModal({ visible: false })}
              onUpdated={() => handleUpdated("Story")}
            />
          )}
          {editModal.type === "Task" && (
            <EditTaskForm
              taskId={editModal.id}
              projectId={projectId}
              mode="modal"
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

      {/* <Routes>
        <Route
          path={`/projects/:projectId/issues/:type/:id/view`}
          element={
            <Modal onClose={() => navigate(-1)}>
              <ViewSheet />
            </Modal>
          }
        />
      </Routes> */}
    </div>
  );
};

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-xl p-6 w-auto max-w-4xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-black">
        <FiX />
      </button>
      {children}
    </div>
  </div>
);

export default IssueTracker;
