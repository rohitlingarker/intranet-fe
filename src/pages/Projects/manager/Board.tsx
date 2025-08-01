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
        header: 'bg-gradient-to-r from-blue-900 to-blue-800 text-white',
        body: 'bg-white',
      };
    case 'IN_PROGRESS':
      return {
        header: 'bg-gradient-to-r from-blue-900 to-blue-800 text-white',
        body: 'bg-white',
      };
    case 'DONE':
      return {
        header: 'bg-gradient-to-r from-blue-900 to-blue-800 text-white',
        body: 'bg-white',
      };
    default:
      return {
        header: 'bg-gray-300 text-black',
        body: 'bg-gray-100',
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
      className="bg-white p-4 rounded-lg shadow-md mb-3 cursor-move border border-gray-200 hover:shadow-lg transition-shadow flex justify-between items-start"
      title={task.title}
    >
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Task</p>
        <p className="font-semibold text-gray-800">{task.title}</p>
      </div>
      {task.status === 'DONE' && (
        <span className="text-green-600 text-xl ml-2 mt-1">✅</span>
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

  const { header, body } = getColumnStyles(status);

  return (
    <div
      ref={dropRef}
      className="flex flex-col rounded-2xl shadow-lg border border-gray-300 overflow-hidden"
    >
      <div className={`py-3 text-center font-bold text-lg ${header}`}>
        {status.replace('_', ' ')}
      </div>
      <div className={`${body} flex-1 p-4 min-h-[300px]`}>
        {tasks.length === 0 ? (
          <p className="text-gray-400 italic">No tasks</p>
        ) : (
          tasks.map((task) => <KanbanCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
};

export const Board: React.FC<BoardProps> = ({ projectId, projectName }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/projects/${projectId}/tasks`
        );
        console.log('Raw API tasks:', res.data);

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
        <h3 className="text-2xl font-bold mb-6">Scrum Board: {projectName}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['TO_DO', 'IN_PROGRESS', 'DONE'] as Task['status'][]).map(
            (status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={grouped[status]}
                onDrop={handleDrop}
              />
            )
          )}
        </div>
      </div>
    </DndProvider>
  );
};
