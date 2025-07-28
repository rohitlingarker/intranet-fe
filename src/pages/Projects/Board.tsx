import React from 'react';
import { Task } from '../types';
import { Star, User } from 'lucide-react';

interface BoardProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onToggleTaskStar: (taskId: string) => void;
}

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onToggleTaskStar: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateStatus, onToggleTaskStar }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'epic': return 'bg-purple-500';
      case 'story': return 'bg-blue-500';
      case 'task': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-amber-300 bg-amber-50';
      case 'low': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`p-4 rounded-lg border-2 ${getPriorityColor(task.priority)} cursor-move hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-sm ${getTypeColor(task.type)}`}></div>
          <span className="text-xs font-medium text-gray-600 uppercase">{task.type}</span>
        </div>
        <button
          onClick={() => onToggleTaskStar(task.id)}
          className={`p-1 rounded hover:bg-gray-100 ${
            task.isStarred ? 'text-amber-500' : 'text-gray-400'
          }`}
        >
          <Star size={14} fill={task.isStarred ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      <h4 className="font-medium text-gray-900 mb-2 text-sm">{task.title}</h4>
      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{task.description}</p>
      
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          task.priority === 'high' ? 'bg-red-100 text-red-800' :
          task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority.toUpperCase()}
        </span>
        
        <div className="flex items-center space-x-2">
          {task.storyPoints && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {task.storyPoints} SP
            </span>
          )}
          {task.assignedTo ? (
            <img
              src={task.assignedTo.avatar}
              alt={task.assignedTo.name}
              className="w-6 h-6 rounded-full"
              title={task.assignedTo.name}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={12} className="text-gray-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Board: React.FC<BoardProps> = ({ tasks, onUpdateTaskStatus, onToggleTaskStar }) => {
  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' as const },
    { id: 'inprogress', title: 'In Progress', status: 'inprogress' as const },
    { id: 'done', title: 'Done', status: 'done' as const }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onUpdateTaskStatus(taskId, status);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Board</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => {
            const columnTasks = tasks.filter(task => task.status === column.status);
            
            return (
              <div key={column.id} className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">{column.title}</h2>
                    <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>
                
                <div
                  className="p-4 space-y-4 min-h-96"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.status)}
                >
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdateStatus={onUpdateTaskStatus}
                      onToggleTaskStar={onToggleTaskStar}
                    />
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};