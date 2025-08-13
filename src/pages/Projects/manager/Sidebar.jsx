import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Star,
  FolderOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';

const Sidebar = ({
  collapsed,
  onCreateProject,
  onToggleSidebar,
  starredTasksCount,
}) => {
  const [projects, setProjects] = useState([]);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const currentProjectId = parseInt(location.pathname.split('/')[2] || '', 10);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setProjects(res.data);
        } else {
          setProjects([]);
          console.warn('Unexpected project response:', res.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching projects:', err);
        setProjects([]);
      });
  }, []);

  const handleSelectProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-slate-900 text-white h-screen flex flex-col transition-all`}
    >
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        {!collapsed && (
          <h1 className="text-xl font-bold text-blue-400">ProjectHub</h1>
        )}
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-slate-800 rounded"
        >
          <Settings size={16} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
            location.pathname === '/dashboard'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <LayoutDashboard size={18} />
          {!collapsed && <span>Dashboard</span>}
        </button>

        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300">
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

        <div className="pt-4">
          <button
            onClick={() => setProjectsExpanded(!projectsExpanded)}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300"
          >
            {projectsExpanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
            <FolderOpen size={18} />
            {!collapsed && <span>Projects</span>}
          </button>

          {projectsExpanded && (
            <div className={`mt-2 ${collapsed ? '' : 'ml-6'} space-y-1`}>
              {projects.length === 0 ? (
                !collapsed && (
                  <div className="text-sm text-slate-500">No projects found.</div>
                )
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      currentProjectId === project.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      {!collapsed && (
                        <span className="truncate text-sm">{project.name}</span>
                      )}
                    </div>
                  </button>
                ))
              )}

              {!collapsed && (
                <button
                  onClick={onCreateProject}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                  <Plus size={16} />
                  <span className="text-sm">New Project</span>
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
