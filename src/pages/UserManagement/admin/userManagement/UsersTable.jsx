import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import GenericTable from "../../../../components/Table/table"; // ✅ Use GenericTable
import Pagination from "../../../../components/Pagination/pagination";
import Button from "../../../../components/Button/Button";
import SearchInput from "../../../../components/filter/Searchbar";
import StatusBadge from "../../../../components/status/StatusBadge";
import { Pencil, UserX } from "lucide-react";

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
          headers: { Authorization: `Bearer ${token}` },
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

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?"))
      return;
    try {
      await axios.delete(`http://localhost:8000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, is_active: false } : u))
      );
      toast.success("User deactivated.");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to deactivate user.");
    }
  };

  const headers = ["ID", "Name", "Email", "Contact", "Status", "Actions"];

  const columns = ["user_id", "name", "mail", "contact", "status", "actions"];

  // ✅ Transform data for GenericTable
  const tableData = paginatedUsers.map((user) => ({
  user_id: user.user_id,
  name: `${user.first_name} ${user.last_name}`,
  mail: user.mail,
  contact: user.contact,
  status: user.is_active ? "Active" : "Inactive", // ✅ string instead of JSX
  actions: (
    <div className="flex gap-4 items-center">
      <span
        className="cursor-pointer text-blue-600 hover:text-blue-800"
        onClick={() =>
          navigate(`/user-management/users/edit/${user.user_id}`)
        }
        title="Edit"
      >
        <Pencil size={18} />
      </span>
      <span
        className={`cursor-pointer ${
          user.is_active ? "text-red-600 hover:text-red-800" : "text-gray-400"
        }`}
        onClick={() => user.is_active && handleDelete(user.user_id)}
        title="Deactivate"
      >
        <UserX size={18} />
      </span>
    </div>
  ),
}));


  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
        <div className="space-x-3 flex flex-wrap gap-2">
          <Button
            onClick={() => navigate("/user-management/users/create")}
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
          onNext={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        />
      )}
    </div>
  );
}
