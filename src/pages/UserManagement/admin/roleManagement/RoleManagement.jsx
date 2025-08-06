import { useEffect, useState } from "react";
import axios from "axios";
import RoleForm from "./RoleForm";
import PermissionManagement from "./PermissionManagement";
import PermissionGroupManagement from "./PermissionGroupManagement";
import { getAllAccessPoints } from "../../../../services/roleManagementService";

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
      const res = await axios.get("http://localhost:8000/admin/roles", authHeader);
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
    { id: "groups", label: "Permission Groups", icon: "📋" }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Role Management</h2>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-medium text-center transition-colors duration-200 ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "roles" && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Role Management</h3>
                <p className="text-sm text-gray-600 mt-1">Create, edit, and delete user roles</p>
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
                <h3 className="text-lg font-semibold text-gray-800">Permission Management</h3>
                <p className="text-sm text-gray-600 mt-1">View permissions assigned to each role</p>
              </div>
              <PermissionManagement roles={roles} />
            </div>
          )}

          {activeTab === "groups" && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Permission Group Management</h3>
                <p className="text-sm text-gray-600 mt-1">Manage permission groups for roles</p>
              </div>
              <PermissionGroupManagement roles={roles} />
            </div>
          )}
        </div>
      {/* </div>

      Quick Stats/Summary
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}
        {/* <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-blue-600">{roles.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div> */}

        {/* <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Access Points</p>
              <p className="text-2xl font-bold text-green-600">{accessPoints.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">🔐</span>
            </div>
          </div>
        </div> */}

        {/* <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tab</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">{activeTab}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}