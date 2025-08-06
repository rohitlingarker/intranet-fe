import { NavLink } from "react-router-dom";
export default function UserManagementHome() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <NavLink to="users" className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:bg-blue-50 transition">
        <span className="text-2xl font-bold mb-2">👤</span>
        <span className="font-semibold">User Manage</span>
        <span className="text-gray-500 text-sm mt-2">Manage users, add, edit, deactivate</span>
      </NavLink>
      <NavLink to="roles" className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:bg-blue-50 transition">
        <span className="text-2xl font-bold mb-2">🛡️</span>
        <span className="font-semibold">Role Manage</span>
        <span className="text-gray-500 text-sm mt-2">Manage user roles and assignments</span>
      </NavLink>
      <NavLink to="permissions" className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:bg-blue-50 transition">
        <span className="text-2xl font-bold mb-2">🔑</span>
        <span className="font-semibold">Permission Manage</span>
        <span className="text-gray-500 text-sm mt-2">Manage permissions for roles</span>
      </NavLink>
      <NavLink to="groups" className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:bg-blue-50 transition">
        <span className="text-2xl font-bold mb-2">👥</span>
        <span className="font-semibold">Group Manage</span>
        <span className="text-gray-500 text-sm mt-2">Manage permission groups</span>
      </NavLink>
      <NavLink to="access-points" className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:bg-blue-50 transition">
        <span className="text-2xl font-bold mb-2">🌐</span>
        <span className="font-semibold">Access Point Manage</span>
        <span className="text-gray-500 text-sm mt-2">Manage access points</span>
      </NavLink>
    </div>
  );
} 