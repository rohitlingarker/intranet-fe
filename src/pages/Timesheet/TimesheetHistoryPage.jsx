import React, { useState, useEffect } from "react";
import TimesheetHeader from "./TimesheetHeader";
import TimesheetFilters from "./TimesheetFilters";
import TimesheetTable from "./TimesheetTable";

const TimesheetHistoryPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [user, setUser] = useState(null);

  // Fetch user info
  useEffect(() => {
    fetch("http://localhost:8080/me")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((userData) => setUser({ name: userData.name, email: userData.email }))
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  // Fetch timesheet history
  useEffect(() => {
    fetch("http://localhost:8080/api/timesheet/history")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch timesheets:", err);
        setLoading(false);
      });
  }, [user]);

  const projectIdToName = {
    1: "Intranet Portal",
    2: "HR Dashboard",
    3: "Ecommerce App",
    4: "CMS Refactor",
  };

  const taskIdToName = {
    1: "UI Design",
    2: "API Integration",
    3: "Bug Fixing",
    4: "Testing",
  };

  const mapWorkType = (type) => {
    switch (type) {
      case "WFO": return "Office";
      case "WFH": return "Home";
      case "HYBRID": return "Hybrid";
      default: return type;
    }
  };

  // Filter entries
  const filteredEntries = entries.filter((timesheet) => {
    const matchesSearch = timesheet.entries.some((entry) => {
      const projectName = projectIdToName[entry.projectId] || "";
      return projectName.toLowerCase().includes(searchText.toLowerCase());
    });

    const matchesDate = filterDate ? timesheet.workDate === filterDate : true;
    const matchesStatus =
      filterStatus === "All Status" || timesheet.approvalStatus === filterStatus;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage);
  const paginatedData = filteredEntries.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f9fb" }}>
      <main style={{ flex: 1, padding: 36 }}>
        <TimesheetHeader />
        <TimesheetFilters
          searchText={searchText}
          setSearchText={setSearchText}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
        <TimesheetTable
          loading={loading}
          data={paginatedData}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          projectIdToName={projectIdToName}
          taskIdToName={taskIdToName}
          mapWorkType={mapWorkType}
        />
      </main>
    </div>
  );
};

export default TimesheetHistoryPage;

