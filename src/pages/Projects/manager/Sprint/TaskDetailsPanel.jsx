import React, { useEffect, useState } from "react";
import axios from "axios";
import EditTaskForm from "../Backlog/EditTaskForm";

const TaskDetailsPanel = ({ taskId, onClose }) => {
  const [task, setTask] = useState(null);

  useEffect(() => {
    if (taskId) {
      axios
        .get(`/api/tasks/${taskId}`)
        .then((res) => setTask(res.data))
        .catch((err) => console.error(err));
    }
  }, [taskId]);

  if (!task) return null;

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
      <EditTaskForm task={task} onClose={onClose} />
    </div>
  );
};

export default TaskDetailsPanel;
