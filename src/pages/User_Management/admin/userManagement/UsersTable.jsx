import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
};

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name"); // default sort
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTIONS.ASC);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.warn("Session expired. Please login again.");
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          toast.error("Access denied. Admins only.");
          navigate("/home");
        } else {
          toast.error("Failed to load users.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, navigate]);

  const sortedUsers = useMemo(() => {
    if (!users) return [];
    const copy = [...users];
    copy.sort((a, b) => {
      let aVal;
      let bVal;

      switch (sortBy) {
        case "name":
          aVal = `${a.first_name} ${a.last_name}`.toLowerCase();
          bVal = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case "mail":
          aVal = (a.mail ?? "").toString().toLowerCase();
          bVal = (b.mail ?? "").toString().toLowerCase();
          break;
        case "contact":
          aVal = (a.contact ?? "").toString().toLowerCase();
          bVal = (b.contact ?? "").toString().toLowerCase();
          break;
        case "status":
          aVal = a.is_active ? 1 : 0;
          bVal = b.is_active ? 1 : 0;
          break;
        default:
          aVal = "";
          bVal = "";
      }

      if (aVal < bVal) return sortDirection === SORT_DIRECTIONS.ASC ? -1 : 1;
      if (aVal > bVal) return sortDirection === SORT_DIRECTIONS.ASC ? 1 : -1;
      return 0;
    });
    return copy;
  }, [users, sortBy, sortDirection]);

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) =>
        prev === SORT_DIRECTIONS.ASC ? SORT_DIRECTIONS.DESC : SORT_DIRECTIONS.ASC
      );
    } else {
      setSortBy(key);
      setSortDirection(SORT_DIRECTIONS.ASC);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await axios.delete(`http://localhost:8000/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, is_active: false } : u
        )
      );
      toast.success("User deactivated.");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to deactivate user.");
    }
  };

  const renderSortIndicator = (column) => {
    if (sortBy === column) {
      return sortDirection === SORT_DIRECTIONS.ASC ? " ▲" : " ▼";
    }
    return "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
        <div className="space-x-3 flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/user-management/users/create")}
            className="bg-blue-900 text-white px-4 py-2 rounded shadow hover:bg-blue-950"
          >
            + Add User
          </button>
          <button
            onClick={() => navigate("/user-management/users/roles")}
            className="bg-pink-900 text-white px-4 py-2 rounded shadow hover:bg-pink-950"
          >
            User Roles
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-4">
        View and manage all registered users in the system.
      </p>

      <div className="relative overflow-x-auto rounded shadow border border-gray-200">
        {loading ? (
          <div className="p-6 text-center">Loading users...</div>
        ) : (
          <table className="min-w-full table-fixed divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-[8%]">
                  ID
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer w-[18%]"
                  onClick={() => toggleSort("name")}
                >
                  Name{renderSortIndicator("name")}
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer w-[22%]"
                  onClick={() => toggleSort("mail")}
                >
                  Email{renderSortIndicator("mail")}
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer w-[15%]"
                  onClick={() => toggleSort("contact")}
                >
                  Contact{renderSortIndicator("contact")}
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer w-[12%]"
                  onClick={() => toggleSort("status")}
                >
                  Status{renderSortIndicator("status")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-[25%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm">{user.user_id}</td>
                    <td className="px-4 py-4 text-sm">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-4 py-4 text-sm">{user.mail}</td>
                    <td className="px-4 py-4 text-sm">{user.contact}</td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={
                          user.is_active ? "text-green-600" : "text-red-500"
                        }
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm flex gap-4">
                      <button
                        onClick={() =>
                          navigate(
                            `/user-management/users/edit/${user.user_id}`
                          )
                        }
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className="text-red-500 hover:underline"
                        disabled={!user.is_active}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
