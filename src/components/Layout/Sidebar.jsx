import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  PlaneTakeoff,
  Clock,
  Calendar,
  Building2,
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'User Management', icon: Users, path: '/users' },
    { label: 'Projects', icon: FolderOpen, path: '/projects/dashboard' },
    { label: 'Leave Management', icon: PlaneTakeoff, path: '/leave' },
    { label: 'Timesheets', icon: Clock, path: '/timesheets' },
    { label: 'Calendar', icon: Calendar, path: '/calendar' },
  ];

  return (
    <div className="w-64 h-screen bg-[#081534] text-white flex flex-col sticky top-0">
      {/* Branding */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-[#ff3d72]" />
          <div>
            <h1 className="text-xl font-bold">Paves Tech</h1>
            <p className="text-xs text-gray-300">intranet</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path || '');
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
