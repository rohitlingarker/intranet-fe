import React, { useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Calendar,
  Clock,
  PlaneTakeoff,
  Building2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "Projects", href: "/projects/manager", icon: FolderKanban },
  { name: "Leave Management", href: "/leave", icon: PlaneTakeoff },
  { name: "Timesheets", href: "/timesheets", icon: Clock },
  { name: "Calendar", href: "/calendar", icon: Calendar },
];

const userManagementSubmenu = [
  { label: "User Manage", to: "/user-management/users" },
  { label: "Role Manage", to: "/user-management/roles" },
  { label: "Permission Manage", to: "/user-management/permissions" },
  { label: "Group Manage", to: "/user-management/groups" },
  { label: "Access Point Manage", to: "/user-management/access-points" },
];

const Sidebar = () => {
  const location = useLocation();
  const isUserManagementActive = location.pathname.startsWith("/user-management");
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("Admin") || user?.roles?.includes("Super Admin");


  const [hovered, setHovered] = useState(false);
  const hoverTimeout = useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHovered(false);
    }, 200); // ⏱️ 200ms delay
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-[#081534] text-white flex flex-col shadow-lg z-50">
      {/* Branding */}
      <div className="p-6 border-b border-[#0f1a3a]">
        <div className="flex items-center gap-3">
          <img
            src="logo.png"
            alt="Logo"
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-lg font-bold leading-none">Paves Tech</h1>
            <p className="text-xs text-gray-400 mt-1">intranet</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                location.pathname === "/dashboard"
                  ? "bg-[#263383] text-white border-l-4 border-[#ff3d72]"
                  : "text-gray-300 hover:bg-[#0f1536] hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              <span>Dashboard</span>
            </Link>
          </li>

          {/* User Management with hover submenu */}
          {isAdmin && 
          <li
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
                isUserManagementActive
                  ? "bg-[#263383] text-white border-l-4 border-[#ff3d72]"
                  : "text-gray-300 hover:bg-[#0f1536] hover:text-white"
              }`}
            >
              <Users className="h-5 w-5 shrink-0" />
              <span className="flex-1">User Management</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  hovered ? "rotate-180" : ""
                }`}
              />
            </div>

            {hovered && (
              <ul
                className="fixed top-auto left-64 mt-0 w-56 bg-white text-[#0a174e] rounded-lg shadow-2xl z-[9999] py-2"
                style={{ transform: "translateY(-40%)" }}
              >
                {userManagementSubmenu.map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded text-sm transition-colors ${
                          isActive
                            ? "bg-blue-100 text-[#0a174e] font-semibold"
                            : "hover:bg-[#263383] hover:text-white"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>}

          {/* Remaining Menu Items */}
          {navigation.slice(1).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#263383] text-white border-l-4 border-[#ff3d72]"
                      : "text-gray-300 hover:bg-[#0f1536] hover:text-white"
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
