import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import useLeaveConsumption from "../hooks/useLeaveConsumption";
import LeaveUsageChart from "./LeaveUsageChart";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function LeaveDashboard({ employeeId, refreshKey }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const { leaveData, loading } = useLeaveConsumption(employeeId, refreshKey);

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/leave/types`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLeaveTypes(res.data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch leave types");
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  if (loading) return <p className="text-center">Loading leave data...</p>;

  const getDisplayName = (leaveName) => {
    const matchingType = leaveTypes.find((type) => type.name === leaveName);
    return matchingType ? matchingType.label : leaveName;
  };

  // Separate data
  const mainLeaves = leaveData.filter((leave) => {
    const name = getDisplayName(leave.leaveType.leaveName).toLowerCase();
    return !name.includes("paternity") && !name.includes("maternity");
  });

  const specialLeaves = leaveData.filter((leave) => {
    const name = getDisplayName(leave.leaveType.leaveName).toLowerCase();
    return name.includes("paternity") || name.includes("maternity");
  });

  // --- ✨ NEW: Logic to sort the main leave types ---
  // Define the desired display order.
  const desiredOrder = [
    "Earned Leave",
    "Sick Leave",
    "Unpaid Leave",
    "CompOff Leave",
  ];

  // Sort the 'mainLeaves' array based on the 'desiredOrder'.
  const sortedMainLeaves = [...mainLeaves].sort((a, b) => {
    const nameA = getDisplayName(a.leaveType.leaveName);
    const nameB = getDisplayName(b.leaveType.leaveName);

    const indexA = desiredOrder.indexOf(nameA);
    const indexB = desiredOrder.indexOf(nameB);

    // If a leave type is not in our desiredOrder array, move it to the end.
    const rankA = indexA === -1 ? Infinity : indexA;
    const rankB = indexB === -1 ? Infinity : indexB;

    return rankA - rankB;
  });
  // --- End of new logic ---

  console.log("data", leaveData);

  return (
    <>
      {/* Top grid for normal leaves */}
      <div className="grid grid-cols-1  md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* ✨ CHANGED: Map over the new 'sortedMainLeaves' array */}
        {sortedMainLeaves.map((leave) => {
          const displayName = getDisplayName(leave.leaveType.leaveName);

          return (
            <div
              key={leave.balanceId}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center w-full justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900">{displayName}</h3>
                <button className="text-indigo-600 text-xs hover:text-indigo-800 transition-colors">
                  View details
                </button>
              </div>

              {/* Always show chart for main leaves */}
              <LeaveUsageChart leave={leave} />

              {/* Stats section */}
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">AVAILABLE</span>
                  <span className="text-gray-500">CONSUMED</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>
                    {Math.max(leave.remainingLeaves, 0)} days
                  </span>
                  <span>{leave.usedLeaves} days</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">ACCRUED SO FAR</span>
                  <span className="text-gray-500">ANNUAL QUOTA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{leave.accruedLeaves} days</span>
                  <span>{leave.totalLeaves || "-"} days</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom section for Paternity & Maternity */}
      {specialLeaves.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow flex text-sm font-medium mb-4">
          <h4>Other Leave Types Available:</h4>
          <div className="space-y-4">
            {specialLeaves.map((leave) => {
              const displayName = getDisplayName(leave.leaveType.leaveName);

              return (
                <div key={leave.balanceId}>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {displayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}