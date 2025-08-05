import React from "react";
import SearchInput from "../../components/filter/SearchInput";
import DateFilter from "../../components/filter/DateFilter";
import Dropdown from "../../components/filter/Dropdown";

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
      {/* ✅ Reuse Search Component */}
      <SearchInput
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {/* ✅ Reuse Date Component */}
      <DateFilter
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />

      {/* ✅ Reuse Dropdown Component */}
      <Dropdown
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        options={[
          { label: "All Status", value: "" },
          { label: "Pending", value: "PENDING" },
          { label: "Approved", value: "APPROVED" },
          { label: "Rejected", value: "REJECT" },
        ]}
      />
    </div>
  );
};

export default TimesheetFilters;
