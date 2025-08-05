import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function UpdateUserRole() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    const fetchUsersWithRoles = async () => {
      try {
        const res = await axios.get("http://localhost:8000/admin/users/roles", authHeader);
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users with roles:", err);
        alert("Error loading user roles.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersWithRoles();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-semibold text-blue-700 mb-4">Update User Roles</h2>
      <p className="mb-6 text-gray-600">Click on <span className="font-medium">Edit Roles</span> to update the roles assigned to each user.</p>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No users available.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="px-6 py-3 border-b">User ID</th>
                <th className="px-6 py-3 border-b">Name</th>
                <th className="px-6 py-3 border-b">Assigned Roles</th>
                <th className="px-6 py-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 border-b text-sm">{user.user_id}</td>
                  <td className="px-6 py-3 border-b text-sm">{user.name}</td>
                  <td className="px-6 py-3 border-b text-sm">
                    {user.roles?.length > 0 ? user.roles.join(", ") : <span className="text-gray-400">No roles assigned</span>}
                  </td>
                  <td className="px-6 py-3 border-b text-sm">
                    <button
                      onClick={() => navigate(`/user-management/roles/edit-role/${user.user_id}`)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Edit Roles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
