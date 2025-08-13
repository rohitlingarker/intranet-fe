import { useEffect, useState } from "react";
import axios from "axios";
import RoleForm from "./RoleForm";
import PermissionManagement from "./PermissionManagement";
import PermissionGroupManagement from "./PermissionGroupManagement";
import { getAllAccessPoints } from "../../../../services/roleManagementService";
import Navbar from "../../../../components/Navbar/Navbar";

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [accessPoints, setAccessPoints] = useState([]);
  const [activeTab, setActiveTab] = useState("roles");

  const token = localStorage.getItem("token");
  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.USER_MANAGEMENT_URL}/admin/roles`,
        authHeader
      );
      setRoles(res.data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
      }
    }
  };

  const fetchAccessPoints = async () => {
    try {
      const res = await getAllAccessPoints();
      setAccessPoints(res.data);
    } catch (err) {
      console.error("Failed to fetch access points:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchAccessPoints();
  }, []);

  const handleRoleUpdate = (updatedRoles) => {
    setRoles(updatedRoles);
  };

  const tabs = [
    { id: "roles", label: "Manage Roles", icon: "👥" },
    { id: "permissions", label: "View Permissions", icon: "🔐" },
    { id: "groups", label: "Permission Groups", icon: "📋" },
  ];

  // Prepare nav items for Navbar component
  const navItems = tabs.map((tab) => ({
    name: tab.label,
    onClick: () => setActiveTab(tab.id),
    isActive: activeTab === tab.id,
  }));

  return (
    <div>
      {/* Navbar with sticky behavior */}
      <Navbar logo="Role Management" navItems={navItems} />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Tab Content */}
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
          {activeTab === "roles" && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Role Management
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Create, edit, and delete user roles
                </p>
              </div>
              <RoleForm
                roles={roles}
                setRoles={setRoles}
                onRoleUpdate={handleRoleUpdate}
              />
            </div>
          )}

          {activeTab === "permissions" && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Permission Management
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  View permissions assigned to each role
                </p>
              </div>
              <PermissionManagement roles={roles} />
            </div>
          )}

          {activeTab === "groups" && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Permission Group Management
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage permission groups for roles
                </p>
              </div>
              <PermissionGroupManagement roles={roles} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
