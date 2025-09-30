import React, { useEffect, useState } from "react";
import axios from "axios";
import Tooltip from "../../../components/status/Tooltip";

const PMS_BASE_URL = import.meta.env.VITE_PMS_BASE_URL;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("token");

// Generate a color based on employee name
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 50%)`;
};

// Get color for leave status
const leaveStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "text-green-500";
    case "pending":
      return "text-yellow-400";
    case "rejected":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
};

// Avatar component with Tooltip
const EmployeeAvatar = ({ employee }) => {
  const avatarColor = stringToColor(employee.name);

  // Prepare tooltip content
  const tooltipContent =
    employee.leaves && employee.leaves.length > 0 ? (
      <div>
        <div className="font-semibold mb-1">{employee.name}</div>
        {employee.leaves.map((leave) => (
          <div
            key={leave.leaveId || leave.empId}
            className={`mb-1 text-xs ${leaveStatusColor(leave.status)}`}
          >
            {leave.status.toUpperCase()} [{leave.startDate} → {leave.endDate}]
          </div>
        ))}
      </div>
    ) : (
      <div>
        <div className="font-semibold mb-1">{employee.name}</div>
        <div className="text-gray-300 italic">No leaves</div>
      </div>
    );

  return (
    <Tooltip content={tooltipContent}>
      <div
        className="w-10 h-10 rounded-full text-white flex items-center justify-center cursor-pointer"
        style={{ backgroundColor: avatarColor }}
      >
        {employee.name.charAt(0).toUpperCase()}
      </div>
    </Tooltip>
  );
};


const ProjectMembersOnLeave = ({ employeeId, leaveId }) => {
  const [projectMembersOnLeave, setProjectMembersOnLeave] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId || !leaveId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Fetch active projects of the employee
        const projectsRes = await axios.get(
          `${PMS_BASE_URL}/api/projects/member/${employeeId}/active-projects`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const projects = projectsRes.data || [];

        if (projects.length === 0) {
          setProjectMembersOnLeave([]);
          return;
        }

        // 2️⃣ Fetch current leave dates
        const empLeaveRes = await axios.get(
          `${BASE_URL}/api/leave-requests/${leaveId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const currentLeave = empLeaveRes.data?.data;
        if (!currentLeave) {
          setProjectMembersOnLeave([]);
          return;
        }
        const { startDate, endDate } = currentLeave;

        // 3️⃣ For each project, fetch members and their leaves
        const results = await Promise.all(
          projects.map(async (project) => {
            const empRes = await axios.get(
              `${PMS_BASE_URL}/api/projects/${project.id}/members`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const employees = empRes.data || [];

            const leaveCache = {};

            console.log("employees in projects",employees);
            console.log("employeeId",employeeId);
            const membersWithLeaves = await Promise.all(
              employees
                .filter((emp) => emp.id != employeeId) // exclude current employee
                .map(async (emp) => {
                  if (!leaveCache[emp.id]) {
                    const leaveRes = await axios.get(
                      `${BASE_URL}/api/leave-requests/employee/pendingAndApproved-leave/${emp.id}`,
                      {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { startDate, endDate },
                      }
                    );
                    leaveCache[emp.id] = Array.isArray(leaveRes.data?.data)
                      ? leaveRes.data.data
                      : [];
                  }
                  return { ...emp, leaves: leaveCache[emp.id] };
                })
            );

            return {
              ...project,
              membersOnLeave: membersWithLeaves.filter(
                (emp) => emp.leaves && emp.leaves.length > 0
              ), // only employees with leaves
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
  }, [employeeId, leaveId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4 border rounded bg-white shadow-sm">
      {projectMembersOnLeave.length === 0 ? (
        <p>No active projects for this employee.</p>
      ) : (
        projectMembersOnLeave.map((project) => (
          <div key={project.id} className="mb-6">
            <h3 className="font-medium">{project.name}</h3>
            <div className="flex flex-wrap mt-2">
              {project.membersOnLeave.length > 0 ? (
                project.membersOnLeave.map((emp) => (
                  <EmployeeAvatar key={emp.id} employee={emp} />
                ))
              ) : (
                <div className="text-gray-500 italic">No members on leave</div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProjectMembersOnLeave;
