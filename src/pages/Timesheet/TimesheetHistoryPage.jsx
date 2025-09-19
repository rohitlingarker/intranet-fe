import React, { useState, useEffect } from "react";
import TimesheetHeader from "./TimesheetHeader";
import TimesheetFilters from "./TimesheetFilters";
import TimesheetTable from "./TimesheetTable";
import { fetchTimesheetHistory ,fetchProjectTaskInfo} from "./api";

const TimesheetHistoryPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [user, setUser] = useState(null);
  const [projectInfo, setProjectInfo] = useState([]);

  // Fetch user info
  // useEffect(() => {
  //   fetch(`${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/me`)
  //     .then((res) => {
  //       if (!res.ok) throw new Error("Failed to fetch user");
  //       return res.json();
  //     })
  //     .then((userData) => setUser({ name: userData.name, email: userData.email }))
  //     .catch((err) => console.error("Error fetching user:", err));
  // }, []);

  // Fetch timesheet history
useEffect(() => {
    fetchProjectTaskInfo().then(setProjectInfo);
  }, []);

  const projectIdToName = Object.fromEntries(
    projectInfo.map((p) => [p.projectId, p.project])
  );
  
useEffect(() => {
  const loadTimesheetHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchTimesheetHistory(user?.user_id || 1);
      console.log("Fetched timesheet history:", data);

      setEntries(data);
    } catch (err) {
      console.error("Failed to fetch timesheet history:", err);
    } finally {
      setLoading(false);
    }
  };

  loadTimesheetHistory();
}, [user]);


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
    // const matchesSearch = []

    const matchesDate = filterDate ? timesheet.workDate === filterDate : true;
    const matchesStatus =
      filterStatus === "All Status" || timesheet.status === filterStatus;

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
          mapWorkType={mapWorkType}
          projectInfo={projectInfo}
          refreshData={()=>{
            // Callback to refresh data after save
            setLoading(true);
            fetch(`${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/timesheet/history`,{
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
              .then((res) => res.json())
              .then((data) => {
                setEntries(data);
                setLoading(false);
              })
              .catch((err) => {
                console.error("Failed to fetch timesheets:", err);
                setLoading(false);
              });
          }}
        />
      </main>
    </div>
  );
};

export default TimesheetHistoryPage;

