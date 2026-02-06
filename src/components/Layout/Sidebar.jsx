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
  Handshake,
  UserCog2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  
  // Removed "Resource Management" from here to handle it manually below with a submenu

  { name: "Leave", href: "/leave-management", icon: PlaneTakeoff },
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

// DATA FOR THE POP LABEL / SUBMENU
const resourceManagementSubmenu = [
  { label: "Resource Project Management", to: "/resource-management/projects" },
  { label: "Resource Allocation", to: "/resource-management/allocation" },
  { label: "Skill Matrix", to: "/resource-management/skills" },
  { label: "Workforce Availability", to: "/resource-management/workforce-availability" },

];

const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Role checks
  const isAdmin = user?.roles?.includes("Admin") || user?.roles?.includes("Super Admin");
  const isGeneral = user?.roles?.includes("General");

  // State for User Management Hover
  const [userHovered, setUserHovered] = useState(false);
  const userManagementRef = useRef(null);
  
  // State for Resource Management Hover (NEW)
  const [rmHovered, setRmHovered] = useState(false);
  const rmRef = useRef(null);
  
  const [submenuTop, setSubmenuTop] = useState(0);
  const hoverTimeout = useRef(null);

  // --- Handlers for User Management ---
  const handleUserMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (userManagementRef.current) {
      const rect = userManagementRef.current.getBoundingClientRect();
      setSubmenuTop(rect.top);
    }
    setUserHovered(true);
    setRmHovered(false); // Close others
  };

  const handleUserMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setUserHovered(false);
    }, 200);
  };

  // --- Handlers for Resource Management (NEW) ---
  const handleRmMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (rmRef.current) {
      const rect = rmRef.current.getBoundingClientRect();
      setSubmenuTop(rect.top);
    }
    setRmHovered(true);
    setUserHovered(false); // Close others
  };

  const handleRmMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setRmHovered(false);
    }, 200);
  };

  useEffect(() => {
    setUserHovered(false);
    setRmHovered(false);
  }, [location.pathname]);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#081534] text-white flex flex-col z-50 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } border-r border-[#0f1a3a]`}
    >
      {/* Branding */}
      <div className="p-6 border-b border-[#0f1a3a] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="logo.png" alt="Logo" className="h-10 w-10 shrink-0" />
          {!isCollapsed && (
            <div>
              <h1 className="text-base font-bold leading-none">Paves Tech</h1>
              <p className="text-xs text-gray-400 mt-1">intranet</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <ul className="space-y-1">
          {/* 1. Dashboard */}
          <li>
            <Link
              to="/dashboard"
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

          {/* 2. Resource Management (With Pop Label/Submenu) */}
          <li
            ref={rmRef}
            className="relative"
            onMouseEnter={handleRmMouseEnter}
            onMouseLeave={handleRmMouseLeave}
          >
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 ${
                location.pathname.startsWith("/resource-management")
                  ? "bg-[#263383] text-white border-l-4 border-[#ff3d72]"
                  : "text-gray-300 hover:bg-[#0f1536] hover:text-white"
              }`}
              title={isCollapsed ? "Resource Management" : ""}
            >
              <UserCog2 className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">Resource Management</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      rmHovered ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </div>

            {/* THE POP LABEL / SUBMENU */}
            {rmHovered && (
              <ul
                className={`fixed w-64 bg-white text-[#0a174e] rounded-lg shadow-2xl z-[9999] py-2 border ${
                  isCollapsed ? "left-20" : "left-64"
                }`}
                style={{ top: `${submenuTop}px` }}
                onMouseEnter={handleRmMouseEnter}
                onMouseLeave={handleRmMouseLeave}
              >                
                {resourceManagementSubmenu.map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
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

          {/* 3. User Management (Admin Only) */}
          {isAdmin && (
            <li
              ref={userManagementRef}
              className="relative"
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
            >
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 ${
                  location.pathname.startsWith("/user-management")
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
                        userHovered ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </div>

              {/* User Management Submenu */}
              {userHovered && (
                <ul
                  className={`fixed w-56 bg-white text-[#0a174e] rounded-lg shadow-2xl z-[9999] py-2 border ${
                    isCollapsed ? "left-20" : "left-64"
                  }`}
                  style={{ top: `${submenuTop}px` }}
                  onMouseEnter={handleUserMouseEnter}
                  onMouseLeave={handleUserMouseLeave}
                >
                  {userManagementSubmenu.map((item) => (
                    <li key={item.label}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
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

          {/* 4. Employee Onboarding (Non-General) */}
          {!isGeneral && (
            <li className="relative">
              <Link
                to="/employee-onboarding"
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-medium transition-all duration-200 ${
                  location.pathname.startsWith("/employee-onboarding")
                    ? "bg-[#263383] text-white border-l-4 border-[#ff3d72]"
                    : "text-gray-300 hover:bg-[#0f1536] hover:text-white"
                }`}
                title={isCollapsed ? "Employee Onboarding" : ""}
              >
                <Handshake className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>Employee Onboarding</span>}
              </Link>
            </li>
          )}

          {/* 5. Remaining Items (Leave, Timesheets, Calendar) */}
          {navigation.slice(1).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
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