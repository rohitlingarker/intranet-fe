import React, { useEffect, useState } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const getColumnStyles = (status) => {
  switch (status) {
    case "TO_DO":
    case "IN_PROGRESS":
    case "DONE":
      return {
        header:
          "bg-indigo-900 text-white rounded-t-2xl font-bold text-lg py-3 text-center",
        body: "bg-white rounded-b-2xl p-4 flex-1 min-h-[500px]",
        container:
          "rounded-2xl shadow-lg border border-gray-300 flex flex-col flex-1",
      };
    default:
      return {
        header:
          "bg-gray-300 text-black rounded-t-2xl font-bold text-lg py-3 text-center",
        body: "bg-gray-100 rounded-b-2xl p-4 flex-1 min-h-[500px]",
        container:
          "rounded-2xl shadow-lg border border-gray-300 flex flex-col flex-1",
      };
  }
};

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
      <p className="text-xs text-indigo-500 uppercase tracking-wide mb-1">Task</p>
      <p className="font-semibold text-gray-800">{task.title}</p>
      {task.status === "DONE" && <span className="text-green-600 text-lg">✅</span>}
    </div>
  );
};

const KanbanColumn = ({ status, tasks, onDrop }) => {
  const { header, body, container } = getColumnStyles(status);

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

const Board = ({ projectId, projectName }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token"); // Get JWT token

  // Map frontend status to backend status
  const backendStatusMap = {
    TO_DO: "TODO",
    IN_PROGRESS: "IN_PROGRESS",
    DONE: "DONE",
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`,
          {
            headers: { Authorization: `Bearer ${token}` }, // attach token
          }
        );

        const normalizedTasks = res.data.map((task) => ({
          ...task,
          status:
            task.status === "TODO"
              ? "TO_DO"
              : task.status === "IN_PROGRESS"
              ? "IN_PROGRESS"
              : task.status === "DONE"
              ? "DONE"
              : "TO_DO",
        }));

        setTasks(normalizedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, token]);

  const handleDrop = async (taskId, newStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, status: newStatus };

    try {
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}`,
        { ...updatedTask, status: backendStatusMap[newStatus] },
        {
          headers: { Authorization: `Bearer ${token}` }, // attach token
        }
      );

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
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

  if (loading) return <div className="p-6">Loading board...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 min-h-screen">
        <h3 className="text-xl font-semibold mb-6 text-indigo-900">
          Scrum Board: {projectName}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
