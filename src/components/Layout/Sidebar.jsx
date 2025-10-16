import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Calendar,
  Clock,
  PlaneTakeoff,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
 
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leave", href: "/leave-management", icon: PlaneTakeoff },
  { name: "Timesheets", href: "/timesheets/dashboard", icon: Clock },
  { name: "Calendar", href: "/calendar", icon: Calendar },
];
 
const userManagementSubmenu = [
  { label: "User Manage", to: "/user-management/users" },
  { label: "Role Manage", to: "/user-management/roles" },
  { label: "Permission Manage", to: "/user-management/permissions" },
  { label: "Group Manage", to: "/user-management/groups" },
  { label: "Access Point Manage", to: "/user-management/access-points" },
];
 
const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const isUserManagementActive =
    location.pathname.startsWith("/user-management");
  const { user } = useAuth();
  const isAdmin =
    user?.roles?.includes("Admin") || user?.roles?.includes("Super Admin");
  const isManager = user?.roles?.includes("Manager");
  const isDeveloper = user?.roles?.includes("Developer");
 
  // State and Refs for the hover-based submenu
  const [hovered, setHovered] = useState(false);
  const [submenuTop, setSubmenuTop] = useState(0);
  const userManagementRef = useRef(null);
  const hoverTimeout = useRef(null);
 
  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (userManagementRef.current) {
      const rect = userManagementRef.current.getBoundingClientRect();
      setSubmenuTop(rect.top);
    }
    setHovered(true);
  };
 
  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHovered(false);
    }, 200);
  };
 
  // Close submenu on route change
  useEffect(() => {
    setHovered(false);
  }, [location.pathname]);
 
  return (
    <aside
  className={`fixed top-0 left-0 h-screen bg-[#081534] text-white flex flex-col z-50 transition-all duration-300 ${
    isCollapsed ? "w-20" : "w-64"
  } border-r border-[#0f1a3a]`}
>
      {/* Branding */}
      <div className="p-6 border-b border-[#0f1a3a] flex items-center gap-3">
        <img src="logo.png" alt="Logo" className="h-10 w-10 shrink-0" />
        {!isCollapsed && (
          <div>
            {/* Changed font size from text-lg to text-base */}
            <h1 className="text-base font-bold leading-none">Paves Tech</h1>
            <p className="text-xs text-gray-400 mt-1">intranet</p>
          </div>
        )}
      </div>
 
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
       
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <Link
              to="/dashboard"
              // Changed font size from text-sm to text-xs
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-medium transition-all duration-200 ${
                location.pathname === "/dashboard"
                  ? "bg-[#263383] text-white border-l-4 border-[#ff3d72]"
                  : "text-gray-300 hover:bg-[#0f1536] hover:text-white"
              }`}
              title={isCollapsed ? "Dashboard" : ""}
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
 
          {/* User Management */}
          {isAdmin && (
            <li
              ref={userManagementRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div
                // Changed font size from text-sm to text-xs
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 ${
                  isUserManagementActive
                    ? "bg-[#263383] text-white border-l-4 border-[#ff3d72]"
                    : "text-gray-300 hover:bg-[#0f1536] hover:text-white"
                }`}
                title={isCollapsed ? "User Management" : ""}
              >
                <Users className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">User Management</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        hovered ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </div>
 
              {/* Unified Submenu for both Collapsed and Expanded states */}
              {hovered && (
                <ul
                  className={`fixed w-56 bg-white text-[#0a174e] rounded-lg shadow-2xl z-[9999] py-2 border ${
                    isCollapsed ? "left-20" : "left-64"
                  }`}
                  style={{ top: `${submenuTop}px` }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {userManagementSubmenu.map((item) => (
                    <li key={item.label}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          // Changed font size from text-sm to text-xs
                          `block px-4 py-2 text-xs transition-colors ${
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
            </li>
          )}
 
          {/* Projects */}
          <li>
            <Link
              to={
                isAdmin
                  ? "/projects/admin"
                  : isManager
                  ? "/projects/manager"
                  : "/projects/developer"
              }
              // Changed font size from text-sm to text-xs
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-medium transition-all duration-200 ${
                location.pathname.startsWith("/projects")
                  ? "bg-[#263383] text-white border-l-4 border-[#ff3d72]"
                  : "text-gray-300 hover:bg-[#0f1536] hover:text-white"
              }`}
              title={isCollapsed ? "Projects" : ""}
            >
              <FolderKanban className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>Projects</span>}
            </Link>
          </li>
 
          {/* Remaining Menu Items */}
          {navigation.slice(1).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  // Changed font size from text-sm to text-xs
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#263383] text-white border-l-4 border-[#ff3d72]"
                      : "text-gray-300 hover:bg-[#0f1536] hover:text-white"
                  }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
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