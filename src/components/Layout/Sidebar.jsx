import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaUsers,
  FaProjectDiagram,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaPlaneDeparture,
  FaChevronDown,
  FaBuilding,
} from "react-icons/fa";

const menu = [
  { label: "Dashboard", icon: <FaCheckCircle />, to: "/dashboard" },
  { label: "Projects", icon: <FaProjectDiagram />, to: "/project-management" },
  { label: "Leave Management", icon: <FaPlaneDeparture />, to: "/leave-management" },
  { label: "Timesheets", icon: <FaClock />, to: "/timesheets" },
  { label: "Calendar", icon: <FaCalendarAlt />, to: "/calendar" },
];

const userManagementSubmenu = [
  { label: "User Manage", to: "/user-management/users" },
  { label: "Role Manage", to: "/user-management/roles" },
  { label: "Permission Manage", to: "/user-management/permissions" },
  { label: "Group Manage", to: "/user-management/groups" },
  { label: "Access Point Manage", to: "/user-management/access-points" },
];

export default function Sidebar() {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  const isUserManagementActive = location.pathname.startsWith("/user-management");


  return (
    <aside className="bg-[#081534] text-white w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 px-6 py-6">
        <FaBuilding className="text-[#ff3d72] text-3xl" />
        <div>
          <div className="text-xl font-bold">Paves Tech</div>
          <div className="text-xs text-gray-300">intranet</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-6">
        <ul className="space-y-2 relative">
          {/* Dashboard */}
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#263383] text-white font-semibold"
                    : "hover:bg-[#0f1536] hover:text-white text-gray-300"
                }`
              }
            >
              <FaCheckCircle className="text-lg" />
              Dashboard
            </NavLink>
          </li>

          {/* User Management Dropdown */}
          <li
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                isUserManagementActive
                  ? "bg-[#263383] text-white font-semibold"
                  : "hover:bg-[#0f1536] hover:text-white text-gray-300"
              }`}
            >
              <FaUsers className="text-lg" />
              <span className="flex-1">User Management</span>
              <FaChevronDown
                className={`transition-transform duration-200 ${hovered ? "rotate-180" : ""}`}
              />
            </div>

            {/* Submenu */}
            {hovered && (
              <ul className="absolute left-full top-0 mt-0 ml-2 w-56 bg-white text-[#0a174e] rounded-lg shadow-lg z-20 py-2">
                {userManagementSubmenu.map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded transition-colors ${
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

          {/* Remaining Menu Items */}
          {menu.slice(1).map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#263383] text-white font-semibold"
                      : "hover:bg-[#0f1536] hover:text-white text-gray-300"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
