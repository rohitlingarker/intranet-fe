import React, { useState, useEffect } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ClipboardList } from "lucide-react";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/LoadingSpinner";

const getColumnStyles = () => ({
  header:
    "bg-indigo-900 text-white rounded-t-2xl font-bold text-lg py-3 text-center",
  body: "bg-white rounded-b-2xl p-4 flex-1 min-h-auto",
  container:
    "rounded-2xl h-auto shadow-lg border border-gray-300 flex flex-col flex-1",
});

// --------------------
// Kanban Card
// --------------------
const KanbanCard = ({ task }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: "TASK",
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={dragRef}
      className={`bg-white rounded-2xl shadow p-4 mb-3 cursor-move border border-gray-200 hover:shadow-lg transition ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList className="text-indigo-500 w-4 h-4" />
        <p className="font-semibold text-gray-800">{task.title}</p>
      </div>
      {task.status === "DONE" && (
        <span className="text-green-600 text-sm font-medium">✅ Completed</span>
      )}
    </div>
  );
};

// --------------------
// Kanban Column
// --------------------
const KanbanColumn = ({ status, tasks, onDrop, validTransitions }) => {
  const { header, body, container } = getColumnStyles();

  const [{ isOver }, dropRef] = useDrop({
    accept: "TASK",
    drop: (item) => {
      const allowed = validTransitions[item.status]?.includes(status);
      if (!allowed) {
        toast.error(`Invalid transition: ${item.status} → ${status}`);
        return;
      }
      if (item.status !== status) {
        onDrop(item.id, status);
        item.status = status;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className={container}>
      <div className={header}>{status.replace(/_/g, " ")}</div>
      <div ref={dropRef} className={`${body} ${isOver ? "bg-indigo-50" : ""}`}>
        {tasks.length === 0 ? (
          <p className="text-gray-400 italic">No tasks</p>
        ) : (
          tasks.map((task) => <KanbanCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
};

// --------------------
// MAIN BOARD
// --------------------
const Board = ({ projectId, projectName }) => {
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSprint, setCurrentSprint] = useState(null);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    const fetchBoardData = async () => {
      setLoading(true);
      try {
        // Fetch statuses (dynamic)
        const statusRes = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/statuses`,
          { headers }
        );

        const sortedStatuses = statusRes.data.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );

        // Extract names
        const statusNames = sortedStatuses.map((s) => s.name);
        setStatuses(statusNames);

        // Map: statusName → statusId
        const map = {};
        sortedStatuses.forEach((s) => {
          map[s.name] = s.id;
        });
        setStatusMap(map);

        // Fetch active sprint
        const sprintRes = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/sprints/active/project/${projectId}`,
          { headers }
        );

        const active = sprintRes.data;
        if (!active || active.length === 0) {
          setCurrentSprint(null);
          setTasks([]);
          setLoading(false);
          return;
        }

        const sprint = active[0];
        setCurrentSprint({
          id: sprint.id,
          name: sprint.name || `Sprint ${sprint.id}`,
        });

        // Fetch tasks inside sprint
        const tasksRes = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/sprints/${sprint.id}/tasks`,
          { headers }
        );

        const normalized = tasksRes.data.map((t) => ({
          ...t,
          status: t.status, // backend sends correct status name
        }));

        setTasks(normalized);
      } catch (err) {
        console.error("Error loading board:", err);
        setCurrentSprint(null);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [projectId, token]);

  // --------------------
  // Auto-generate transitions based on sortOrder
  // --------------------
  const validTransitions = {};
  statuses.forEach((status, index) => {
    validTransitions[status] =
      index < statuses.length - 1 ? [statuses[index + 1]] : [];
  });

  // --------------------
  // Handle DROP
  // --------------------
  const handleDrop = async (taskId, newStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!validTransitions[task.status]?.includes(newStatus)) {
      toast.error(`Invalid transition: ${task.status} → ${newStatus}`);
      return;
    }

    const statusId = statusMap[newStatus];
    if (!statusId) {
      toast.error("Could not find statusId for update");
      return;
    }

    try {
      // PATCH backend
      await axios.patch(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}/status`,
        { statusId },
        { headers }
      );

      // UI update
      const updated = tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      setTasks(updated);

      toast.success("Task status updated");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update status");
    }
  };

  // Group tasks dynamically
  const grouped = {};
  statuses.forEach((status) => {
    grouped[status] = tasks.filter((t) => t.status === status);
  });

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner text="Loading sprint board..." />
      </div>
    );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 min-h-auto">
        <h3 className="text-xl font-semibold mb-3 text-indigo-900">
          Scrum Board: {projectName}
        </h3>

        {currentSprint ? (
          <div className="mb-6 flex gap-2 items-center">
            <span className="bg-indigo-100 text-indigo-900 px-4 py-2 rounded-2xl font-medium text-sm shadow">
              Current Sprint: {currentSprint.name}
            </span>
          </div>
        ) : (
          <p className="text-gray-500 italic mb-6">
            No active sprint found for this project.
          </p>
        )}

        <div className={`grid h-auto grid-cols-1 md:grid-cols-${statuses.length} gap-6`}>
          {statuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={grouped[status] || []}
              onDrop={handleDrop}
              validTransitions={validTransitions}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default Board;
