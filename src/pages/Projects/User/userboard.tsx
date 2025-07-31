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

const getColumnStyles = (status: Task['status']) => {
  switch (status) {
    case 'TO_DO':
      return {
        header: 'bg-blue-800 text-white',
        body: 'bg-blue-50',
        border: 'border-blue-300',
      };
    case 'IN_PROGRESS':
      return {
        header: 'bg-yellow-600 text-white',
        body: 'bg-yellow-50',
        border: 'border-yellow-300',
      };
    case 'DONE':
      return {
        header: 'bg-green-700 text-white',
        body: 'bg-green-50',
        border: 'border-green-300',
      };
    default:
      return {
        header: 'bg-gray-300 text-black',
        body: 'bg-gray-100',
        border: 'border-gray-300',
      };
  }
};

const KanbanCard: React.FC<{ task: Task }> = ({ task }) => {
  const [, dragRef] = useDrag({
    type: 'TASK',
    item: { id: task.id },
  });

  return (
    <div
      ref={dragRef}
      className="bg-white p-4 rounded-lg shadow hover:shadow-md border border-gray-200 transition-all duration-200 mb-3 cursor-move"
      title={task.title}
    >
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Task</p>
      <p className="font-semibold text-gray-800">{task.title}</p>
      {task.status === 'DONE' && (
        <div className="text-green-600 mt-1 text-sm">✅ Completed</div>
      )}
    </div>
  );
};

const KanbanColumn: React.FC<{
  status: Task['status'];
  tasks: Task[];
  onDrop: (taskId: number, newStatus: Task['status']) => void;
}> = ({ status, tasks, onDrop }) => {
  const [, dropRef] = useDrop({
    accept: 'TASK',
    drop: (item: { id: number }) => onDrop(item.id, status),
  });

  const { header, body, border } = getColumnStyles(status);

  return (
    <div
      ref={dropRef}
      className={`flex flex-col rounded-xl shadow-lg border overflow-hidden ${border}`}
    >
      <div className={`py-3 text-center font-bold text-lg ${header}`}>
        {status.replace('_', ' ')}
      </div>
      <div className={`${body} flex-1 p-4 min-h-[300px]`}>
        {tasks.length === 0 ? (
          <p className="text-gray-400 italic text-sm">No tasks</p>
        ) : (
          tasks.map((task) => <KanbanCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
};

const UserBoard: React.FC<BoardProps> = ({ projectId, projectName }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/projects/${projectId}/tasks`
        );
        const normalizedTasks = res.data.map((task: any) => ({
          ...task,
          status:
            task.status === 'TODO'
              ? 'TO_DO'
              : task.status === 'INPROGRESS'
              ? 'IN_PROGRESS'
              : task.status === 'DONE'
              ? 'DONE'
              : 'TO_DO',
        }));

        setTasks(normalizedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const handleDrop = async (taskId: number, newStatus: Task['status']) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const updatedTask = { ...task, status: newStatus };

    try {
      await axios.put(`http://localhost:8080/api/tasks/${taskId}`, updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
      );
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const grouped = {
    TO_DO: tasks.filter((t) => t.status === 'TO_DO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  };

  if (loading) return <div className="p-6">Loading board...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-6 text-slate-800">
          Scrum Board: {projectName}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['TO_DO', 'IN_PROGRESS', 'DONE'] as Task['status'][]).map((status) => (
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

export default UserBoard;
