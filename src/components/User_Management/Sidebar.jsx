import { NavLink, useLocation } from "react-router-dom";
import {
  FaUsers, FaProjectDiagram, FaCheckCircle, FaClock, FaCalendarAlt, FaPlaneDeparture, FaChevronDown, FaBuilding
} from "react-icons/fa";
import { useState } from "react";

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

  return (
    <aside className="bg-[#0a174e] text-white w-64 min-h-screen flex flex-col">
      <div className="flex items-center gap-4 px-6 py-6">
        <FaBuilding className="text-pink-400 text-4xl" />
        <div>
          <div className="text-2xl font-bold text-white leading-tight">Paves Tech</div>
          <div className="text-sm text-gray-300 font-normal">intranet</div>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-6">
        <ul className="space-y-2 relative">
          {/* User Management Hover Menu */}
          <li
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left transition-colors ${
                location.pathname.startsWith("/user-management")
                  ? "bg-white text-[#0a174e] font-semibold"
                  : "hover:bg-blue-900 hover:text-white"
              }`}
            >
              <FaUsers className="text-xl" />
              <span className="flex-1">User Management</span>
              <FaChevronDown className={`transition-transform ${hovered ? "rotate-180" : ""}`} />
            </div>

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
                            : "hover:bg-blue-900 hover:text-white"
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

          {/* Other menu items */}
          {menu.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white text-[#0a174e] font-semibold"
                      : "hover:bg-blue-900 hover:text-white"
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
