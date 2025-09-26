import React, { useEffect, useState } from "react";
import axios from "axios";

const PMS_BASE_URL = import.meta.env.VITE_PMS_BASE_URL;
const token = localStorage.getItem("token");

// Generate a color based on employee name
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 60%, 50%)`;
  return color;
};

// Get color for leave status
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

// Avatar with hover tooltip popover
const EmployeeAvatar = ({ employee }) => {
  const avatarColor = stringToColor(employee.name);

  return (
    <div className="relative inline-block m-1 group">
      {/* Circle with first letter */}
      <div
        className="w-10 h-10 rounded-full text-white flex items-center justify-center cursor-pointer"
        style={{ backgroundColor: avatarColor }}
      >
        {employee.name.charAt(0).toUpperCase()}
      </div>

      {/* Tooltip Popover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
        <div className="relative bg-gray-800 text-white text-xs rounded px-3 py-2 shadow-lg whitespace-nowrap">
          {/* Arrow */}
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

const ProjectMembersOnLeave = ({ employeeId }) => {
  const [projectMembersOnLeave, setProjectMembersOnLeave] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch projects where employee is working
        const projectsRes = await axios.get(`${PMS_BASE_URL}/api/projects/member/${employeeId}/active-projects`,{
            headers: {
              Authorization: `Bearer ${token}`
            }
        });
        const projects = projectsRes.data;
        console.log("Projects:", projects);

        // 2. Get the employee’s leave dates
        const empLeaveRes = await axios.get(`${PMS_BASE_URL}/leaves/employee/${employeeId}`,{
            headers: {
              Authorization: `Bearer ${token}`
            }
        });
        const employeeLeaves = empLeaveRes.data;
        const currentLeave = employeeLeaves[0];
        const { startDate, endDate } = currentLeave;

        // 3. For each project, get all employees and their leaves
        const results = await Promise.all(
          projects.map(async (project) => {
            const empRes = await axios.get(`${PMS_BASE_URL}/projects/${project.id}/employees`);
            const employees = empRes.data;

            const leavesWithFilter = await Promise.all(
              employees.map(async (emp) => {
                const leaveRes = await axios.get(`${PMS_BASE_URL}/leaves/employee/${emp.employeeId}`);
                const leaves = leaveRes.data;

                const overlappingLeaves = leaves.filter(
                  (leave) =>
                    new Date(leave.startDate) <= new Date(endDate) &&
                    new Date(leave.endDate) >= new Date(startDate)
                );

                return overlappingLeaves.length > 0 ? { ...emp, leaves: overlappingLeaves } : null;
              })
            );

            return {
              ...project,
              membersOnLeave: leavesWithFilter.filter(Boolean),
            };
          })
        );

        setProjectMembersOnLeave(results);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch project members on leave");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Project Members on Leave (Same Dates)</h2>
      {projectMembersOnLeave.length === 0 ? (
        <p>No matching members found.</p>
      ) : (
        projectMembersOnLeave.map((project) => (
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
        ))
      )}
    </div>
  );
};

export default ProjectMembersOnLeave;

