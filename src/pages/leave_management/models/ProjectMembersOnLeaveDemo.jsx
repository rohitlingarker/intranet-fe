import React from "react";

// Utility to generate colors based on employee name
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 60%, 50%)`;
  return color;
};

// Leave status color mapping
const leaveStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-400";
    case "rejected":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
};

// Employee avatar with hover tooltip
const EmployeeAvatar = ({ employee }) => {
  const avatarColor = stringToColor(employee.name);

  return (
    <div className="relative inline-block m-1 group">
      <div
        className="w-10 h-10 rounded-full text-white flex items-center justify-center cursor-pointer"
        style={{ backgroundColor: avatarColor }}
      >
        {employee.name.charAt(0).toUpperCase()}
      </div>

      {/* Tooltip popover with arrow */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
        <div className="relative bg-gray-800 text-white text-xs rounded px-3 py-2 shadow-lg whitespace-nowrap">
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45"></div>
          <div className="font-semibold mb-1">{employee.name}</div>
          {employee.leaves.map((leave) => (
            <div
              key={leave.leaveId}
              className={`px-2 py-1 rounded text-white mb-1 ${leaveStatusColor(
                leave.status
              )}`}
            >
              {leave.leaveType} ({leave.status}) [{leave.startDate} → {leave.endDate}]
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Demo component with hard-coded data
const ProjectMembersOnLeaveDemo = () => {
  const demoData = [
    {
      id: 1,
      name: "Project Apollo",
      membersOnLeave: [
        {
          employeeId: "E101",
          name: "Alice",
          leaves: [
            { leaveId: 1, leaveType: "Annual", status: "Approved", startDate: "2025-09-25", endDate: "2025-09-26" },
          ],
        },
        {
          employeeId: "E102",
          name: "Bob",
          leaves: [
            { leaveId: 2, leaveType: "Sick", status: "Pending", startDate: "2025-09-25", endDate: "2025-09-25" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Project Zephyr",
      membersOnLeave: [
        {
          employeeId: "E103",
          name: "Charlie",
          leaves: [
            { leaveId: 3, leaveType: "Casual", status: "Rejected", startDate: "2025-09-25", endDate: "2025-09-25" },
          ],
        },
      ],
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Project Members on Leave (Demo)</h2>
      {demoData.map((project) => (
        <div key={project.id} className="mb-6">
          <h3 className="font-medium">{project.name}</h3>
          {project.membersOnLeave.length === 0 ? (
            <p>No overlapping leaves.</p>
          ) : (
            <div className="flex flex-wrap mt-2">
              {project.membersOnLeave.map((emp) => (
                <EmployeeAvatar key={emp.employeeId} employee={emp} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectMembersOnLeaveDemo;
