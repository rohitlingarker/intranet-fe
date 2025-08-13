import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import useLeaveConsumption from "../hooks/useLeaveConsumption";
import LeaveUsageChart from "./LeaveUsageChart";

const BASE_URL = import.meta.env.VITE_BASE_URL;
// console.log("axiosINtance", )


export default function LeaveDashboard({ employeeId }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const { leaveData, loading } = useLeaveConsumption(employeeId);

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/leave/types`);
      setLeaveTypes(res.data);
    } catch (err) {
      toast.error(err?.message || "Failed to fetch leave types");
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

  // Separate sections
  const mainLeaves = leaveData.filter((leave) => {
    const name = getDisplayName(leave.leaveType.leaveName).toLowerCase();
    return !name.includes("paternity") && !name.includes("maternity");
  });

  const specialLeaves = leaveData.filter((leave) => {
    const name = getDisplayName(leave.leaveType.leaveName).toLowerCase();
    return name.includes("paternity") || name.includes("maternity");
  });

  return (
    <>
      {/* Top grid for normal leaves */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainLeaves.map((leave) => {
          const displayName = getDisplayName(leave.leaveType.leaveName);
          const isUnpaid = displayName.toLowerCase().includes("unpaid");
          const isCompOff = displayName.toLowerCase().includes("compensatory");

          return (
            <div
              key={leave.balanceId}
              className="bg-white p-6 rounded-lg shadow"
            >
              <div className="flex items-center w-full justify-between">
                <h3 className="font-semibold text-gray-900">{displayName}</h3>
                <button className="text-indigo-600 text-xs hover:text-indigo-800 transition-colors">
                  View details
                </button>
              </div>

              {/* Chart */}
              <LeaveUsageChart leave={leave} />

              {/* Stats section */}
              <div className="space-y-2 mt-4">
                {/* AVAILABLE / CONSUMED */}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">AVAILABLE</span>
                  <span className="text-gray-500">CONSUMED</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>
                    {isUnpaid
                      ? "∞ days"
                      : Math.max(leave.accruedLeaves - leave.usedLeaves, 0) +
                        " days"}
                  </span>
                  <span>{leave.usedLeaves} days</span>
                </div>

                {/* ANNUAL QUOTA only */}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">ANNUAL QUOTA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>
                    {isUnpaid ? "∞ days" : `${leave.totalLeaves || "-"} days`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom section for Paternity & Maternity */}
      {specialLeaves.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow flex mt-5 text-sm">
          <h4>Other Leave Types Available:</h4>
          <div className="space-y">
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
