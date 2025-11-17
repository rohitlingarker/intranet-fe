"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import {
  Plus,
  Trash,
  Edit3,
  Loader2,
  Filter,
  Search,
  User
} from "lucide-react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const initials = (name || "U").split(" ").map(x => x[0]).slice(0,2).join("").toUpperCase();
  const color = stableColorClass(name || initials);
  return <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${color}`}>{initials}</div>;
};

/* -------------------
  Create Task Modal (minimal)
--------------------*/
const CreateTaskModal = ({ open, onClose, defaultStatusId, projectId, onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (open) { setTitle(""); setDescription(""); } }, [open]);

  if (!open) return null;

  const handleCreate = async (e) => {
    e?.preventDefault();
    if (!title.trim()) { toast.error("Title required"); return; }
    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE}/api/tasks`, {
        title: title.trim(),
        description: description.trim(),
        projectId,
        statusId: defaultStatusId,
      }, { headers: headersWithToken() });
      onCreated(res.data);
      toast.success("Task created");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg p-5">
        <h3 className="text-lg font-semibold mb-3">Create task</h3>
        <form onSubmit={handleCreate}>
          <label className="block mb-2">
            <div className="text-sm font-medium">Title</div>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          </label>
          <label className="block mb-2">
            <div className="text-sm font-medium">Description</div>
            <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" rows={4} />
          </label>
          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-indigo-600 text-white">{submitting ? "Creating..." : "Create"}</button>
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
  const [statusId, setStatusId] = useState(task?.status?.id ?? task?.statusId ?? "");
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
      if (String(statusId) !== String(task?.status?.id ?? task?.statusId)) payload.statusId = Number(statusId);

      if (Object.keys(payload).length === 0) {
        toast.info("No changes");
        setSaving(false);
        return;
      }

      await axios.patch(`${BASE}/api/tasks/${task.id}/status`, payload, { headers: headersWithToken() });
      toast.success("Saved");
      onSaved({ ...task, ...payload, status: payload.statusId ? { id: payload.statusId } : task.status });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-5">
        <h3 className="text-lg font-semibold mb-3">Task details</h3>
        <form onSubmit={handleSave}>
          <label className="block mb-2">
            <div className="text-sm font-medium">Title</div>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          </label>
          <label className="block mb-2">
            <div className="text-sm font-medium">Description</div>
            <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" rows={4} />
          </label>
          <label className="block mb-2">
            <div className="text-sm font-medium">Status</div>
            <select value={statusId} onChange={(e)=>setStatusId(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
              <option value="">-- Select status --</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.name ?? s.statusName}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-indigo-600 text-white">{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------
  Delete Status Modal
--------------------*/
const DeleteStatusModal = ({ open, onClose, statusToDelete, otherStatuses, onConfirm }) => {
  const [selectedNewStatus, setSelectedNewStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (open) setSelectedNewStatus(""); }, [open, statusToDelete]);

  if (!open) return null;

  const canConfirm = selectedNewStatus && Number(selectedNewStatus) !== Number(statusToDelete?.id);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    try {
      await onConfirm(Number(selectedNewStatus));
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl p-6">
        <h3 className="text-lg font-semibold mb-2">Move work from {statusToDelete?.name ?? statusToDelete?.statusName} column</h3>
        <p className="mb-4 text-sm text-gray-700">Select a new home for any work with the {statusToDelete?.name ?? statusToDelete?.statusName} status — the work will be moved there and this status will be deleted.</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500">This status will be deleted</div>
            <div className="mt-2 px-3 py-2 border rounded inline-block">{statusToDelete?.name ?? statusToDelete?.statusName}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Move existing work items to</div>
            <select value={selectedNewStatus} onChange={(e)=>setSelectedNewStatus(e.target.value)} className="w-full mt-2 border rounded px-3 py-2">
              <option value="">-- Select destination status --</option>
              {otherStatuses.map(s => <option key={s.id} value={s.id}>{s.name ?? s.statusName}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
          <button onClick={handleConfirm} disabled={!canConfirm || submitting} className="px-4 py-2 rounded bg-red-600 text-white">{submitting ? "Processing..." : "Confirm & Delete"}</button>
        </div>
      </div>
    </div>
  );
};

/* -------------------
  Main Board
--------------------*/
const Board = ({ projectId, sprintId = null, projectName }) => {
  // data
  const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]); // for assignee filter
  const [loading, setLoading] = useState(true);

  // add column ui
  const [showAddInput, setShowAddInput] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [creatingStatus, setCreatingStatus] = useState(false);

  // modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatusId, setCreateDefaultStatusId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
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
  const [selectedStatusesFilter, setSelectedStatusesFilter] = useState(new Set());
  const [selectedSprints, setSelectedSprints] = useState(new Set());

  // load data
  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const statusReq = axios.get(`${BASE}/api/projects/${projectId}/statuses`, { headers: headersWithToken() });
      const tasksUrl = sprintId ? `${BASE}/api/sprints/${sprintId}/tasks` : `${BASE}/api/projects/${projectId}/tasks`;
      const tasksReq = axios.get(tasksUrl, { headers: headersWithToken() });

      // try members endpoint but don't fail board if missing
      const membersReq = axios.get(`${BASE}/api/projects/${projectId}/members`, { headers: headersWithToken() }).catch(() => ({ data: [] }));

      const [sRes, tRes, mRes] = await Promise.all([statusReq, tasksReq, membersReq]);

      const statusData = Array.isArray(sRes.data) ? sRes.data : (sRes.data?.content ?? []);
      const ordered = statusData.slice().sort((a,b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setStatuses(ordered);

      let tasksData = [];
      if (Array.isArray(tRes.data)) tasksData = tRes.data;
      else if (Array.isArray(tRes.data?.content)) tasksData = tRes.data.content;
      else if (Array.isArray(tRes.data?.tasks)) tasksData = tRes.data.tasks;
      else tasksData = [];
      setTasks(tasksData);

      // members: if members endpoint returned array use it, otherwise infer from tasks
      if (Array.isArray(mRes.data) && mRes.data.length > 0) {
        setMembers(mRes.data.map(m => ({ id: m.id, name: m.fullName ?? m.name })));
      } else {
        // infer assignees from tasks
        const map = {};
        tasksData.forEach(t => {
          const aid = t.assigneeId ?? t.assignee?.id;
          const aname = t.assigneeName ?? t.assignee?.name ?? t.assignee?.fullName;
          if (aid != null) map[aid] = aname ?? `User ${aid}`;
        });
        setMembers(Object.entries(map).map(([id, name]) => ({ id: Number(id), name })));
      }
    } catch (err) {
      console.error("Load board failed", err);
      toast.error("Failed to load board");
      setStatuses([]);
      setTasks([]);
      setMembers([]);
    } finally { setLoading(false); }
  }, [projectId, sprintId]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  // safe arrays & grouping (original grouping)
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const tasksByStatusId = useMemo(() => {
    const acc = {};
    statuses.forEach(s => acc[String(s.id)] = []);
    safeTasks.forEach(t => {
      const sid = t?.status?.id ?? t?.statusId ?? null;
      const key = sid !== null ? String(sid) : null;
      if (key && acc[key]) acc[key].push(t);
      else if (statuses.length) acc[String(statuses[0].id)].push(t);
    });
    return acc;
  }, [safeTasks, statuses]);

  // ---------- Filtering logic ----------
  const filterCount = useMemo(() => {
    const c = (selectedAssignees.size ? selectedAssignees.size : 0)
      + (selectedPriorities.size ? selectedPriorities.size : 0)
      + (selectedStatusesFilter.size ? selectedStatusesFilter.size : 0)
      + (selectedSprints.size ? selectedSprints.size : 0);
    return c;
  }, [selectedAssignees, selectedPriorities, selectedStatusesFilter, selectedSprints]);

  // apply filters: returns tasksByStatusId but only including tasks matching filters (if any filter active)
  const filteredTasksByStatusId = useMemo(() => {
    const active = filterCount > 0;
    if (!active) return tasksByStatusId;

    const res = {};
    Object.keys(tasksByStatusId).forEach(statusId => {
      res[statusId] = tasksByStatusId[statusId].filter(t => {
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
          const sId = (t.status?.id ?? t.statusId);
          if (!selectedStatusesFilter.has(String(sId))) return false;
        }
        // sprint
        if (selectedSprints.size > 0) {
          const sp = (t.sprintId ?? t.sprint?.id);
          if (!selectedSprints.has(String(sp))) return false;
        }
        return true;
      });
    });
    return res;
  }, [tasksByStatusId, selectedAssignees, selectedPriorities, selectedStatusesFilter, selectedSprints, filterCount]);

  // helper to toggle sets
  const toggleSet = (setStateFn, setRef, val) => {
    setRef(prev => {
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
    if (!name) { toast.error("Column name required"); return; }
    setCreatingStatus(true);
    try {
      const res = await axios.post(`${BASE}/api/projects/${projectId}/statuses`, { name }, { headers: headersWithToken() });
      setStatuses(prev => [...prev, res.data].slice().sort((a,b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
      setNewStatusName("");
      setShowAddInput(false);
      toast.success("Column added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add column");
    } finally { setCreatingStatus(false); }
  };

  // refresh action (loader)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadBoard();
      toast.info("Board refreshed");
    } catch (_) {}
    finally { setIsRefreshing(false); }
  };

  // delete action entry: decide direct delete or show modal
  const handleDeleteClick = (status) => {
    const assigned = safeTasks.filter(t => (t?.status?.id ?? t?.statusId) === Number(status.id));
    if (assigned.length === 0) {
      // direct delete
      doDirectDelete(status.id);
      return;
    }
    // show modal with other statuses
    setDeleteModalOtherStatuses(statuses.filter(s => s.id !== status.id));
    setStatusToDelete(status);
    setIsDeleteModalOpen(true);
  };

  const doDirectDelete = async (statusId) => {
    try {
      await axios.delete(`${BASE}/api/statuses/${statusId}`, { headers: headersWithToken() });
      toast.success("Column deleted");
      setStatuses(prev => prev.filter(s => s.id !== statusId));
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
      await axios.delete(`${BASE}/api/statuses/${statusToDelete.id}`, { params: { newStatusId }, headers: headersWithToken() });
      toast.success("Column deleted and tasks moved");
      setStatuses(prev => prev.filter(s => s.id !== statusToDelete.id));
      setIsDeleteModalOpen(false);
      setStatusToDelete(null);
      await loadBoard();
    } catch (err) {
      console.error(err);
      toast.error("Delete/migrate failed");
      await loadBoard();
    }
  };

  // rename flow
  const startRename = (status) => {
    setEditingStatusId(status.id);
    setEditingStatusName(status.name ?? status.statusName ?? "");
  };
  const cancelRename = () => { setEditingStatusId(null); setEditingStatusName(""); };
  const saveRename = async (statusId) => {
    const name = (editingStatusName || "").trim();
    if (!name) { toast.error("Name required"); return; }
    try {
      const payload = statuses.map(s => (s.id === statusId ? { ...s, name } : s));
      await axios.put(`${BASE}/api/projects/${projectId}/statuses`, payload, { headers: headersWithToken() });
      setStatuses(prev => prev.map(s => s.id === statusId ? { ...s, name } : s));
      toast.success("Renamed");
    } catch (err) {
      console.error(err);
      toast.error("Rename failed");
      await loadBoard();
    } finally { cancelRename(); }
  };

  // DnD handlers
  const makeReorderPayload = (ordered) => {
    const mapping = {};
    ordered.forEach((s, i) => mapping[String(s.id)] = i+1);
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
        await axios.post(`${BASE}/api/statuses/reorder`, payload, { headers: headersWithToken() });
        toast.success("Columns reordered");
        return;
      }

      // TASK move
      const srcStatusId = source.droppableId;
      const destStatusId = destination.droppableId;
      if (srcStatusId === destStatusId && source.index === destination.index) return;

      const srcList = Array.from(filteredTasksByStatusId[String(srcStatusId)] || []);
      const destList = Array.from(filteredTasksByStatusId[String(destStatusId)] || []);
      const [moved] = srcList.splice(source.index, 1);
      if (!moved) return;

      const movedUpdated = { ...moved, status: { id: Number(destStatusId) } };
      destList.splice(destination.index, 0, movedUpdated);
      // flatten to tasks array for optimistic UI
      const merged = [];
      Object.keys(filteredTasksByStatusId).forEach(k => {
        if (String(k) === String(srcStatusId)) merged.push(...srcList);
        else if (String(k) === String(destStatusId)) merged.push(...destList);
        else merged.push(...filteredTasksByStatusId[k]);
      });
      setTasks(merged);

      await axios.patch(`${BASE}/api/tasks/${draggableId}/status`, { statusId: Number(destStatusId) }, { headers: headersWithToken() });
      toast.success("Task moved");
    } catch (err) {
      console.error(err);
      toast.error("Move failed, reloading");
      await loadBoard();
    }
  };

  // helpers for filter toggles (we use String values)
  const toggleAssignee = (id) => {
    setSelectedAssignees(prev => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const togglePriority = (p) => {
    const key = String(p);
    setSelectedPriorities(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const toggleStatusFilter = (sId) => {
    const key = String(sId);
    setSelectedStatusesFilter(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const toggleSprint = (id) => {
    const key = String(id);
    setSelectedSprints(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // open create modal
  const openCreateForStatus = (statusId) => {
    setCreateDefaultStatusId(statusId);
    setIsCreateOpen(true);
  };
  const handleTaskCreated = (created) => setTasks(prev => [...prev, created]);

  // open task modal
  const openTaskModal = (task) => { setSelectedTask(task); setIsTaskModalOpen(true); };
  const handleTaskSaved = (updated) => setTasks(prev => prev.map(t => String(t.id) === String(updated.id) ? { ...t, ...updated } : t));

  // clicking outside filter dropdown closes it
  useEffect(() => {
    const onDocClick = (e) => {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    if (filterOpen) document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [filterOpen]);

  if (loading) return <div className="flex justify-center items-center min-h-[200px]"><LoadingSpinner text="Loading board..." /></div>;

  return (
    <div className="p-6">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{projectName ?? "Project Board"}</h2>

        <div className="flex items-center gap-3">
          {/* Filter button (Jira-style) */}
          <div className="relative" ref={filterRef}>
            <button onClick={() => setFilterOpen(o => !o)} className="flex items-center gap-2 px-3 py-2 rounded border text-sm bg-white hover:bg-slate-50">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium">Filter</span>
              {filterCount > 0 && <span className="ml-1 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded">{filterCount}</span>}
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
                      <li className="py-1 px-2 rounded bg-blue-50 font-medium">Assignee</li>
                      <li className="py-1 px-2 rounded bg-slate-50">Work type</li>
                      <li className="py-1 px-2 rounded bg-slate-50">Labels</li>
                      <li className="py-1 px-2 rounded bg-slate-50">Status</li>
                      <li className="py-1 px-2 rounded bg-slate-50">Priority</li>
                    </ul>
                  </div>

                  {/* Right: Assignee list + search and other filters */}
                  <div className="w-2/3 pl-3">
                    {/* Assignee search */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input placeholder="Search assignee" value={assigneeQuery} onChange={(e) => setAssigneeQuery(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                      </div>
                    </div>

                    {/* Assignee check list */}
                    <div className="max-h-48 overflow-y-auto mb-3 border rounded p-2">
                      <label className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input type="checkbox" checked={selectedAssignees.size === 0} onChange={() => { setSelectedAssignees(new Set()); setAssigneeQuery(""); }} />
                        <span className="text-sm">Unassigned (clear selection to show all)</span>
                      </label>

                      {members.filter(m => (m.name || "").toLowerCase().includes(assigneeQuery.toLowerCase())).map(m => (
                        <label key={m.id} className="flex items-center gap-2 mb-2 cursor-pointer">
                          <input type="checkbox" checked={selectedAssignees.has(String(m.id))} onChange={() => toggleAssignee(m.id)} />
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
                        {["LOW","MEDIUM","HIGH","CRITICAL"].map(p => (
                          <button key={p} onClick={() => togglePriority(p)} className={`px-3 py-1 rounded border text-sm ${selectedPriorities.has(String(p)) ? "bg-blue-600 text-white" : ""}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status quick filters */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div className="flex flex-wrap gap-2">
                        {statuses.map(s => (
                          <button key={s.id} onClick={() => toggleStatusFilter(s.id)} className={`px-3 py-1 rounded border text-sm ${selectedStatusesFilter.has(String(s.id)) ? "bg-blue-600 text-white" : ""}`}>
                            {s.name ?? s.statusName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sprint quick filters (inferred from tasks) */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Sprint</div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(safeTasks.map(t => t.sprintId ?? t.sprint?.id).filter(id => id != null))).map(id => (
                          <button key={id} onClick={() => toggleSprint(id)} className={`px-3 py-1 rounded border text-sm ${selectedSprints.has(String(id)) ? "bg-blue-600 text-white" : ""}`}>
                            Sprint {id}
                          </button>
                        ))}
                        { !safeTasks.some(t => t.sprintId || t.sprint) && <div className="text-sm text-gray-400">No sprints found</div> }
                      </div>
                    </div>

                    {/* footer actions */}
                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => { setSelectedAssignees(new Set()); setSelectedPriorities(new Set()); setSelectedStatusesFilter(new Set()); setSelectedSprints(new Set()); setAssigneeQuery(""); toast.info("Filters cleared"); }} className="px-3 py-2 border rounded">Clear</button>
                      <button onClick={() => setFilterOpen(false)} className="px-3 py-2 rounded bg-indigo-600 text-white">Apply</button>
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
                <input value={newStatusName} onChange={(e)=>setNewStatusName(e.target.value)} placeholder="Column name" className="px-3 py-2 border rounded" />
                <button onClick={handleCreateStatus} disabled={creatingStatus} className="px-3 py-2 rounded bg-indigo-600 text-white">{creatingStatus ? "Adding..." : "Save"}</button>
                <button onClick={()=>{ setShowAddInput(false); setNewStatusName(""); }} className="px-3 py-2 border rounded">Cancel</button>
              </div>
            ) : (
              <button onClick={handleAddColumnClick} className="flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-slate-50 text-sm">
                <Plus className="w-4 h-4 text-indigo-600" /> Add Column
              </button>
            )}
          </div>

          {/* refresh icon (Loader2) */}
          <button onClick={handleRefresh} className="px-3 py-2 rounded border bg-white hover:bg-slate-50">
            <Loader2 className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board-statuses" direction="horizontal" type="STATUS">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-4 overflow-x-auto pb-4">
              {statuses.map((status, idx) => {
                const items = filteredTasksByStatusId[String(status.id)] || [];
                const showWipWarn = items.length > WIP_WARNING_THRESHOLD;
                const colorCls = stableColorClass(status.id ?? status.name);

                return (
                  <Draggable key={String(status.id)} draggableId={String(status.id)} index={idx} type="STATUS">
                    {(draggableProvided) => (
                      <div ref={draggableProvided.innerRef} {...draggableProvided.draggableProps} className="bg-white rounded p-4 w-80 flex-shrink-0 border">
                        <div className="flex items-center justify-between mb-2" {...draggableProvided.dragHandleProps}>
                          <div className={`flex items-center gap-2 px-2 py-1 rounded max-w-[60%] ${colorCls}`}>
                            {editingStatusId === status.id ? (
                              <input value={editingStatusName} onChange={(e)=>setEditingStatusName(e.target.value)} onKeyDown={(e)=>{ if (e.key === "Enter") saveRename(status.id); if (e.key === "Escape") cancelRename(); }} className="px-2 py-1 rounded border w-full" />
                            ) : (
                              <div className="font-semibold truncate">{status.name ?? status.statusName}</div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {editingStatusId === status.id ? (
                              <>
                                <button onClick={()=>saveRename(status.id)} className="px-2 py-1 text-sm bg-indigo-600 text-white rounded">Save</button>
                                <button onClick={cancelRename} className="px-2 py-1 text-sm border rounded">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button title="Rename" onClick={()=>startRename(status)} className="p-1 rounded hover:bg-slate-100"><Edit3 className="w-4 h-4" /></button>
                                <button title="Delete" onClick={()=>handleDeleteClick(status)} className="p-1 rounded hover:bg-slate-100 text-red-600"><Trash className="w-4 h-4" /></button>
                              </>
                            )}
                          </div>
                        </div>

                        {showWipWarn && <div className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded mb-2">⚠️ Column has {items.length} tasks (over {WIP_WARNING_THRESHOLD})</div>}

                        <Droppable droppableId={String(status.id)} type="TASK">
                          {(dropProvided, snapshot) => (
                            <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className={`min-h-[120px] p-1 rounded ${snapshot.isDraggingOver ? "bg-indigo-50" : ""}`}>
                              {items.map((task, tIdx) => (
                                <Draggable key={String(task.id)} draggableId={String(task.id)} index={tIdx} type="TASK">
                                  {(taskProvided, taskSnapshot) => (
                                    <div ref={taskProvided.innerRef} {...taskProvided.draggableProps} {...taskProvided.dragHandleProps} onClick={()=>openTaskModal(task)} className={`bg-white p-3 rounded shadow mb-2 cursor-pointer ${taskSnapshot.isDragging ? "opacity-80" : ""}`}>
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium text-gray-800 truncate">{task.title ?? task.name ?? `Task ${task.id}`}</div>
                                        <div className="text-xs text-gray-400">{task.priority ?? ""}</div>
                                      </div>
                                      {task.description && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</div>}
                                      <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1">
                                          <Avatar name={task.assigneeName ?? task.assignee?.name ?? ""} />
                                          <div className="text-xs text-gray-500">{task.assigneeName ?? task.assignee?.name}</div>
                                        </div>
                                        <div className="ml-auto text-xs text-gray-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}</div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {dropProvided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        <div className="mt-3">
                          <button onClick={()=>openCreateForStatus(status.id)} className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Task
                          </button>
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
      <CreateTaskModal open={isCreateOpen} onClose={()=>setIsCreateOpen(false)} defaultStatusId={createDefaultStatusId} projectId={projectId} onCreated={handleTaskCreated} />
      <TaskDetailModal open={isTaskModalOpen} onClose={()=>setIsTaskModalOpen(false)} task={selectedTask} statuses={statuses} onSaved={handleTaskSaved} />
      <DeleteStatusModal open={isDeleteModalOpen} onClose={()=>setIsDeleteModalOpen(false)} statusToDelete={statusToDelete} otherStatuses={deleteModalOtherStatuses} onConfirm={confirmDeleteWithMigration} />
    </div>
  );
};

export default Board;
