import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Calendar,
  Clock,
  PlaneTakeoff,
  Building2,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Leave Management', href: '/leave', icon: PlaneTakeoff },
  { name: 'Timesheets', href: '/timesheets', icon: Clock },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-[#081534] text-white flex flex-col shadow-lg z-50">
      {/* Branding */}
      <div className="p-6 border-b border-[#0f1a3a]">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-[#ff3d72]" />
          <div>
            <h1 className="text-lg font-bold leading-none">Paves Tech</h1>
            <p className="text-xs text-gray-400 mt-1">intranet</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-[#263383] text-white border-l-4 border-[#ff3d72]'
                      : 'text-gray-300 hover:bg-[#0f1536] hover:text-white'
                    }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
