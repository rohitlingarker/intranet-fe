import React, { useState } from 'react';
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

type NavItem = {
  name: string;
  href: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  submenu?: { name: string; href: string }[];
};

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { 
    name: 'User Management', 
    href: '/users', 
    icon: Users,
    submenu: [
      { name: 'All Users', href: '/users/all' },
      { name: 'Add User', href: '/users/add' },
      { name: 'User Roles', href: '/users/roles' },
    ]
  },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Leave Management', href: '/leave', icon: PlaneTakeoff },
  {
    name: 'Timesheets',
    href: '/timesheets',
    icon: Clock,
    submenu: [
      { name: 'Daily', href: '/timesheets/daily' },
      { name: 'Weekly', href: '/timesheets/weekly' },
      { name: 'Monthly', href: '/timesheets/monthly' },
      { name: 'Reports', href: '/timesheets/reports' },
      { name: 'Settings', href: '/timesheets/settings' },
    ],
  },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Use a ref to store timeout id so it persists between renders
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + '/');

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredItem(name);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 200); // 200ms delay before hiding submenu
  };

  return (
    <div className="relative w-64 bg-[#081534] text-white flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-[#ff3d72]" />
          <div>
            <h1 className="text-xl font-bold">Paves Tech</h1>
            <p className="text-xs text-gray-300">intranet</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4" style={{ overflow: 'visible' }}>
        <ul className="space-y-2 relative">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const hasSubmenu = !!item.submenu;

            return (
              <li
                key={item.name}
                className="relative"
                onMouseEnter={() => hasSubmenu && handleMouseEnter(item.name)}
                onMouseLeave={() => hasSubmenu && handleMouseLeave()}
              >
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-[#263383] text-white'
                      : 'text-gray-300 hover:bg-[#0f1536] hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>

                {hasSubmenu && hoveredItem === item.name && (
                  <ul
                    className="absolute top-0 left-full ml-1 w-48 max-h-60 overflow-y-auto bg-[#0f1536] rounded-md shadow-lg z-50"
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={() => handleMouseLeave()}
                  >
                    {item.submenu!.map((sub) => (
                      <li key={sub.name}>
                        <Link
                          to={sub.href}
                          className={`block px-4 py-2 text-gray-300 hover:bg-[#263383] hover:text-white rounded-md ${
                            isActive(sub.href) ? 'bg-[#263383] text-white' : ''
                          }`}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;