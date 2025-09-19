import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showStatusToast } from "../../../../components/toastfy/toast";

import SearchInput from "../../../../components/filter/Searchbar";
import GenericTable from "../../../../components/Table/table";
import Pagination from "../../../../components/Pagination/pagination";
import Button from "../../../../components/Button/Button";
import Modal from "../../../../components/Modal/modal";

const ITEMS_PER_PAGE = 10;
const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
};

export default function UpdateUserRole() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTIONS.ASC);

  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // axios instance
  const axiosInstance = useMemo(() => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return axios.create({
      baseURL: import.meta.env.VITE_USER_MANAGEMENT_URL,
      headers,
    });
  }, [token]);

  useEffect(() => {
    if (!token) {
      showStatusToast("Session expired. Please login again.", "warning");
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchUsersWithRoles = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/admin/users/roles");
        setUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users with roles:", err);
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to load user roles.";
        showStatusToast(msg, "error");
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/home");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsersWithRoles();
  }, [axiosInstance, navigate]);

  // filter, sort, paginate
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      `${user.name || ""} ${user.mail || ""} ${user.roles?.join(" ") || ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [users, searchTerm]);

  const sortedUsers = useMemo(() => {
    const copy = [...filteredUsers];
    copy.sort((a, b) => {
      const aName = (a.name || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();
      return sortDirection === SORT_DIRECTIONS.ASC
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    });
    return copy;
  }, [filteredUsers, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedUsers, currentPage]);

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);

  const toggleSort = () => {
    setSortDirection((prev) =>
      prev === SORT_DIRECTIONS.ASC ? SORT_DIRECTIONS.DESC : SORT_DIRECTIONS.ASC
    );
  };

  // table headers
  const headers = [
    "User ID",
    <span key="name" className="cursor-pointer" onClick={toggleSort}>
      Name {sortDirection === SORT_DIRECTIONS.ASC ? "▲" : "▼"}
    </span>,
    "Email",
    "Assigned Roles",
    "Actions",
  ];
  const columns = ["user_id", "name", "mail", "roles", "actions"];

  const tableRows = paginatedUsers.map((user) => ({
    user_id: user.user_id,
    name: user.name,
    mail: user.mail || <span className="text-gray-400 italic">N/A</span>,
    roles:
      user.roles?.length > 0 ? (
        user.roles.join(", ")
      ) : (
        <span className="text-gray-400">No roles assigned</span>
      ),
    actions: (
      <Button
        onClick={() => {
          setSelectedUserId(user.user_id);
          setIsModalOpen(true);
        }}
        variant="primary"
        size="small"
      >
        Edit Roles
      </Button>
    ),
  }));

  const handleRolesSaved = (userId, updatedRoleNames) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.user_id === userId ? { ...u, roles: updatedRoleNames } : u
      )
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* ✅ Back Button */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h2 className="text-3xl font-semibold text-blue-700">
          Update User Roles
        </h2>
        <Button
          variant="secondary"
          size="medium"
          onClick={() => navigate("/user-management/users")}
        >
          ← Back
        </Button>
      </div>

      <SearchInput
        onSearch={(value) => {
          setSearchTerm(value || "");
          setCurrentPage(1);
        }}
        placeholder="Search by name, email or role..."
        delay={300}
        className="mb-4 max-w-md"
      />

      <GenericTable
        headers={headers}
        rows={tableRows}
        columns={columns}
        loading={loading}
      />

      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        />
      )}

      {isModalOpen && selectedUserId && (
        <EditUserRoleModal
          userId={selectedUserId}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUserId(null);
          }}
          axiosInstance={axiosInstance}
          onSaved={(updatedRoleNames) =>
            handleRolesSaved(selectedUserId, updatedRoleNames)
          }
        />
      )}
    </div>
  );
}

/* ------------------------------
   Modal component (internal)
   ------------------------------ */
function EditUserRoleModal({ userId, onClose, axiosInstance, onSaved }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [userRes, rolesRes, assignedRes] = await Promise.all([
          axiosInstance.get(`/admin/users/${userId}`, authHeader),
          axiosInstance.get(`/admin/roles`, authHeader),
          axiosInstance.get(`/admin/users/${userId}/roles`, authHeader),
        ]);
        console.log("Fetched user, roles, assigned:", userRes, rolesRes, assignedRes);

        if (!mounted) return;

        setUser(userRes.data);
        setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);

        let assignedIds = [];

        if (assignedRes.data?.roles && Array.isArray(assignedRes.data.roles)) {
          const roleNameToId = rolesRes.data.reduce((acc, r) => {
            acc[r.role_name] = r.role_id;
            return acc;
          }, {});
          assignedIds = assignedRes.data.roles
            .map((roleName) => roleNameToId[roleName])
            .filter(Boolean);
        }

        setSelectedRoleIds(assignedIds);
      } catch (err) {
        console.error("Failed to load roles", err);
        showStatusToast("Unable to fetch user role data.", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [userId, axiosInstance]);

  const toggleRole = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await axiosInstance.put(
        `/admin/users/${userId}/role`,
        { role_ids: selectedRoleIds },
        authHeader
      );

      const updatedRoleNames = roles
        .filter((r) => selectedRoleIds.includes(r.role_id))
        .map((r) => r.role_name);

      showStatusToast("Roles updated successfully!", "success");
      if (typeof onSaved === "function") onSaved(updatedRoleNames);
      console.log("Updated roles:", updatedRoleNames);
      onClose();
    } catch (err) {
      console.error("Failed to update roles", err);
      showStatusToast("Update failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="p-4 max-w-lg">
        {loading ? (
          <div className="text-blue-600">Loading user data...</div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Edit Roles for{" "}
              <span className="text-blue-600">
                {user?.first_name} {user?.last_name}
              </span>
            </h2>

            <p className="text-gray-500 mb-4">Select or deselect roles below:</p>

            <div className="grid grid-cols-2 gap-3 mb-6 max-h-72 overflow-y-auto">
              {roles.map((role) => (
                <label
                  key={role.role_id}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.role_id)}
                    onChange={() => toggleRole(role.role_id)}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span>{role.role_name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                onClick={handleSave}
                variant="primary"
                size="medium"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={onClose} variant="secondary" size="medium">
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
