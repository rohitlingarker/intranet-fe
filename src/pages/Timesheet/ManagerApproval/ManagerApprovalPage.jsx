// import React, { useEffect, useState } from "react";
// import ManagerApprovalTable from "./ManagerApprovalTable";
// import { User } from "lucide-react";

// const ManagerApprovalPage = () => {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState([]);
//   const managerId = 3; // Replace with dynamic ID if available

//   useEffect(() => {
//     const fetchTimesheets = async () => {
//       try {
//         const response = await fetch(`http://localhost:8080/api/timesheets/manager/${managerId}`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch timesheets");
//         }

//         const result = await response.json();

//         // Map API response to table-friendly format
//         const mappedData = result.map((item) => ({
//           timesheetId: item.timesheetId,
//           userId: item.userId,
//           userName:"User "+item.userId,
//           // employeeName: `User ${item.userId}`, // Replace if you have a userName in API
//           workDate: item.workDate,
//           hoursWorked: item.entries.reduce((sum, entry) => sum + entry.hoursWorked, 0),
//           approvalStatus: item.status
//         }));

//         setData(mappedData);
//       } catch (error) {
//         console.error("Error fetching timesheets:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTimesheets();
//   }, [managerId]);

//   const handleApprove = async (id) => {
//     try {
//       // Call approve API if available (PUT or PATCH)
//       // await fetch(`/api/timesheets/${id}/approve`, { method: "PUT" });

//       setData((prev) =>
//         prev.map((row) =>
//           row.timesheetId === id ? { ...row, approvalStatus: "Approved" } : row
//         )
//       );
//     } catch (error) {
//       console.error("Error approving timesheet:", error);
//     }
//   };

//   const handleReject = async (id) => {
//     try {
//       // Call reject API if available (PUT or PATCH)
//       // await fetch(`/api/timesheets/${id}/reject`, { method: "PUT" });

//       setData((prev) =>
//         prev.map((row) =>
//           row.timesheetId === id ? { ...row, approvalStatus: "REJECTED" } : row
//         )
//       );
//     } catch (error) {
//       console.error("Error rejecting timesheet:", error);
//     }
//   };

//   const handleView = (row) => {
//     alert(`Viewing details of ${row.employeeName} (Timesheet ID: ${row.timesheetId})`);
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Manager Timesheet Approvals</h1>
//       <ManagerApprovalTable
//         loading={loading}
//         data={data}
//         onApprove={handleApprove}
//         onReject={handleReject}
//         onViewDetails={handleView}
//       />
//     </div>
//   );
// };

// export default ManagerApprovalPage;
//---------------------------------------------------------------------------------------------------


import React, { useEffect, useState } from "react";
import ManagerApprovalTable from "./ManagerApprovalTable";

const ManagerApprovalPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const managerId = 3; // Replace with dynamic manager ID if needed

  // Fetch Timesheets
  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/timesheets/manager/${managerId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch timesheets");
        }
        const result = await response.json();

        const mappedData = result.map((item) => ({
          timesheetId: item.timesheetId,
          userId: item.userId,
          userName: `User ${item.userId}`, // Replace if API provides actual name
          workDate: item.workDate,
          hoursWorked: item.entries.reduce(
            (sum, entry) => sum + entry.hoursWorked,
            0
          ),
          approvalStatus: item.status,
          entries: item.entries // ✅ Pass entries for ExpandedRow
        }));

        setData(mappedData);
      } catch (error) {
        console.error("Error fetching timesheets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimesheets();
  }, [managerId]);

  // Approve Timesheet
  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/timesheets/review/${managerId}?status=APPROVED`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timesheetId: id, comment: "Approved by Manager" })
        }
      );

      if (!response.ok) throw new Error("Failed to approve timesheet");

      setData((prev) =>
        prev.map((row) =>
          row.timesheetId === id ? { ...row, approvalStatus: "APPROVED" } : row
        )
      );
    } catch (error) {
      console.error("Error approving timesheet:", error);
    }
  };

  // Reject Timesheet
  const handleReject = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/timesheets/review/${managerId}?status=REJECTED`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timesheetId: id, comment: "Rejected by Manager" })
        }
      );

      if (!response.ok) throw new Error("Failed to reject timesheet");

      setData((prev) =>
        prev.map((row) =>
          row.timesheetId === id ? { ...row, approvalStatus: "REJECTED" } : row
        )
      );
    } catch (error) {
      console.error("Error rejecting timesheet:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Manager Timesheet Approvals
      </h1>
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
