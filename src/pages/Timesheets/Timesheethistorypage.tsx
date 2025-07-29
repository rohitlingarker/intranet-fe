import React, { useState, useEffect } from "react";
import TimeManagementTable, { TimesheetEntry } from "./TimesheetTable";
import DayTrackModal from "./DayTrackModal";

const TimesheethistoryPage: React.FC = () => {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');

  useEffect(() => {
    const token = localStorage.getItem("token");
  fetch("http://localhost:8080/api/timesheet/history")
    .then((res) => res.json())
    .then((data) => {
      const flattened: TimesheetEntry[] = data.flatMap((timesheet: any) =>
        timesheet.entries.map((entry: any) => ({
          date: timesheet.workDate,
          project: projectIdToName[entry.projectId] || `Project-${entry.projectId}`, // map if needed
          task: taskIdToName[entry.taskId] || `Task-${entry.taskId}`,               // map if needed
          description: entry.description,
          workType: mapWorkType(entry.workType),
          hours: entry.hoursWorked,
          status: timesheet.approvalStatus, // or dynamically from backend if available
          employee: "John Doe", // from session / props if known
          email: "john@gmail.com", // from session / props if known
          start: entry.fromTime,
          end: entry.toTime,
        }))
      );

      setEntries(flattened);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Failed to fetch timesheets:", err);
      setLoading(false);
    });
}, []);




const projectIdToName: { [key: number]: string } = {
  1: "Intranet Portal",
  2: "HR Dashboard",
  3: "Ecommerce App",
  4: "CMS Refactor"
};

const project = Object.entries(projectIdToName).map(([id, name]) => ({
  id: parseInt(id),
  name
}));

const taskIdToName: { [key: number]: string } = {
  1: "UI Design",
  2: "API Integration",
  3: "Bug Fixing",
  4: "Testing"
};

const mapWorkType = (type: string): string => {
    switch (type) {
      case "WFO":
        return "Office";
      case "WFH":
        return "Home";
      case "HYBRID":
        return "Hybrid";
      default:
        return type;
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.project.toLowerCase().includes(searchText.toLowerCase());
    const matchesDate = filterDate ? entry.date === filterDate : true;
    const matchesStatus = filterStatus === 'All Status' || entry.status === filterStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f9fb" }}>
      <main style={{ flex: 1, padding: 36 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Previous History Track</h1>
            <p className="text-gray-600">Track and manage timesheets, projects, and productivity</p>
          </div>
          <DayTrackModal />
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            background: '#fff',
            borderRadius: 8,
            padding: '16px 20px',
            boxShadow: '0 1px 6px #e4e7ee',
            marginTop: 28,
            marginBottom: 22,
          }}
        >
          <input
            type="text"
            placeholder="Search Projects..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{
              flex: 1,
              border: '1px solid #d0d6de',
              borderRadius: 4,
              padding: '8px 14px',
              fontSize: 15,
              background: "#f9fafb"
            }}
          />
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{
              border: '1px solid #d0d6de',
              borderRadius: 4,
              padding: '8px 10px',
              fontSize: 15,
              background: "#f9fafb"
            }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              border: '1px solid #d0d6de',
              borderRadius: 4,
              padding: '8px 10px',
              fontSize: 15,
              background: "#f9fafb"
            }}
          >
            <option>All Status</option>
            <option>PENDING</option>
            <option>APPROVED</option>
            <option>REJECTED</option>
          </select>
        </div>

        {/* Table */}
        <div style={{
          background: "#fff",
          padding: "24px",
          margin: "32px 0",
          borderRadius: 10,
          boxShadow: "0 1px 6px #e4e7ee"
        }}>
          {loading ? (
            <div className="text-center text-gray-500">Loading timesheet entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center text-gray-500">No timesheet entries found.</div>
          ) : (
            <div className="text-gray-700 mb-4 text-sm text-center">
              Showing {filteredEntries.length} of {entries.length} entries
            </div>
          )}

          <TimeManagementTable entries={filteredEntries} />
        </div>
      </main>
    </div>
  );
};

export default TimesheethistoryPage;


























