import React from 'react';
import { Project, Task } from './types';
import { Calendar, Users, CheckCircle, Clock, Star } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
}

export const ProjectDashboard: React.FC<DashboardProps> = ({ projects, tasks }) => {
  const starredTasks = tasks.filter(task => task.isStarred);
  const completedTasks = tasks.filter(task => task.status === 'done');
  const inProgressTasks = tasks.filter(task => task.status === 'inprogress');

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Total Tasks',
      value: tasks.length,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'In Progress',
      value: inProgressTasks.length,
      icon: Clock,
      color: 'text-amber-600 bg-amber-100'
    },
    {
      label: 'Starred Tasks',
      value: starredTasks.length,
      icon: Star,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Project Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Projects</h2>
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.key}</p>
                  </div>
                  <div className="flex -space-x-2">
                    {project.assignedEmployees.slice(0, 3).map((employee) => (
                      <img
                        key={employee.id}
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Starred Tasks */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Starred Tasks</h2>
            <div className="space-y-4">
              {starredTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Star size={16} className="text-amber-500 fill-current" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                    <p className="text-xs text-gray-600">{task.type.toUpperCase()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'done' ? 'bg-green-100 text-green-800' :
                    task.status === 'inprogress' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status === 'inprogress' ? 'In Progress' : 
                     task.status === 'done' ? 'Done' : 'To Do'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};