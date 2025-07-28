import React from 'react';
import { Task, Project } from '../types';
import { CheckCircle, Clock, AlertCircle, Star } from 'lucide-react';

interface SummaryProps {
  project: Project;
  tasks: Task[];
}

export const Summary: React.FC<SummaryProps> = ({ project, tasks }) => {
  const epics = tasks.filter(task => task.type === 'epic');
  const stories = tasks.filter(task => task.type === 'story');
  const taskItems = tasks.filter(task => task.type === 'task');
  
  const completedTasks = tasks.filter(task => task.status === 'done');
  const inProgressTasks = tasks.filter(task => task.status === 'inprogress');
  const todoTasks = tasks.filter(task => task.status === 'todo');

  const progressPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600">{project.description}</p>
              <p className="text-sm text-gray-500 mt-1">Key: {project.key}</p>
            </div>
            <div className="flex -space-x-2">
              {project.assignedEmployees.map((employee) => (
                <img
                  key={employee.id}
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-10 h-10 rounded-full border-2 border-white"
                  title={employee.name}
                />
              ))}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {Math.round(progressPercentage)}% Complete ({completedTasks.length} of {tasks.length} tasks)
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Epics</p>
                <p className="text-3xl font-bold text-purple-600">{epics.length}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Star size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stories</p>
                <p className="text-3xl font-bold text-blue-600">{stories.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <CheckCircle size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-3xl font-bold text-green-600">{taskItems.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <AlertCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-amber-600">{inProgressTasks.length}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <Clock size={24} className="text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Task Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">To Do</h3>
            <div className="space-y-3">
              {todoTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    task.type === 'epic' ? 'bg-purple-500' :
                    task.type === 'story' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.type.toUpperCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">In Progress</h3>
            <div className="space-y-3">
              {inProgressTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    task.type === 'epic' ? 'bg-purple-500' :
                    task.type === 'story' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.type.toUpperCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Done</h3>
            <div className="space-y-3">
              {completedTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    task.type === 'epic' ? 'bg-purple-500' :
                    task.type === 'story' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.type.toUpperCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};