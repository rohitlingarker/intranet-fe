// import React, { useEffect, useState } from "react";
// import ManagerApprovalTable from "./ManagerApprovalTable";

// const ManagerApprovalPage = () => {
//   const [loading, setLoading] = useState(true);
//   const [approvals, setApprovals] = useState([]);

//   useEffect(() => {
//     // Fetch pending approvals from backend
//     setLoading(true);
//     fetch("/api/manager/approvals")
//       .then((res) => res.json())
//       .then((data) => {
//         setApprovals(data);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, []);

//   const handleApprove = (id) => {
//     console.log("Approve Timesheet:", id);
//     // API call to approve
//   };

//   const handleReject = (id) => {
//     console.log("Reject Timesheet:", id);
//     // API call to reject
//   };

//   const handleViewDetails = (row) => {
//     console.log("View Details:", row);
//     // Open modal with details
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-4">Manager Approvals</h2>
//       <ManagerApprovalTable
//         loading={loading}
//         data={approvals}
//         onApprove={handleApprove}
//         onReject={handleReject}
//         onViewDetails={handleViewDetails}
//       />
//     </div>
//   );
// };

// export default ManagerApprovalPage;








import React, { useEffect, useState } from "react";
import ManagerApprovalTable from "./ManagerApprovalTable";

const ManagerApprovalPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setData([
        {
          timesheetId: 101,
          employeeId: "EMP001",
          employeeName: "John Doe",
          workDate: "2025-08-05",
          hoursWorked: 8,
          approvalStatus: "PENDING"
        },
        {
          timesheetId: 102,
          employeeId: "EMP002",
          employeeName: "Jane Smith",
          workDate: "2025-08-04",
          hoursWorked: 7,
          approvalStatus: "APPROVED"
        },
        {
          timesheetId: 103,
          employeeId: "EMP003",
          employeeName: "Mike Ross",
          workDate: "2025-08-03",
          hoursWorked: 6,
          approvalStatus: "REJECTED"
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleApprove = (id) => {
    setData((prev) =>
      prev.map((row) =>
        row.timesheetId === id ? { ...row, status: "APPROVED" } : row
      )
    );
  };

  const handleReject = (id) => {
    setData((prev) =>
      prev.map((row) =>
        row.timesheetId === id ? { ...row, approvalStatus: "REJECTED" } : row
      )
    );
  };

  const handleView = (row) => {
    alert(`Viewing details of ${row.employeeName} (Timesheet ID: ${row.timesheetId})`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manager Timesheet Approvals</h1>
      <ManagerApprovalTable
        loading={loading}
        data={data}
        onApprove={handleApprove}
        onReject={handleReject}
        onViewDetails={handleView}
      />
    </div>
  );
};

export default ManagerApprovalPage;
