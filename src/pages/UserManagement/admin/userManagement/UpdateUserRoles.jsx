import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import SearchInput from "../../../../components/filter/Searchbar";
import GenericTable from "../../../../components/Table/table"; // ✅ New Generic Table
import Pagination from "../../../../components/Pagination/pagination";
import Button from "../../../../components/Button/Button";

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

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.warn("Session expired. Please login again.");
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchUsersWithRoles = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.USER_MANAGEMENT_URL}/admin/users/roles`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users with roles:", err);
        toast.error("Failed to load user roles.");
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/home");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsersWithRoles();
  }, [token, navigate]);

  // ✅ Filter by name, email, or role
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) =>
      `${user.name} ${user.mail} ${user.roles?.join(" ") || ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [users, searchTerm]);

  // ✅ Sort by name
  const sortedUsers = useMemo(() => {
    const copy = [...filteredUsers];
    copy.sort((a, b) => {
      const aName = a.name?.toLowerCase() || "";
      const bName = b.name?.toLowerCase() || "";
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

  // ✅ Table Headers and Columns for GenericTable
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

  // ✅ Map paginated data for GenericTable
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
        onClick={() =>
          navigate(`/user-management/roles/edit-role/${user.user_id}`)
        }
        variant="primary"
        size="small"
      >
        Edit Roles
      </Button>
    ),
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h2 className="text-3xl font-semibold text-blue-700">
          Update User Roles
        </h2>
      </div>

      <SearchInput
        onSearch={(value) => {
          setSearchTerm(value);
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
          onNext={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        />
      )}
    </div>
  );
}
