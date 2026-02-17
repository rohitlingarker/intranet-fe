import React from "react";

export default function TaskDetailsDrawer({ task, onClose, onUpdate }) {
  if (!task) return null;

  const updateStatus = (status) => {
    onUpdate({ ...task, status });
  };

  const priorityColor =
    task.priority === "high"
      ? "#dc2626"
      : task.priority === "medium"
      ? "#d97706"
      : "#64748b";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
      }}
    >
      <div
        style={{
          width: 420,
          background: "#ffffff",
          borderRadius: 12,
          padding: 18,
          boxShadow: "0 18px 40px rgba(0,0,0,0.2)",
          animation: "fadeIn 0.18s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h3 style={{ margin: 0 }}>{task.title}</h3>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#f1f5f9",
              borderRadius: 6,
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            ✖
          </button>
        </div>

        {/* Details */}
        <div style={{ fontSize: 13, marginBottom: 6 }}>
          <b>Employee:</b> {task.employee}
        </div>

        <div style={{ fontSize: 13, marginBottom: 6 }}>
          <b>Priority:</b>{" "}
          <span style={{ color: priorityColor }}>{task.priority}</span>
        </div>

        <div style={{ fontSize: 13, marginBottom: 6 }}>
          <b>Due Date:</b> {task.dueDate}
        </div>

        <div style={{ fontSize: 13, marginBottom: 10 }}>
          <b>Progress:</b> {task.progress}%
        </div>

        {/* Description */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Description
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            {task.description || "No description"}
          </div>
        </div>

        {/* Status Dropdown */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Status
          </div>

          <select
            value={task.status}
            onChange={(e) => updateStatus(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: 6,
              fontSize: 13,
            }}
          >
            <option value="todo">To Do</option>
            <option value="progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Action Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => updateStatus("completed")}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "7px 14px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Mark Completed
          </button>
        </div>
      </div>
    </div>
  );
}
