import React, { useEffect, useState, useRef } from "react";
import ManagerApprovalTable from "./ManagerApprovalTable";
import Button from "../../../components/Button/Button";
import ManagerDashboard from "../ManagerDashboard";
import TimesheetHeader from "../TimesheetHeader";

const ManagerApprovalPage = () => {
  const [groupedTimesheets, setGroupedTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const entriesTableRef = useRef(null);

  const handleScroll = () => {
    if (entriesTableRef.current) {
      entriesTableRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    fetchGroupedTimesheets();
  }, []);

  const fetchGroupedTimesheets = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/timesheets/manager`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch timesheets");
      }

      const data = await response.json();
      setGroupedTimesheets(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <TimesheetHeader />
      <ManagerDashboard
        setStatusFilter={setStatusFilter}
        handleScroll={handleScroll}
      />
      <ManagerApprovalTable
        loading={loading}
        groupedData={groupedTimesheets}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        ref={entriesTableRef}
        onRefresh={fetchGroupedTimesheets}
      />
    </div>
  );
};

export default ManagerApprovalPage;
