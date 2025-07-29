import React, { useState, ChangeEvent } from "react";
import TimesheetTable from "./TimesheetTable";
import DayTrackModal from "./DayTrackModal";

// Entry type enhanced with more fields
export type TimesheetEntry = {
  date: string;
  project: string;
  task: string;
  description: string;
  workType: string;
  hours: number;

};

const SIDEBAR_WIDTH = 220;

const TimesheethistoryPage: React.FC = () => {
  const [entries, setEntries] = useState<TimesheetEntry[]>([
    {
      date: "2025-07-21",
      project: "Internal Portal",
      task: "UI Development",
      workType: "Development",
      hours: 8,
      description: "Worked on feature X"
    },
    {
      date: "2025-07-22",
      project: "Website Revamp",
      task: "Bug fixes",
      workType: "Testing",
      hours: 6,
      description: "Fixed reported bugs"
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<TimesheetEntry, "id">>({
    date: "",
    project: "",
    task: "",
    workType: "",
    hours: 0,
    description: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({
      ...prev,
      [name]: name === "hours" ? Number(value) : value,
    }));
  };

  // Add these to your hooks at the top of TimesheetsPage component
const [searchText, setSearchText] = useState('');
const [filterDate, setFilterDate] = useState('');
const [filterStatus, setFilterStatus] = useState('All Status');


  const handleAddEntry = () => {
    if (
      newEntry.date &&
      newEntry.project &&
      newEntry.task &&
      newEntry.workType &&
      newEntry.hours > 0 &&
      newEntry.description
    ) {
      setEntries([...entries, { ...newEntry }]);
      setNewEntry({ date: "", project: "", task: "", workType: "", hours: 0, description: "" });
      setShowModal(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f9fb" }}>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Previos History Track</h1>
            <p className="text-gray-600">Track and manage timesheets, projects, and productivity</p>
          </div>
          <DayTrackModal/>
        </div>
        
            {/* Filter/Search Bar */}
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
      minWidth: 190,
      background: "#f9fafb"
    }}
  />
  {/* Date filter replaces All Roles */}
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
  {/* Status filter */}
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
    {/* Add more as required */}
  </select>
    </div>

        {/* Timesheets Table */}
        <div style={{
          background: "#fff",
          padding: "24px",
          margin: "32px 0",
          borderRadius: 10,
          boxShadow: "0 1px 6px #e4e7ee"
        }}>
          <TimesheetTable entries={entries} />
        </div>
      </main>
    </div>
  );
};

// Sidebar link component for reuse
const SidebarLink: React.FC<{ text: string; selected?: boolean }> = ({ text, selected }) => (
  <div style={{
    background: selected ? "#223568" : undefined,
    padding: "12px 30px",
    fontWeight: selected ? 700 : 500,
    color: selected ? "#fff" : "#a7b1c2",
    cursor: "pointer"
  }}>
    {text}
  </div>
);

// Modal dialog (simple overlay)
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div style={{
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.22)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
  }}>
    <div style={{
      background: "#fff", borderRadius: 8, padding: 28, width: 360,
      boxShadow: "0 1px 10px #c7d4e4", position: "relative"
    }}>
      <button
        aria-label="Close"
        onClick={onClose}
        style={{
          position: "absolute", right: 10, top: 10, border: 0, background: "none",
          fontSize: 20, color: "#555", cursor: "pointer"
        }}
      >×</button>
      {children}
    </div>
  </div>
);


// Styles
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 10px",
  borderBottom: "1px solid #e0e7ef",
  fontSize: 15,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 10px",
  fontSize: 15,
  color: "#333"
};

const inputStyle: React.CSSProperties = {
  marginTop: 4,
  padding: "8px 10px",
  width: "100%",
  fontSize: 16,
  borderRadius: 5,
  border: "1px solid #d0d6de",
  background: "#f9fafb",
  marginBottom: 4
};


export default TimesheethistoryPage;
