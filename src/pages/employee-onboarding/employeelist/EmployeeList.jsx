import { useState, useMemo, useEffect } from "react";
import EmployeeTable from "./components/EmployeeTable";
import SearchBar from "./components/SearchBar";
import FiltersBar from "./components/FiltersBar";
import { employeeMock } from "./api/employeelist";
import Pagination from "../../../components/Pagination/pagination";

export default function EmployeeListPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  /* 🔎 Filter + Search Logic */
  const filteredData = useMemo(() => {
    return employeeMock.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.id.includes(search) ||
        emp.username.toLowerCase().includes(search.toLowerCase());

      const matchDept = department ? emp.department === department : true;
      const matchStatus = status ? emp.employmentStatus === status : true;
      const matchLocation = location ? emp.location === location : true;

      return matchSearch && matchDept && matchStatus && matchLocation;
    });
  }, [search, department, status, location]);

  /* Reset page when filters/search change */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, department, status, location]);

  /* Pagination logic */
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 12 }}>Employees</h2>

      {/* 🔎 Search + Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <SearchBar value={search} onChange={setSearch} />

        <FiltersBar
          department={department}
          setDepartment={setDepartment}
          status={status}
          setStatus={setStatus}
          location={location}
          setLocation={setLocation}
        />
      </div>

      {/* 📋 Table */}
      <div
        style={{
          background: "white",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        {/* Horizontal Scroll Wrapper */}
        <div
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="hide-scrollbar"
        >
          <EmployeeTable data={paginatedData} />
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        onNext={() =>
          setCurrentPage((p) => Math.min(p + 1, totalPages))
        }
      />
    </div>
  );
}
