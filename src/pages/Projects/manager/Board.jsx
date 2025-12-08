"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import CreateIssueForm from "./CreateIssue/CreateIssueForm";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus,
  Trash,
  Edit3,
  Loader2,
  Filter,
  Search,
  User,
} from "lucide-react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditTaskForm from "./Backlog/EditTaskForm";
import EditStoryForm from "./Backlog/EditStoryForm";
import RightSidePanel from "./Sprint/RightSidePanel";
import CreateTaskForm from "./Backlog/CreateTask";
import CreateStoryForm from "./Backlog/CreateStory";
/* -------------------
  Config & helpers
-------------------- */
const BASE = import.meta.env.VITE_PMS_BASE_URL || "";
const WIP_WARNING_THRESHOLD = 8;
const PALETTE = [
  "bg-slate-100 text-slate-800",
  "bg-indigo-100 text-indigo-800",
  "bg-emerald-100 text-emerald-800",
  "bg-rose-100 text-rose-800",
  "bg-amber-100 text-amber-800",
  "bg-violet-100 text-violet-800",
  "bg-cyan-100 text-cyan-800",
  "bg-pink-100 text-pink-800",
];

const headersWithToken = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    "Content-Type": "application/json",
  };
};

const stableColorClass = (k) => {
  const s = String(k ?? "");
  let h = 216;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000;
  return PALETTE[Math.abs(h) % PALETTE.length];
};

/* -------------------
  Small UI helpers
--------------------*/
const Avatar = ({ name }) => {
  const initials = (name || "U")
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = stableColorClass(name || initials);
  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${color}`}
    >
      {initials}
    </div>
  );
};

/* -------------------
  Create Task Modal (minimal)
--------------------*/
const CreateTaskModal = ({
  open,
  onClose,
  defaultStatusId,
  projectId,
  onCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
    }
  }, [open]);

  if (!open) return null;

  const handleCreate = async (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${BASE}/api/tasks`,
        {
          title: title.trim(),
          description: description.trim(),
          projectId,
          statusId: defaultStatusId,
        },
        { headers: headersWithToken() }
      );
      onCreated(res.data);
      toast.success("Task created");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg p-5">
        <h3 className="text-lg font-semibold mb-3">Create task</h3>
        <form onSubmit={handleCreate}>
          <label className="block mb-2">
            <div className="text-sm font-medium">Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block mb-2">
            <div className="text-sm font-medium">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              rows={4}
            />
          </label>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-indigo-600 text-white"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------
  Create Story Modal (minimal)
--------------------*/
const CreateStoryModal = ({
  open,
  onClose,
  defaultStatusId,
  projectId,
  onCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
    }
  }, [open]);

  if (!open) return null;

  const handleCreate = async (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${BASE}/api/stories`,
        {
          title: title.trim(),
          description: description.trim(),
          priority,
          projectId,
          statusId: defaultStatusId,
        },
        { headers: headersWithToken() }
      );
      onCreated(res.data);
      toast.success("Story created");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create story");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg p-5">
        <h3 className="text-lg font-semibold mb-3">Create story</h3>
        <form onSubmit={handleCreate}>
          <label className="block mb-2">
            <div className="text-sm font-medium">Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block mb-2">
            <div className="text-sm font-medium">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              rows={4}
            />
          </label>
          <label className="block mb-2">
            <div className="text-sm font-medium">Priority</div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-indigo-600 text-white"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------
  Task Detail Modal
--------------------*/
const TaskDetailModal = ({ open, onClose, task, statuses, onSaved }) => {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [statusId, setStatusId] = useState(
    task?.status?.id ?? task?.statusId ?? ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setStatusId(task?.status?.id ?? task?.statusId ?? "");
    }
  }, [open, task]);

  if (!open) return null;

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (title !== task?.title) payload.title = title;
      if (description !== task?.description) payload.description = description;
      if (String(statusId) !== String(task?.status?.id ?? task?.statusId))
        payload.statusId = Number(statusId);

      if (Object.keys(payload).length === 0) {
        toast.info("No changes");
        setSaving(false);
        return;
      }

      await axios.patch(`${BASE}/api/tasks/${task.id}/status`, payload, {
        headers: headersWithToken(),
      });
      toast.success("Saved");
      onSaved({
        ...task,
        ...payload,
        status: payload.statusId ? { id: payload.statusId } : task.status,
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-5">
        <h3 className="text-lg font-semibold mb-3">Task details</h3>
        <form onSubmit={handleSave}>
          <label className="block mb-2">
            <div className="text-sm font-medium">Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block mb-2">
            <div className="text-sm font-medium">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              rows={4}
            />
          </label>
          <label className="block mb-2">
            <div className="text-sm font-medium">Status</div>
            <select
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            >
              <option value="">-- Select status --</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ?? s.statusName}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-indigo-600 text-white"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------
  Delete Status Modal
--------------------*/
const DeleteStatusModal = ({
  open,
  onClose,
  statusToDelete,
  otherStatuses,
  onConfirm,
}) => {
  const [selectedNewStatus, setSelectedNewStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setSelectedNewStatus("");
  }, [open, statusToDelete]);

  if (!open) return null;

  const canConfirm =
    selectedNewStatus &&
    Number(selectedNewStatus) !== Number(statusToDelete?.id);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    try {
      await onConfirm(Number(selectedNewStatus));
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl p-6">
        <h3 className="text-lg font-semibold mb-2">
          Move work from {statusToDelete?.name ?? statusToDelete?.statusName}{" "}
          column
        </h3>
        <p className="mb-4 text-sm text-gray-700">
          Select a new home for any work with the{" "}
          {statusToDelete?.name ?? statusToDelete?.statusName} status — the work
          will be moved there and this status will be deleted.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500">
              This status will be deleted
            </div>
            <div className="mt-2 px-3 py-2 border rounded inline-block">
              {statusToDelete?.name ?? statusToDelete?.statusName}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">
              Move existing work items to
            </div>
            <select
              value={selectedNewStatus}
              onChange={(e) => setSelectedNewStatus(e.target.value)}
              className="w-full mt-2 border rounded px-3 py-2"
            >
              <option value="">-- Select destination status --</option>
              {otherStatuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ?? s.statusName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded border">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || submitting}
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            {submitting ? "Processing..." : "Confirm & Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------
  Main Board
--------------------*/
const Board = ({ projectId, sprintId, projectName }) => {
  // data
  const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stories, setStories] = useState([]); // NEW: stories for active sprint
  const [members, setMembers] = useState([]); // for assignee filter
  const [loading, setLoading] = useState(true);

  // add column ui
  const [showAddInput, setShowAddInput] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [creatingStatus, setCreatingStatus] = useState(false);

  // modals & create menu
  const [createMenuFor, setCreateMenuFor] = useState(null); // status id for which menu is open
  const [openCreateTaskModal, setOpenCreateTaskModal] = useState(null); // { statusId, projectId } or null
  const [openCreateStoryModal, setOpenCreateStoryModal] = useState(null); // { statusId, projectId } or null

  const [isCreateOpen, setIsCreateOpen] = useState(false); // legacy (kept for compatibility)
  const [createDefaultStatusId, setCreateDefaultStatusId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [deleteModalOtherStatuses, setDeleteModalOtherStatuses] = useState([]);

  // rename
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [editingStatusName, setEditingStatusName] = useState("");

  // UI: refreshing
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter UI
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState(new Set());
  const [selectedStatusesFilter, setSelectedStatusesFilter] = useState(
    new Set()
  );
  const [selectedSprints, setSelectedSprints] = useState(new Set());
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [activeSprintId, setActiveSprintId] = useState(null);

  const [sprintPopup, setSprintPopup] = useState(null);
  const [isFinishingSprint, setIsFinishingSprint] = useState(false);

  // load data
  const loadBoard = useCallback(async () => {
    setLoading(true);

    try {
      let activeSprintId = null;

      // --- GET ACTIVE SPRINT ---------------------------------------------------
      try {
        const res = await axios.get(
          `${BASE}/api/sprints/active/project/${projectId}`,
          { headers: headersWithToken() }
        );

        activeSprintId = res.data[0]?.id;
        // console.log("res",res.data);
        console.log("Sprint ID:", activeSprintId);
        setActiveSprintId(activeSprintId);
      } catch (err) {
        console.error("API error:", err?.response?.data || err?.message || err);
      }

      // --- FETCH STATUSES + TASKS + MEMBERS IN PARALLEL -----------------------
      const statusReq = axios.get(
        `${BASE}/api/projects/${projectId}/statuses`,
        { headers: headersWithToken() }
      );

      const tasksUrl = activeSprintId
        ? `${BASE}/api/projects/sprint/${activeSprintId}/tasks`
        : `${BASE}/api/projects/${projectId}/tasks`;

      const tasksReq = axios.get(tasksUrl, { headers: headersWithToken() });

      // NEW: fetch stories only if we have an active sprint
      const storiesReq = activeSprintId
        ? axios
            .get(`${BASE}/api/stories/sprint/${activeSprintId}`, {
              headers: headersWithToken(),
            })
            .catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] });

      const membersReq = axios
        .get(`${BASE}/api/projects/${projectId}/members`, {
          headers: headersWithToken(),
        })
        .catch(() => ({ data: [] })); // fail-safe

      const [sRes, tRes, stRes, mRes] = await Promise.all([
        statusReq,
        tasksReq,
        storiesReq,
        membersReq,
      ]);

      // --- PROCESS STATUSES -----------------------------------------------------
      const statusData = Array.isArray(sRes.data)
        ? sRes.data
        : sRes.data?.content ?? [];

      const ordered = statusData
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

      setStatuses(ordered);

      // --- PROCESS TASKS --------------------------------------------------------
      let tasksData = [];

      if (Array.isArray(tRes.data)) tasksData = tRes.data;
      else if (Array.isArray(tRes.data?.content)) tasksData = tRes.data.content;
      else if (Array.isArray(tRes.data?.tasks)) tasksData = tRes.data.tasks;

      setTasks(tasksData);

      // --- PROCESS STORIES ------------------------------------------------------
      let storiesData = [];
      if (stRes && Array.isArray(stRes.data)) storiesData = stRes.data;
      else if (stRes && Array.isArray(stRes.data?.content))
        storiesData = stRes.data.content;
      else if (stRes && Array.isArray(stRes.data?.stories))
        storiesData = stRes.data.stories;
      setStories(storiesData);

      // --- PROCESS MEMBERS ------------------------------------------------------
      if (Array.isArray(mRes.data) && mRes.data.length > 0) {
        setMembers(
          mRes.data.map((m) => ({ id: m.id, name: m.fullName ?? m.name }))
        );
      } else {
        const map = {};

        tasksData.forEach((t) => {
          const aid = t.assigneeId ?? t.assignee?.id;
          const aname =
            t.assigneeName ?? t.assignee?.name ?? t.assignee?.fullName;

          if (aid != null) map[aid] = aname ?? `User ${aid}`;
        });

        setMembers(
          Object.entries(map).map(([id, name]) => ({ id: Number(id), name }))
        );
      }
    } catch (err) {
      console.error("Load board failed", err);
      toast.error("Failed to load board");

      setStatuses([]);
      setTasks([]);
      setStories([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  console.log("sprintId in board:", activeSprintId);
  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // safe arrays & grouping (original grouping)
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeStories = Array.isArray(stories) ? stories : [];

  const tasksByStatusId = useMemo(() => {
    const acc = {};
    statuses.forEach((s) => (acc[String(s.id)] = []));
    safeTasks.forEach((t) => {
      const sid = t?.status?.id ?? t?.statusId ?? null;
      const key = sid !== null ? String(sid) : null;
      if (key && acc[key]) acc[key].push(t);
      else if (statuses.length) acc[String(statuses[0].id)].push(t);
    });
    return acc;
  }, [safeTasks, statuses]);

  // NEW: stories grouped by status
  const storiesByStatusId = useMemo(() => {
    const acc = {};
    statuses.forEach((s) => (acc[String(s.id)] = []));
    safeStories.forEach((st) => {
      const sid = st?.status?.id ?? st?.statusId ?? null;
      const key = sid !== null ? String(sid) : null;
      if (key && acc[key]) acc[key].push(st);
      else if (statuses.length) acc[String(statuses[0].id)].push(st);
    });
    return acc;
  }, [safeStories, statuses]);

  // ---------- Filtering logic ----------
  const filterCount = useMemo(() => {
    const c =
      (selectedAssignees.size ? selectedAssignees.size : 0) +
      (selectedPriorities.size ? selectedPriorities.size : 0) +
      (selectedStatusesFilter.size ? selectedStatusesFilter.size : 0) +
      (selectedSprints.size ? selectedSprints.size : 0);
    return c;
  }, [
    selectedAssignees,
    selectedPriorities,
    selectedStatusesFilter,
    selectedSprints,
  ]);

  // apply filters for tasks and stories
  const filteredTasksByStatusId = useMemo(() => {
    const active = filterCount > 0;
    if (!active) return tasksByStatusId;

    const res = {};
    Object.keys(tasksByStatusId).forEach((statusId) => {
      res[statusId] = tasksByStatusId[statusId].filter((t) => {
        // assignee filter
        if (selectedAssignees.size > 0) {
          const aid = t.assigneeId ?? t.assignee?.id;
          if (!selectedAssignees.has(String(aid))) return false;
        }
        // priority
        if (selectedPriorities.size > 0) {
          const pr = (t.priority ?? "").toString();
          if (!selectedPriorities.has(pr)) return false;
        }
        // status filter (redundant but supported)
        if (selectedStatusesFilter.size > 0) {
          const sId = t.status?.id ?? t.statusId;
          if (!selectedStatusesFilter.has(String(sId))) return false;
        }
        // sprint
        if (selectedSprints.size > 0) {
          const sp = t.sprintId ?? t.sprint?.id;
          if (!selectedSprints.has(String(sp))) return false;
        }
        return true;
      });
    });
    return res;
  }, [
    tasksByStatusId,
    selectedAssignees,
    selectedPriorities,
    selectedStatusesFilter,
    selectedSprints,
    filterCount,
  ]);

  const filteredStoriesByStatusId = useMemo(() => {
    const active = filterCount > 0;
    if (!active) return storiesByStatusId;

    const res = {};
    Object.keys(storiesByStatusId).forEach((statusId) => {
      res[statusId] = storiesByStatusId[statusId].filter((st) => {
        // For stories, apply only sprint/status-based filters where applicable
        if (selectedStatusesFilter.size > 0) {
          const sId = st.status?.id ?? st.statusId;
          if (!selectedStatusesFilter.has(String(sId))) return false;
        }
        if (selectedSprints.size > 0) {
          const sp = st.sprintId ?? st.sprint?.id;
          if (!selectedSprints.has(String(sp))) return false;
        }
        // assignee/priority not typically on story - skip unless present
        if (selectedAssignees.size > 0) {
          const aid = st.assigneeId ?? st.assignee?.id;
          if (!selectedAssignees.has(String(aid))) return false;
        }
        return true;
      });
    });
    return res;
  }, [
    storiesByStatusId,
    selectedAssignees,
    selectedStatusesFilter,
    selectedSprints,
    filterCount,
  ]);

  // helper to toggle sets
  const toggleSet = (setStateFn, setRef, val) => {
    setRef((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      setStateFn(next);
      return next;
    });
  };

  // add status flow (input only visible after clicking)
  const handleAddColumnClick = () => setShowAddInput(true);

  const handleCreateStatus = async () => {
    const name = (newStatusName || "").trim();
    if (!name) {
      toast.error("Column name required");
      return;
    }
    setCreatingStatus(true);
    try {
      const res = await axios.post(
        `${BASE}/api/projects/${projectId}/statuses`,
        { name },
        { headers: headersWithToken() }
      );
      setStatuses((prev) =>
        [...prev, res.data]
          .slice()
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      );
      setNewStatusName("");
      setShowAddInput(false);
      toast.success("Column added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add column");
    } finally {
      setCreatingStatus(false);
    }
  };

  // refresh action (loader)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadBoard();
      toast.info("Board refreshed");
    } catch (_) {
    } finally {
      setIsRefreshing(false);
    }
  };

  // delete action entry: decide direct delete or show modal
  const handleDeleteClick = (status) => {
    const assignedTasks = safeTasks.filter(
      (t) => (t?.status?.id ?? t?.statusId) === Number(status.id)
    );
    const assignedStories = safeStories.filter(
      (s) => (s?.status?.id ?? s?.statusId) === Number(status.id)
    );
    const assigned = assignedTasks.concat(assignedStories);
    if (assigned.length === 0) {
      // direct delete
      doDirectDelete(status.id);
      return;
    }
    // show modal with other statuses
    setDeleteModalOtherStatuses(statuses.filter((s) => s.id !== status.id));
    setStatusToDelete(status);
    setIsDeleteModalOpen(true);
  };

  const doDirectDelete = async (statusId) => {
    try {
      await axios.delete(`${BASE}/api/statuses/${statusId}`, {
        headers: headersWithToken(),
      });
      toast.success("Column deleted");
      setStatuses((prev) => prev.filter((s) => s.id !== statusId));
      await loadBoard();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
      await loadBoard();
    }
  };

  const confirmDeleteWithMigration = async (newStatusId) => {
    if (!statusToDelete) return;
    try {
      await axios.delete(`${BASE}/api/statuses/${statusToDelete.id}`, {
        params: { newStatusId },
        headers: headersWithToken(),
      });
      toast.success("Column deleted and tasks moved");
      setStatuses((prev) => prev.filter((s) => s.id !== statusToDelete.id));
      setIsDeleteModalOpen(false);
      setStatusToDelete(null);
      await loadBoard();
    } catch (err) {
      console.error(err);
      toast.error("Delete/migrate failed");
      await loadBoard();
    }
  };

  const fetchSprintPopup = async (sprintId) => {
    try {
      const res = await axios.get(
        `${BASE}/api/sprints/${sprintId}/popup-status`,
        { headers: headersWithToken() }
      );
      setSprintPopup(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch sprint info");
    }
  };

  const finishSprint = async (option) => {
    if (!activeSprintId) return;
    setIsFinishingSprint(true);
    try {
      await axios.post(`${BASE}/api/sprints/${activeSprintId}/finish`, null, {
        params: { option },
        headers: headersWithToken(),
      });
      toast.success("Sprint finished successfully");
      setSprintPopup(null);
      await loadBoard();
    } catch (err) {
      console.error(err);
      toast.error("Failed to finish sprint");
    } finally {
      setIsFinishingSprint(false);
    }
  };

  // rename flow
  const startRename = (status) => {
    setEditingStatusId(status.id);
    setEditingStatusName(status.name ?? status.statusName ?? "");
  };
  const cancelRename = () => {
    setEditingStatusId(null);
    setEditingStatusName("");
  };
  const saveRename = async (statusId) => {
    const name = (editingStatusName || "").trim();
    if (!name) {
      toast.error("Name required");
      return;
    }
    try {
      const payload = statuses.map((s) =>
        s.id === statusId ? { ...s, name } : s
      );
      await axios.put(`${BASE}/api/projects/${projectId}/statuses`, payload, {
        headers: headersWithToken(),
      });
      setStatuses((prev) =>
        prev.map((s) => (s.id === statusId ? { ...s, name } : s))
      );
      toast.success("Renamed");
    } catch (err) {
      console.error(err);
      toast.error("Rename failed");
      await loadBoard();
    } finally {
      cancelRename();
    }
  };

  // DnD handlers
  const makeReorderPayload = (ordered) => {
    const mapping = {};
    ordered.forEach((s, i) => (mapping[String(s.id)] = i + 1));
    return mapping;
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    try {
      if (type === "STATUS") {
        const newOrder = Array.from(statuses);
        const [moved] = newOrder.splice(source.index, 1);
        newOrder.splice(destination.index, 0, moved);
        setStatuses(newOrder);
        const payload = makeReorderPayload(newOrder);
        await axios.post(`${BASE}/api/statuses/reorder`, payload, {
          headers: headersWithToken(),
        });
        toast.success("Columns reordered");
        return;
      }

      // ITEM move (could be a task or a story)
      const srcStatusId = source.droppableId;
      const destStatusId = destination.droppableId;
      if (srcStatusId === destStatusId && source.index === destination.index)
        return;

      // Detect type by draggableId prefix
      if (String(draggableId).startsWith("task-")) {
        // Task move
        const taskId = Number(String(draggableId).replace("task-", ""));
        // optimistic update: remove from source list and insert in dest
        const srcList = Array.from(
          filteredTasksByStatusId[String(srcStatusId)] || []
        );
        const destList = Array.from(
          filteredTasksByStatusId[String(destStatusId)] || []
        );
        const taskIndex = srcList.findIndex(
          (t) => String(t.id) === String(taskId)
        );
        let moved = null;
        if (taskIndex !== -1) moved = srcList.splice(taskIndex, 1)[0];
        else {
          // If not found in filtered list, try to locate in full tasks
          const fallbackIdx = safeTasks.findIndex(
            (t) => String(t.id) === String(taskId)
          );
          if (fallbackIdx !== -1) moved = safeTasks[fallbackIdx];
        }
        if (!moved) return;

        const movedUpdated = { ...moved, status: { id: Number(destStatusId) } };
        destList.splice(destination.index, 0, movedUpdated);

        // update tasks state: replace moved task
        setTasks((prev) =>
          prev.map((t) =>
            String(t.id) === String(taskId)
              ? { ...t, status: { id: Number(destStatusId) } }
              : t
          )
        );

        await axios.patch(
          `${BASE}/api/tasks/${taskId}/status`,
          { statusId: Number(destStatusId) },
          { headers: headersWithToken() }
        );
        toast.success("Task moved");
        return;
      }

      if (String(draggableId).startsWith("story-")) {
        // Story move
        const storyId = Number(String(draggableId).replace("story-", ""));

        const srcList = Array.from(
          filteredStoriesByStatusId[String(srcStatusId)] || []
        );
        const destList = Array.from(
          filteredStoriesByStatusId[String(destStatusId)] || []
        );
        const storyIndex = srcList.findIndex(
          (s) => String(s.id) === String(storyId)
        );
        let moved = null;
        if (storyIndex !== -1) moved = srcList.splice(storyIndex, 1)[0];
        else {
          const fallbackIdx = safeStories.findIndex(
            (s) => String(s.id) === String(storyId)
          );
          if (fallbackIdx !== -1) moved = safeStories[fallbackIdx];
        }
        if (!moved) return;

        const movedUpdated = { ...moved, status: { id: Number(destStatusId) } };
        destList.splice(destination.index, 0, movedUpdated);

        // update stories state: replace moved story
        setStories((prev) =>
          prev.map((s) =>
            String(s.id) === String(storyId)
              ? { ...s, status: { id: Number(destStatusId) } }
              : s
          )
        );

        await axios.patch(
          `${BASE}/api/stories/${storyId}/status`,
          { statusId: Number(destStatusId) },
          { headers: headersWithToken() }
        );
        toast.success("Story moved");
        return;
      }

      // fallback: unknown draggable id
    } catch (err) {
      console.error(err);
      toast.error("Move failed, reloading");
      await loadBoard();
    }
  };

  // helpers for filter toggles (we use String values)
  const toggleAssignee = (id) => {
    setSelectedAssignees((prev) => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const togglePriority = (p) => {
    const key = String(p);
    setSelectedPriorities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const toggleStatusFilter = (sId) => {
    const key = String(sId);
    setSelectedStatusesFilter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const toggleSprint = (id) => {
    const key = String(id);
    setSelectedSprints((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // open create modal (legacy single)
  const openCreateForStatus = (statusId) => {
    setSelectedStatusId(statusId);
    setOpenCreateModal(true);
  };

  const closeCreateModal = () => {
    setSelectedStatusId(null);
    setOpenCreateModal(false);
  };

  const handleTaskCreated = async (created) => {
    // Optimistic add then refresh to ensure shapes are consistent OR just reload board
    setTasks((prev) => [...prev, created]);
    // ensure board is consistent: reload the board (status mapping, counts)
    try {
      await loadBoard();
    } catch (e) {
      console.error(e);
    }
  };

  // open task modal
  const openTaskPanel = (task) => {
    setSelectedTask(task);
    setIsTaskPanelOpen(true);
  };
  const openStoryPanel = (story) => {
    setSelectedStory(story);
    setIsStoryPanelOpen(true);
  };
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [isStoryPanelOpen, setIsStoryPanelOpen] = useState(false);
  const handleTaskSaved = (updated) =>
    setTasks((prev) =>
      prev.map((t) =>
        String(t.id) === String(updated.id) ? { ...t, ...updated } : t
      )
    );

  // clicking outside filter dropdown closes it
  useEffect(() => {
    const onDocClick = (e) => {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    if (filterOpen) document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [filterOpen]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner text="Loading board..." />
      </div>
    );

  return (
    <div className="p-6">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {projectName ?? "Project Board"}
        </h2>

        {activeSprintId && (
          <button
            onClick={() => fetchSprintPopup(activeSprintId)}
            className="px-3 py-2 rounded border bg-green-100 text-green-700 hover:bg-green-200"
          >
            Complete Sprint
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Filter button (Jira-style) */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded border text-sm bg-white hover:bg-slate-50"
            >
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium">Filter</span>
              {filterCount > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded">
                  {filterCount}
                </span>
              )}
            </button>

            {/* dropdown below button */}
            {filterOpen && (
              <div className="absolute right-0 mt-2 w-[560px] bg-white shadow-lg rounded border z-50 p-4">
                <div className="flex gap-6">
                  {/* Left: filter categories */}
                  <div className="w-1/3 border-r pr-3">
                    <ul className="space-y-2 text-sm">
                      <li className="py-1 px-2 rounded bg-slate-50">Parent</li>
                      <li className="py-1 px-2 rounded bg-slate-50">Sprint</li>
                      <li className="py-1 px-2 rounded bg-blue-50 font-medium">
                        Assignee
                      </li>
                      <li className="py-1 px-2 rounded bg-slate-50">
                        Work type
                      </li>
                      <li className="py-1 px-2 rounded bg-slate-50">Labels</li>
                      <li className="py-1 px-2 rounded bg-slate-50">Status</li>
                      <li className="py-1 px-2 rounded bg-slate-50">
                        Priority
                      </li>
                    </ul>
                  </div>

                  {/* Right: Assignee list + search and other filters */}
                  <div className="w-2/3 pl-3">
                    {/* Assignee search */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                          placeholder="Search assignee"
                          value={assigneeQuery}
                          onChange={(e) => setAssigneeQuery(e.target.value)}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    {/* Assignee check list */}
                    <div className="max-h-48 overflow-y-auto mb-3 border rounded p-2">
                      <label className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAssignees.size === 0}
                          onChange={() => {
                            setSelectedAssignees(new Set());
                            setAssigneeQuery("");
                          }}
                        />
                        <span className="text-sm">
                          Unassigned (clear selection to show all)
                        </span>
                      </label>

                      {members
                        .filter((m) =>
                          (m.name || "")
                            .toLowerCase()
                            .includes(assigneeQuery.toLowerCase())
                        )
                        .map((m) => (
                          <label
                            key={m.id}
                            className="flex items-center gap-2 mb-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedAssignees.has(String(m.id))}
                              onChange={() => toggleAssignee(m.id)}
                            />
                            <div className="flex items-center gap-2">
                              <Avatar name={m.name} />
                              <span className="text-sm">{m.name}</span>
                            </div>
                          </label>
                        ))}
                    </div>

                    {/* Priority quick filters */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Priority</div>
                      <div className="flex gap-2">
                        {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                          <button
                            key={p}
                            onClick={() => togglePriority(p)}
                            className={`px-3 py-1 rounded border text-sm ${
                              selectedPriorities.has(String(p))
                                ? "bg-blue-600 text-white"
                                : ""
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status quick filters */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div className="flex flex-wrap gap-2">
                        {statuses.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => toggleStatusFilter(s.id)}
                            className={`px-3 py-1 rounded border text-sm ${
                              selectedStatusesFilter.has(String(s.id))
                                ? "bg-blue-600 text-white"
                                : ""
                            }`}
                          >
                            {s.name ?? s.statusName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sprint quick filters (inferred from tasks) */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Sprint</div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(
                          new Set(
                            safeTasks
                              .map((t) => t.sprintId ?? t.sprint?.id)
                              .filter((id) => id != null)
                          )
                        ).map((id) => (
                          <button
                            key={id}
                            onClick={() => toggleSprint(id)}
                            className={`px-3 py-1 rounded border text-sm ${
                              selectedSprints.has(String(id))
                                ? "bg-blue-600 text-white"
                                : ""
                            }`}
                          >
                            Sprint {id}
                          </button>
                        ))}
                        {!safeTasks.some((t) => t.sprintId || t.sprint) && (
                          <div className="text-sm text-gray-400">
                            No sprints found
                          </div>
                        )}
                      </div>
                    </div>

                    {/* footer actions */}
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => {
                          setSelectedAssignees(new Set());
                          setSelectedPriorities(new Set());
                          setSelectedStatusesFilter(new Set());
                          setSelectedSprints(new Set());
                          setAssigneeQuery("");
                          toast.info("Filters cleared");
                        }}
                        className="px-3 py-2 border rounded"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setFilterOpen(false)}
                        className="px-3 py-2 rounded bg-indigo-600 text-white"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* add column: button that toggles input */}
          <div>
            {showAddInput ? (
              <div className="flex items-center gap-2">
                <input
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  placeholder="Column name"
                  className="px-3 py-2 border rounded"
                />
                <button
                  onClick={handleCreateStatus}
                  disabled={creatingStatus}
                  className="px-3 py-2 rounded bg-indigo-600 text-white"
                >
                  {creatingStatus ? "Adding..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setShowAddInput(false);
                    setNewStatusName("");
                  }}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddColumnClick}
                className="flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-slate-50 text-sm"
              >
                <Plus className="w-4 h-4 text-indigo-600" /> Add Column
              </button>
            )}
          </div>

          {/* refresh icon (Loader2) */}
          <button
            onClick={handleRefresh}
            className="px-3 py-2 rounded border bg-white hover:bg-slate-50"
          >
            <Loader2
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="board-statuses"
          direction="horizontal"
          type="STATUS"
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-4 overflow-x-auto pb-4"
            >
              {statuses.map((status, idx) => {
                const storyItems =
                  filteredStoriesByStatusId[String(status.id)] || [];
                const taskItems =
                  filteredTasksByStatusId[String(status.id)] || [];
                const itemsCount = storyItems.length + taskItems.length;
                const showWipWarn = itemsCount > WIP_WARNING_THRESHOLD;
                const colorCls = stableColorClass(status.id ?? status.name);

                return (
                  <Draggable
                    key={String(status.id)}
                    draggableId={String(status.id)}
                    index={idx}
                    type="STATUS"
                  >
                    {(draggableProvided) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        className="bg-white rounded p-4 w-80 flex-shrink-0 border"
                      >
                        <div
                          className="flex items-center justify-between mb-2"
                          {...draggableProvided.dragHandleProps}
                        >
                          <div
                            className={`flex items-center gap-2 px-2 py-1 rounded max-w-[60%] ${colorCls}`}
                          >
                            {editingStatusId === status.id ? (
                              <input
                                value={editingStatusName}
                                onChange={(e) =>
                                  setEditingStatusName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveRename(status.id);
                                  if (e.key === "Escape") cancelRename();
                                }}
                                className="px-2 py-1 rounded border w-full"
                              />
                            ) : (
                              <div className="font-semibold truncate">
                                {status.name ?? status.statusName}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {editingStatusId === status.id ? (
                              <>
                                <button
                                  onClick={() => saveRename(status.id)}
                                  className="px-2 py-1 text-sm bg-indigo-600 text-white rounded"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelRename}
                                  className="px-2 py-1 text-sm border rounded"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  title="Rename"
                                  onClick={() => startRename(status)}
                                  className="p-1 rounded hover:bg-slate-100"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  title="Delete"
                                  onClick={() => handleDeleteClick(status)}
                                  className="p-1 rounded hover:bg-slate-100 text-red-600"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {showWipWarn && (
                          <div className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded mb-2">
                            ⚠️ Column has {itemsCount} items (over{" "}
                            {WIP_WARNING_THRESHOLD})
                          </div>
                        )}

                        <Droppable droppableId={String(status.id)} type="ITEM">
                          {(dropProvided, snapshot) => (
                            <div
                              ref={dropProvided.innerRef}
                              {...dropProvided.droppableProps}
                              className={`min-h-[120px] p-1 rounded ${
                                snapshot.isDraggingOver ? "bg-indigo-50" : ""
                              }`}
                            >
                              {/* STORIES rendered first */}
                              {storyItems.map((story, sIdx) => (
                                <Draggable
                                  key={`story-${story.id}`}
                                  draggableId={`story-${story.id}`}
                                  index={sIdx}
                                  type="ITEM"
                                >
                                  {(storyProvided, storySnapshot) => (
                                    <div
                                      ref={storyProvided.innerRef}
                                      {...storyProvided.draggableProps}
                                      {...storyProvided.dragHandleProps}
                                      className={`bg-white p-3 rounded shadow mb-2 cursor-pointer ${
                                        storySnapshot.isDragging
                                          ? "opacity-80"
                                          : ""
                                      }`}
                                      onClick={
                                        () => openStoryPanel(story)
                                        // open story detail if you have one (you didn't include a StoryDetail modal - placeholder)
                                        // If you do have one, call e.g. openStoryModal(story)
                                        // For now do nothing or console:
                                        // console.log("Open story", story);
                                      }
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="relative group">
                                          <span className="text-blue-500 text-sm cursor-default">
                                            📑
                                          </span>

                                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-md transform -translate-x-1/2 left-1/2 top-6 whitespace-nowrap transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                                            Story
                                          </span>
                                        </div>

                                        <div className="font-medium text-gray-800 truncate ml-2">
                                          {story.title ??
                                            story.name ??
                                            `Story ${story.id}`}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {story.priority ?? ""}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1"></div>

                                        <div className="ml-auto text-xs text-gray-400">
                                          {story.dueDate
                                            ? new Date(
                                                story.dueDate
                                              ).toLocaleDateString()
                                            : ""}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}

                              {/* TASKS */}
                              {taskItems.map((task, tIdx) => (
                                <Draggable
                                  key={`task-${task.id}`}
                                  draggableId={`task-${task.id}`}
                                  index={tIdx + storyItems.length}
                                  type="ITEM"
                                >
                                  {(taskProvided, taskSnapshot) => (
                                    <div
                                      ref={taskProvided.innerRef}
                                      {...taskProvided.draggableProps}
                                      {...taskProvided.dragHandleProps}
                                      onClick={() => openTaskPanel(task)}
                                      className={`bg-white p-3 rounded shadow mb-2 cursor-pointer ${
                                        taskSnapshot.isDragging
                                          ? "opacity-80"
                                          : ""
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="relative group">
                                          <span className="text-green-600 text-sm cursor-default">
                                            ☑️
                                          </span>

                                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-md transform -translate-x-1/2 left-1/2 top-6 whitespace-nowrap transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                                            Task
                                          </span>
                                        </div>
                                        <div className="font-medium text-gray-800 truncate ml-2">
                                          {task.title ??
                                            task.name ??
                                            `Task ${task.id}`}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {task.priority ?? ""}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1"></div>
                                        <div className="ml-auto text-xs text-gray-400">
                                          {task.dueDate
                                            ? new Date(
                                                task.dueDate
                                              ).toLocaleDateString()
                                            : ""}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {dropProvided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        {/* Create dropdown - replaced the previous 'Add Task' button */}
                        <div className="mt-3 relative">
                          <button
                            onClick={() =>
                              setCreateMenuFor((prev) =>
                                prev === status.id ? null : status.id
                              )
                            }
                            className="text-indigo-600 hover:underline text-sm flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" /> Create
                          </button>

                          {createMenuFor === status.id && (
                            <div className="absolute left-0 mt-2 w-44 bg-white border rounded shadow z-50">
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                                onClick={() => {
                                  setCreateMenuFor(null);
                                  setOpenCreateStoryModal({
                                    projectId,
                                    statusId: status.id,
                                    activeSprintId,
                                  });
                                }}
                              >
                                Create Story
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                                onClick={() => {
                                  setCreateMenuFor(null);
                                  setOpenCreateTaskModal({
                                    projectId,
                                    statusId: status.id,
                                    activeSprintId,
                                  });
                                }}
                              >
                                Create Task
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Modals */}
      {/* Legacy create modal (kept for compatibility) */}
      <CreateTaskModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultStatusId={createDefaultStatusId}
        projectId={projectId}
        onCreated={handleTaskCreated}
      />
      <RightSidePanel
        isOpen={isTaskPanelOpen}
        onClose={() => {
          setIsTaskPanelOpen(false);
          setSelectedTask(null);
        }}
        panelMode="board" // 👈 IMPORTANT
      >
        {isTaskPanelOpen && selectedTask && (
          <EditTaskForm
            taskId={selectedTask.id}
            projectId={projectId}
            onClose={() => {
              setIsTaskPanelOpen(false);
              setSelectedTask(null);
            }}
            onUpdated={async () => {
              await loadBoard();
              setIsTaskPanelOpen(false);
            }}
          />
        )}
      </RightSidePanel>
      <RightSidePanel
        isOpen={isStoryPanelOpen}
        onClose={() => {
          setIsStoryPanelOpen(false);
          setSelectedStory(null);
        }}
        panelMode="board"
      >
        {isStoryPanelOpen && selectedStory && (
          <EditStoryForm
            storyId={selectedStory.id}
            projectId={projectId}
            onClose={() => {
              setIsStoryPanelOpen(false);
              setSelectedStory(null);
            }}
            onUpdated={async () => {
              await loadBoard();
              //setIsStoryPanelOpen(false);
            }}
          />
        )}
      </RightSidePanel>

      <DeleteStatusModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        statusToDelete={statusToDelete}
        otherStatuses={deleteModalOtherStatuses}
        onConfirm={confirmDeleteWithMigration}
      />

      {/* New: Create Story Modal */}
      {/* ===================== Story Modal ===================== */}
      {openCreateStoryModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          {/* <div className="bg-white rounded-2xl shadow-lg p-6 w-[600px] max-w-full relative max-h-[90vh] overflow-y-auto"> */}
          {/* Close Button */}
          {/* <button
        onClick={() => setOpenCreateStoryModal(null)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
      >
        ✕
      </button> */}

          {/* Story Form */}
          <CreateStoryForm
            projectId={openCreateStoryModal.projectId}
            defaultStatusId={openCreateStoryModal.statusId}
            defaultSprintId={openCreateStoryModal.activeSprintId}
            onClose={() => setOpenCreateStoryModal(null)}
            onCreated={async (created) => {
              setOpenCreateStoryModal(null);
              // Optimistic add
              setStories((prev) => [...prev, created]);
              try {
                await loadBoard();
              } catch (e) {
                console.error(e);
              }
            }}
          />
        </div>
        // </div>
      )}

{sprintPopup && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-[500px] max-w-full relative">
      <button
        onClick={() => setSprintPopup(null)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
      >
        ✕
      </button>

      <h3 className="text-lg font-semibold mb-2">{sprintPopup.sprintName}</h3>
      {sprintPopup.hasUnfinishedTasks && (
        <p className="text-sm text-red-600 mb-4">
          There are unfinished tasks in this sprint.
        </p>
      )}
      {sprintPopup.endingSoon && (
        <p className="text-sm text-yellow-600 mb-4">
          Sprint is ending soon.
        </p>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => finishSprint("NEXT_SPRINT")}
          disabled={isFinishingSprint}
          className="px-3 py-2 rounded bg-blue-600 text-white"
        >
          Move to Next Sprint
        </button>
        <button
          onClick={() => finishSprint("BACKLOG")}
          disabled={isFinishingSprint}
          className="px-3 py-2 rounded border"
        >
          Move to Backlog
        </button>
      </div>
    </div>
  </div>
)}


      {/* ===================== Task Modal ===================== */}
      {openCreateTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          {/* <div className="bg-white rounded-2xl shadow-lg p-6 w-[600px] max-w-full relative max-h-[90vh] overflow-y-auto"> */}
          {/* Close Button */}
          {/* <button
        onClick={() => setOpenCreateTaskModal(null)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
      >
        ✕
      </button> */}

          {/* Task Form */}
          <CreateTaskForm
            projectId={openCreateTaskModal.projectId}
            defaultStatusId={openCreateTaskModal.statusId}
            defaultSprintId={openCreateTaskModal.activeSprintId}
            onClose={() => setOpenCreateTaskModal(null)}
            onCreated={async (created) => {
              setOpenCreateTaskModal(null);
              // Optimistic add
              setTasks((prev) => [...prev, created]);
              try {
                await loadBoard();
              } catch (e) {
                console.error(e);
              }
            }}
          />
        </div>
        // </div>
      )}
    </div>
  );
};

export default Board;