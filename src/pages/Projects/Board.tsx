import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface Task {
  id: number;
  title: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  userStoryId: number;
  projectId: number;
}

interface BoardProps {
  projectId: number;
  projectName: string;
}

const KanbanColumn: React.FC<{
  status: string;
  tasks: Task[];
  onDrop: (taskId: number, newStatus: Task['status']) => void;
}> = ({ status, tasks, onDrop }) => {
  const [, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: number }) => {
      onDrop(item.id, status as Task['status']);
    },
  });

  return (
    <div ref={drop} className="w-full p-4 bg-gray-100 rounded shadow min-h-[300px]">
      <h2 className="font-bold text-lg mb-2">{status.replace('_', ' ')}</h2>
      {tasks.map((task) => (
        <KanbanCard key={task.id} task={task} />
      ))}
    </div>
  );
};

const KanbanCard: React.FC<{ task: Task }> = ({ task }) => {
  const [, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id },
  });

  return (
    <div
      ref={drag}
      className="bg-white p-2 rounded shadow mb-2 cursor-move border border-gray-300"
    >
      {task.title}
    </div>
  );
};

export const Board: React.FC<BoardProps> = ({ projectId, projectName }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/projects/${projectId}/tasks`) // uses pagination; adjust as needed
      .then((res) => {
        const content = res.data.content || res.data; // handles both Page<TaskDto> and List<TaskDto>
        const filtered = content.filter((task: any) => task.projectId === projectId);
        setTasks(filtered);
      })
      .catch((err) => console.error('Failed to load board data:', err))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleDrop = async (taskId: number, newStatus: Task['status']) => {
    try {
      const currentTask = tasks.find((t) => t.id === taskId);
      if (!currentTask) return;

      const updatedTask = { ...currentTask, status: newStatus };

      await axios.put(`http://localhost:8080/api/tasks/${taskId}`, updatedTask);

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
      );
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const groupedTasks = {
    TO_DO: tasks.filter((t) => t.status === 'TO_DO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  };

  if (loading) return <div className="p-6">Loading board...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Board for {projectName}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(groupedTasks).map(([status, tasks]) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasks}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};
