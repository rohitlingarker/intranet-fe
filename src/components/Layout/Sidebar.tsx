import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Calendar, 
  Clock, 
  PlaneTakeoff,
  Building2
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
    <div className="w-64 bg-[#081534] text-white flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-[#ff3d72]" />
          <div>
            <h1 className="text-xl font-bold">Paves Tech</h1>
            <p className="text-xs text-gray-300">intranet</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#263383] text-white'
                      : 'text-gray-300 hover:bg-[#0f1536] hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;