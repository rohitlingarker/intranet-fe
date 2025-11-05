import React, { useState, useEffect } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ClipboardList } from "lucide-react";
import LoadingSpinner from "../../../components/LoadingSpinner";

const getColumnStyles = () => ({
  header:
    "bg-indigo-900 text-white rounded-t-2xl font-bold text-lg py-3 text-center",
  body: "bg-white rounded-b-2xl p-4 flex-1 min-h-auto",
  container:
    "rounded-2xl h-auto shadow-lg border border-gray-300 flex flex-col flex-1",
});

// ========== KANBAN CARD ==========
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

// ========== KANBAN COLUMN ==========
const KanbanColumn = ({ status, tasks, onDrop }) => {
  const { header, body, container } = getColumnStyles();

  const [{ isOver }, dropRef] = useDrop({
    accept: "TASK",
    drop: (item) => {
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

// ========== MAIN BOARD ==========
const Board = ({ projectId, projectName }) => {
  const [tasks, setTasks] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [sprints, setSprints] = useState([]);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const backendStatusMap = {
    TO_DO: "TODO",
    IN_PROGRESS: "IN_PROGRESS",
    DONE: "DONE",
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [storiesRes, tasksRes, sprintsRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`,
            { headers }
          ),
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`,
            { headers }
          ),
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`,
            { headers }
          ),
        ]);

        const storiesData = storiesRes.data;
        const tasksData = tasksRes.data;
        const sprintsData = sprintsRes.data;

        setSprints(sprintsData);
        setStories(storiesData);

        const activeSprint =
          sprintsData.find((s) => s.status === "ACTIVE") || null;

        if (!activeSprint) {
          console.warn("No active sprint found for this project");
          setCurrentSprint(null);
          setTasks([]);
          setLoading(false);
          return;
        }

        setCurrentSprint({
          id: activeSprint.id,
          name: activeSprint.name || `Sprint ${activeSprint.id}`,
        });

        // ✅ Corrected story filter: use story.sprintId === activeSprint.id
        const sprintStoryIds = storiesData
          .filter((story) => story.sprintId === activeSprint.id)
          .map((story) => story.id);

        // ✅ Normalize and filter tasks by those stories
        const normalizedTasks = tasksData
          .map((task) => ({
            ...task,
            status:
              task.status === "TODO"
                ? "TO_DO"
                : task.status === "IN_PROGRESS"
                ? "IN_PROGRESS"
                : task.status === "DONE"
                ? "DONE"
                : "TO_DO",
          }))
          .filter((task) => sprintStoryIds.includes(task.storyId));

        setTasks(normalizedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [projectId, token]);

  const handleDrop = async (taskId, newStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, status: newStatus };

    try {
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}`,
        { ...updatedTask, status: backendStatusMap[newStatus] },
        { headers }
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const grouped = {
    TO_DO: tasks.filter((t) => t.status === "TO_DO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  };

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

        <div className="grid h-auto grid-cols-1 md:grid-cols-3 gap-6">
          {["TO_DO", "IN_PROGRESS", "DONE"].map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={grouped[status]}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default Board;
