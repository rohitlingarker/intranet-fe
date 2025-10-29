import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showStatusToast } from "../../../../components/toastfy/toast";
import GenericTable from "../../../../components/Table/table";
import Pagination from "../../../../components/Pagination/pagination";
import Button from "../../../../components/Button/Button";
import SearchInput from "../../../../components/filter/Searchbar";
import Modal from "../../../../components/Modal/modal";
import CreateUserForm from "./CreateUser";
import EditUserForm from "./EditUser";
import { Pencil, UserX, UserCheck } from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { BulkUserUpload } from "./BulkUser";
import { useAuth } from "../../../../contexts/AuthContext";
 
const SORT_DIRECTIONS = { ASC: "asc", DESC: "desc" };
const ITEMS_PER_PAGE = 10;

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTIONS.ASC);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUseruuId, setSelectedUseruuId] = useState(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [actionType, setActionType] = useState(""); // "activate" or "deactivate"
  const [userBulkUploadModalOpen, setUserBulkUploadModalOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const accessDeniedShownRef = useRef(false);
  const { logout } = useAuth();
 
  useEffect(() => {
    if (!token) {
      showStatusToast("Session expired. Please login again.", "warning");
      logout();
    }
  }, [token, navigate]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      if (err.response?.status === 403) {
        if (!accessDeniedShownRef.current) {
          showStatusToast("Access denied. Admins only.", "error");
          accessDeniedShownRef.current = true;
        }
        navigate("/dashboard");
      } else if (err.response?.status === 401) {
        showStatusToast("Token tampered", "error");
        logout();
      } else {
        showStatusToast("Failed to load users.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserCreated = () => {
    setCreateModalOpen(false);
    showStatusToast("User created successfully!", "success");
    fetchUsers();
  };

  const handleUserUpdated = () => {
    setEditModalOpen(false);
    setSelectedUseruuId(null);
    showStatusToast("User updated successfully!", "success");
    fetchUsers();
  };

  const handleEditClick = (useruuId) => {
    setSelectedUseruuId(useruuId);
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedUseruuId(null);
  };
 
  // ✅ When deactivate or activate button is clicked
  const handleToggleClick = (useruuId, currentStatus) => {
    setUserToToggle(useruuId);
    setActionType(currentStatus ? "deactivate" : "activate");
    setConfirmModalOpen(true);
  };
 
  // ✅ Confirm activation/deactivation
  const confirmToggle = async () => {
    if (!userToToggle) return;
    try {
      if (actionType === "deactivate") {
        await axios.delete(
          `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users/uuid/${userToToggle}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers((prev) =>
          prev.map((u) =>
            u.user_uuid === userToToggle ? { ...u, is_active: false } : u
          )
        );
        showStatusToast("User deactivated successfully.", "success");
      } else {
        await axios.patch(
          `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users/uuid/${userToToggle}/activate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers((prev) =>
          prev.map((u) =>
            u.user_uuid === userToToggle ? { ...u, is_active: true } : u
          )
        );
        showStatusToast("User activated successfully.", "success");
      }
    } catch (err) {
      console.error(`${actionType} failed:`, err);
      showStatusToast(`Failed to ${actionType} user.`, "error");
    } finally {
      setConfirmModalOpen(false);
      setUserToToggle(null);
      setActionType("");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      `${user.first_name} ${user.last_name} ${user.mail} ${user.contact}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const sortedUsers = useMemo(() => {
    const copy = [...filteredUsers];
    copy.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "name":
          aVal = `${a.first_name} ${a.last_name}`.toLowerCase();
          bVal = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case "email":
          aVal = (a.mail ?? "").toLowerCase();
          bVal = (b.mail ?? "").toLowerCase();
          break;
        case "contact":
          aVal = (a.contact ?? "").toString();
          bVal = (b.contact ?? "").toString();
          break;
        case "status":
          aVal = a.is_active ? 1 : 0;
          bVal = b.is_active ? 1 : 0;
          break;
        default:
          aVal = bVal = "";
      }
      return sortDirection === SORT_DIRECTIONS.ASC
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
    return copy;
  }, [filteredUsers, sortBy, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedUsers, currentPage]);

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
 
  const headers = ["ID", "Name", "Email", "Contact", "Status", "Actions"];
  const columns = ["user_id", "name", "mail", "contact", "status", "actions"];

  const tableData = paginatedUsers.map((user) => {
    let formattedContact = user.contact;
    if (user.contact) {
      const phoneNumber = parsePhoneNumberFromString(
        "+" + user.contact.replace(/\D/g, "")
      );
      if (phoneNumber) {
        formattedContact = phoneNumber.formatInternational();
      }
    }

    return {
      user_id: user.user_id,
      name: `${user.first_name} ${user.last_name}`,
      mail: user.mail,
      contact: formattedContact,
      status: user.is_active ? "Active" : "Inactive",
      actions: (
        <div className="flex gap-4 items-center">
          <span
            className="cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={() => handleEditClick(user.user_uuid)}
            title="Edit"
          >
            <Pencil size={18} />
          </span>
 
          {user.is_active ? (
            <span
              className="cursor-pointer text-red-600 hover:text-red-800"
              onClick={() => handleToggleClick(user.user_uuid, true)}
              title="Deactivate"
            >
              <UserX size={18} />
            </span>
          ) : (
            <span
              className="cursor-pointer text-green-600 hover:text-green-800"
              onClick={() => handleToggleClick(user.user_uuid, false)}
              title="Activate"
            >
              <UserCheck size={18} />
            </span>
          )}
        </div>
      ),
    };
  });

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
        <div className="space-x-3 flex flex-wrap gap-2">
          <Button
            onClick={() => setUserBulkUploadModalOpen(true)}
            variant="primary"
            size="medium"
          >
            + Add User Bulk
          </Button>
          <Button
            onClick={() => setCreateModalOpen(true)}
            variant="primary"
            size="medium"
          >
            + Add User
          </Button>
          <Button
            onClick={() => navigate("/user-management/users/roles")}
            variant="secondary"
            size="medium"
          >
            User Roles
          </Button>
        </div>
      </div>

      <SearchInput
        onSearch={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        placeholder="Search users by name, email, or contact..."
        className="mb-4 max-w-md"
      />

      <GenericTable
        headers={headers}
        rows={tableData}
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New User"
        subtitle="Fill out the form to add a new user to the system."
        className="!mt-16 !max-h-[calc(100vh-8rem)] overflow-y-auto"
      >
        <CreateUserForm
          onSuccess={handleUserCreated}
          onClose={() => setCreateModalOpen(false)}
        />
      </Modal>
 
      {/* Bulk Upload Modal */}
      <Modal
        isOpen={userBulkUploadModalOpen}
        onClose={() => setUserBulkUploadModalOpen(false)}
        title="Bulk Upload Users"
        subtitle="Excel should contain 4 columns: first_name, last_name, mail, and contact (as headers)."
        className="!mt-16 !max-h-[calc(100vh-8rem)] !overflow-hidden"
      >
        <BulkUserUpload
          onClose={() => setUserBulkUploadModalOpen(false)}
          onSuccess={fetchUsers}
        />
      </Modal>
 
      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        title="Edit User"
        subtitle="Update the user information below."
        className="!mt-16 !max-h-[calc(100vh-8rem)] overflow-hidden"
      >
        {selectedUseruuId && (
          <EditUserForm
            userId={selectedUseruuId}
            onSuccess={handleUserUpdated}
            onClose={handleEditClose}
          />
        )}
      </Modal>
 
      {/* Confirm Activate/Deactivate Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={
          actionType === "deactivate"
            ? "Confirm Deactivation"
            : "Confirm Activation"
        }
        subtitle={
          actionType === "deactivate"
            ? "Are you sure you want to deactivate this user?"
            : "Are you sure you want to activate this user?"
        }
        className="!mt-16 !max-h-[calc(100vh-8rem)] !overflow-hidden"
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={() => setConfirmModalOpen(false)}
            variant="secondary"
            size="medium"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmToggle}
            variant={actionType === "deactivate" ? "danger" : "success"}
            size="medium"
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}
