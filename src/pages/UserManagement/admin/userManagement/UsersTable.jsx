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
import { Pencil, UserX } from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js"; // ✅ Import libphonenumber-js
 
const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
};
 
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
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUseruuId, setSelectedUseruuId] = useState(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
 
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const accessDeniedShownRef = useRef(false);
 
  useEffect(() => {
    if (!token) {
      showStatusToast("Session expired. Please login again.", "warning");
      navigate("/");
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
      if (err.response?.status === 403 || err.response?.status === 401) {
        if (!accessDeniedShownRef.current) {
          showStatusToast("Access denied. Admins only.", "error");
          accessDeniedShownRef.current = true;
        }
        navigate("/dashboard");
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
    setSelectedUserId(null);
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
    setSelectedUserId(null);
    setSelectedUseruuId(null);
  };
 
  const handleDeleteClick = (useruuId) => {
    setUserToDelete(useruuId);
    setConfirmModalOpen(true);
  };
 
  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users/uuid/${userToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.user_uuid === userToDelete ? { ...u, is_active: false } : u
        )
      );
      showStatusToast("User deactivated.", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showStatusToast("Failed to deactivate user.", "error");
    } finally {
      setConfirmModalOpen(false);
      setUserToDelete(null);
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
 
  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) =>
        prev === SORT_DIRECTIONS.ASC
          ? SORT_DIRECTIONS.DESC
          : SORT_DIRECTIONS.ASC
      );
    } else {
      setSortBy(key);
      setSortDirection(SORT_DIRECTIONS.ASC);
    }
  };
 
  const headers = ["ID", "Name", "Email", "Contact", "Status", "Actions"];
  const columns = ["user_id", "name", "mail", "contact", "status", "actions"];
 
  const tableData = paginatedUsers.map((user) => {
    // ✅ Format contact number
    let formattedContact = user.contact;
    if (user.contact) {
      const phoneNumber = parsePhoneNumberFromString("+" + user.contact.replace(/\D/g, ""));
      if (phoneNumber) {
        formattedContact = `${phoneNumber.formatInternational()}`;
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
          <span
            className={`cursor-pointer ${
              user.is_active ? "text-red-600 hover:text-red-800" : "text-gray-400"
            }`}
            onClick={() => user.is_active && handleDeleteClick(user.user_uuid)}
            title="Deactivate"
          >
            <UserX size={18} />
          </span>
        </div>
      ),
    };
  });
 
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-semibold text-gray-800 ">Users</h2>
        <div className="space-x-3 flex flex-wrap gap-2">
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
        className="!mt-16 !max-h-[calc(100vh-8rem)] !overflow-hidden"
      >
        <CreateUserForm
          onSuccess={handleUserCreated}
          onClose={() => setCreateModalOpen(false)}
        />
      </Modal>
 
      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        title="Edit User"
        subtitle="Update the user information below."
        className="!mt-16 !max-h-[calc(100vh-8rem)] !overflow-hidden"
      >
        {selectedUseruuId && (
          <EditUserForm
            userId={selectedUseruuId}
            onSuccess={handleUserUpdated}
            onClose={handleEditClose}
          />
        )}
      </Modal>
 
      {/* Confirm Deactivate Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Deactivation"
        subtitle="Are you sure you want to deactivate this user?"
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
            onClick={confirmDelete}
            variant="danger"
            size="medium"
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}
 