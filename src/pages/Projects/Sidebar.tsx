import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Star, 
  FolderOpen, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Settings
} from 'lucide-react';
import { Project } from './types';

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  collapsed: boolean;
  onSelectProject: (projectId: string | null) => void;
  onCreateProject: () => void;
  onToggleSidebar: () => void;
  starredTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  selectedProjectId,
  collapsed,
  onSelectProject,
  onCreateProject,
  onToggleSidebar,
  starredTasksCount
}) => {
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-slate-900 text-white h-screen flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-bold text-blue-400">ProjectHub</h1>
          )}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Dashboard */}
        <button
          onClick={() => onSelectProject(null)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            selectedProjectId === null 
              ? 'bg-blue-600 text-white' 
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <LayoutDashboard size={18} />
          {!collapsed && <span>Dashboard</span>}
        </button>

        {/* Starred Tasks */}
        <button
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <Star size={18} />
          {!collapsed && (
            <>
              <span>Starred Tasks</span>
              {starredTasksCount > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  {starredTasksCount}
                </span>
              )}
            </>
          )}
        </button>

        {/* Projects Section */}
        <div className="pt-4">
          <button
            onClick={() => setProjectsExpanded(!projectsExpanded)}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
          >
            {projectsExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <FolderOpen size={18} />
            {!collapsed && <span>Projects</span>}
          </button>

          {projectsExpanded && !collapsed && (
            <div className="ml-6 mt-2 space-y-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedProjectId === project.id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <span className="truncate text-sm">{project.name}</span>
                  </div>
                </button>
              ))}
              
              <button
                onClick={onCreateProject}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm">New Project</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};