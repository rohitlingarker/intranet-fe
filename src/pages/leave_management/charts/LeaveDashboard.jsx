import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import useLeaveConsumption from "../hooks/useLeaveConsumption";
import LeaveUsageChart from "./LeaveUsageChart";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function LeaveDashboard({ employeeId }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const { leaveData, loading } = useLeaveConsumption(employeeId);

 
  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/leave/types`);
      setLeaveTypes(res.data);
    } catch (err) {
      toast.error(err);
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

  console.log("data",leaveData)
 
  return (
    <>
      {/* Top grid for normal leaves */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {mainLeaves.map((leave) => {
          const displayName = getDisplayName(leave.leaveType.leaveName);
          const isUnpaid = displayName.toLowerCase().includes("unpaid");
 
          return (
            <div
              key={leave.balanceId}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center w-full justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{displayName}</h3>
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
                    {Math.max(leave.remainingLeaves - leave.usedLeaves, 0)} days
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
        <div className="bg-white p-6 rounded-lg shadow flex text-sm">
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