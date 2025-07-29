import React, { useState, ChangeEvent } from "react";
import TimeManagementTable, { TimesheetEntry } from "./TimesheetTable";
import DayTrackModal from "./DayTrackModal";

const TimesheethistoryPage: React.FC = () => {
  const [entries, setEntries] = useState<TimesheetEntry[]>([
    {
      employee: "John Doe",
      email: "john@gmail.com",
      date: "2025-07-21",
      project: "Internal Portal",
      task: "UI Development",
      start: "09:00",
      end: "17:00",
      workType: "Office",
      hours: 8,
      description: "Worked on feature X",
      status: "Submitted",
    },
    {
      employee: "Jane Smith",
      email: "janu@gmal.com",
      date: "2025-07-22",
      project: "Website Revamp",
      task: "Bug fixes",
      start: "10:00",
      end: "16:00",
      workType: "Home",
      hours: 6,
      description: "Fixed reported bugs",
      status: "Approved",
    },
  ]);

  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.project.toLowerCase().includes(searchText.toLowerCase());
    const matchesDate = filterDate ? entry.date === filterDate : true;
    const matchesStatus = filterStatus === 'All Status' || entry.status === filterStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f9fb" }}>
      <main style={{ flex: 1, padding: 36 }}>
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
            <option>Submitted</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        <div style={{
          background: "#fff",
          padding: "24px",
          margin: "32px 0",
          borderRadius: 10,
          boxShadow: "0 1px 6px #e4e7ee"
        }}>
          <TimeManagementTable entries={filteredEntries} />
        </div>
      </main>
    </div>
  );
};

export default TimesheethistoryPage;



      