
 import React from "react";
const TimesheetFilters = ({
  searchText,
  setSearchText,
  filterDate,
  setFilterDate,
  filterStatus,
  setFilterStatus,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        background: "#fff",
        borderRadius: 8,
        padding: "16px 20px",
        boxShadow: "0 1px 6px #e4e7ee",
        marginTop: 28,
        marginBottom: 22,
      }}
    >
      <input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{
          flex: 1,
          border: "1px solid #d0d6de",
          borderRadius: 4,
          padding: "8px 14px",
          fontSize: 15,
          background: "#f9fafb",
        }}
      />
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        style={{
          border: "1px solid #d0d6de",
          borderRadius: 4,
          padding: "8px 10px",
          fontSize: 15,
          background: "#f9fafb",
        }}
      />
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        style={{
          border: "1px solid #d0d6de",
          borderRadius: 4,
          padding: "8px 10px",
          fontSize: 15,
          background: "#f9fafb",
        }}
      >
        <option>All Status</option>
        <option value={"Pending"}>Pending</option>
        <option value={"Approved"}>Approved</option>
        <option value={"Rejected"}>Rejected</option>
      </select>
    </div>
  );
};

export default TimesheetFilters;
