import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  PlaneTakeoff,
  Clock,
  Calendar,
  Star,
  ChevronRight,
  Building2,
} from 'lucide-react';
import axios from 'axios';


interface Project {
  id: number;
  name: string;
}

const Sidebar: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/projects')
      .then((res) => {
        setProjects(res.data?.content || res.data || []);
      })
      .catch((err) => console.error('Error fetching projects:', err));
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'User Management', icon: Users, path: '/users' },
    {
      label: 'Projects',
      icon: FolderOpen,
      nested: true,
    },
    { label: 'Leave Management', icon: PlaneTakeoff, path: '/leave' },
    { label: 'Timesheets', icon: Clock, path: '/timesheets' },
    { label: 'Calendar', icon: Calendar, path: '/calendar' },
  ];

  return (
    <div className="w-64 h-screen bg-[#081534] text-white flex flex-col relative">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-[#ff3d72]" />
          <div>
            <h1 className="text-xl font-bold">Paves Tech</h1>
            <p className="text-xs text-gray-300">intranet</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 relative">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path || '');
            if (item.nested) {
              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setShowProjectMenu(true)}
                  onMouseLeave={() => setShowProjectMenu(false)}
                >
                  <div
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                      showProjectMenu || isActive
                        ? 'bg-[#263383] text-white'
                        : 'text-gray-300 hover:bg-[#0f1536] hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">Projects</span>
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </div>

                  {/* Right-side nested menu */}
                  {showProjectMenu && (
                    <ul className="absolute top-0 left-64 w-64 bg-[#0f1536] shadow-lg z-50 rounded-md p-2 space-y-2">
                      <li
                        className="hover:bg-[#263383] rounded px-4 py-2 cursor-pointer"
                        onClick={() => navigate('/projects/dashboard')}
                      >
                        Project Dashboard
                      </li>
                      <li
                        className="hover:bg-[#263383] rounded px-4 py-2 cursor-pointer"
                        onClick={() => navigate('/projects/starred')}
                      >
                        Starred Projects
                      </li>
                      {projects.length > 0 && (
                        <>
                          <div className="px-4 text-xs text-gray-400">Your Projects</div>
                          {projects.map((project) => (
                            <li
                              key={project.id}
                              className="hover:bg-[#263383] rounded px-4 py-2 cursor-pointer"
                              onClick={() => navigate(`/projects/${project.id}`)}
                            >
                              {project.name}
                            </li>
                          ))}
                        </>
                      )}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.label}>
                <div
                  onClick={() => item.path && navigate(item.path)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#263383] text-white'
                      : 'text-gray-300 hover:bg-[#0f1536] hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
