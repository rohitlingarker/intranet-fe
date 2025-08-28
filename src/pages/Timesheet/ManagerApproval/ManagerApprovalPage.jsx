
import React, { useEffect, useState } from "react";
import ManagerApprovalTable from "./ManagerApprovalTable";
import Button from "../../../components/Button/Button"; // ✅ Using your existing Button component
import { useNavigate } from "react-router-dom"; // For navigation

const ManagerApprovalPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  // const managerId = 3; // Replace with dynamic manager ID if needed
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/timesheets/manager`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch timesheets");
        }
        const result = await response.json();

        const mappedData = result.map((item) => ({
          timesheetId: item.timesheetId,
          userId: item.userId,
          userName: `User ${item.userId}`,
          workDate: item.workDate,
          hoursWorked: item.entries.reduce(
            (sum, entry) => sum + entry.hoursWorked,
            0
          ),
          approvalStatus: item.status,
          entries: item.entries,
        }));

        setData(mappedData);
      } catch (error) {
        console.error("Error fetching timesheets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimesheets();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/timesheets/review?status=Approved`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timesheetId: id,
            comment: "Approved by Manager",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to approve timesheet");

      setData((prev) =>
        prev.map((row) =>
          row.timesheetId === id ? { ...row, approvalStatus: "Approved" } : row
        )
      );
    } catch (error) {
      console.error("Error approving timesheet:", error);
    }
  };

  const handleReject = async (id, comment) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/timesheets/review?status=Rejected`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timesheetId: id, comment }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject timesheet");

      setData((prev) =>
        prev.map((row) =>
          row.timesheetId === id ? { ...row, approvalStatus: "Rejected" } : row
        )
      );
    } catch (error) {
      console.error("Error rejecting timesheet:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Timesheet Approvals
        </h1>
        <div className="flex gap-4">
          <Button
            variant="primary"
            size="medium"
            onClick={() => navigate("/timesheets")}
          >
            My Timesheets
          </Button>
          <Button
            variant="secondary"
            size="medium"
            onClick={() => navigate("/managerapproval")}
          >
            My Approvals
          </Button>
        </div>
      </div>

      <ManagerApprovalTable
        loading={loading}
        data={data}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default ManagerApprovalPage;
