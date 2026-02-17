import React, { useState } from "react";
import TaskColumn from "./TaskColumn";

export default function TaskBoard({ tasks, setTasks, onCardClick }) {
  const [draggedTask, setDraggedTask] = useState(null);

  const updateStatus = (status) => {
    if (!draggedTask) return;

    const updated = tasks.map((t) =>
      t.id === draggedTask.id ? { ...t, status } : t
    );

    setTasks(updated);
    setDraggedTask(null);
  };

  const todo = tasks.filter((t) => t.status === "todo");
  const progress = tasks.filter((t) => t.status === "progress");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        marginTop: 10,
      }}
    >
      <TaskColumn
        title="To Do"
        tasks={todo}
        status="todo"
        onDrop={updateStatus}
        onDragStart={setDraggedTask}
        onCardClick={onCardClick}
      />

      <TaskColumn
        title="In Progress"
        tasks={progress}
        status="progress"
        onDrop={updateStatus}
        onDragStart={setDraggedTask}
        onCardClick={onCardClick}
      />

      <TaskColumn
        title="Completed"
        tasks={completed}
        status="completed"
        onDrop={updateStatus}
        onDragStart={setDraggedTask}
        onCardClick={onCardClick}
      />
    </div>
  );
}
