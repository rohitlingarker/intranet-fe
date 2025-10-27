import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {toast} from "react-toastify";
import { useNavigate } from "react-router-dom";
import useLeaveConsumption from "../hooks/useLeaveConsumption";
import LeaveUsageChart from "./LeaveUsageChart";
import LoadingSpinner from "../../../components/LoadingSpinner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function LeaveDashboard({ employeeId, refreshKey }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const { leaveData, loading } = useLeaveConsumption(employeeId, refreshKey);
  const navigate = useNavigate();

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
  
  const getDisplayName = useCallback((leaveName) => {
    const matchingType = leaveTypes.find((type) => type.name === leaveName);
    return matchingType ? matchingType.label : leaveName;
  }, [leaveTypes]);
  
  const { sortedMainLeaves, specialLeaves, allLeaveTypesForNav } = useMemo(() => {
  // Wait until both data sources are available before doing anything.
    if (leaveData.length === 0 || leaveTypes.length === 0) {
      return { sortedMainLeaves: [], specialLeaves: [], allLeaveTypesForNav: [] };
    }

    const mainLeaves = leaveData.filter((leave) => {
      const name = getDisplayName(leave.leaveType.leaveName).toLowerCase();
      return !name.includes("paternity") && !name.includes("maternity");
    });

    const specialLeaves = leaveData.filter((leave) => {
      const name = getDisplayName(leave.leaveType.leaveName).toLowerCase();
      return name.includes("paternity") || name.includes("maternity");
    });

    const desiredOrder = [
      "Earned Leave",
      "Sick Leave",
      "Unpaid Leave",
      "CompOff Leave",
    ];

    const sortedMainLeaves = [...mainLeaves].sort((a, b) => {
      const nameA = getDisplayName(a.leaveType.leaveName);
      const nameB = getDisplayName(b.leaveType.leaveName);
      const indexA = desiredOrder.indexOf(nameA);
      const indexB = desiredOrder.indexOf(nameB);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });
    
    const allLeaveTypesForNav = [...sortedMainLeaves, ...specialLeaves].map((leave) => ({
      name: leave.leaveType.leaveName,
      label: getDisplayName(leave.leaveType.leaveName),
    }));

    return { sortedMainLeaves, specialLeaves, allLeaveTypesForNav };
  }, [leaveData, leaveTypes, getDisplayName]);

  if (loading) return <p className="text-center"><LoadingSpinner text="Loading Balances..."/></p>;

  const handleViewDetails = (leave, displayName) => {
    navigate(`/leave-details/${employeeId}/${leave.leaveType.leaveName}`, {
      state: {
        leaveTypeName: displayName,
        allLeaveTypes: allLeaveTypesForNav,
      },
    });
  };

  return (
    <>
      {/* Top grid for normal leaves */}
      <div className="grid grid-cols-1  md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {sortedMainLeaves.map((leave) => {
          const displayName = getDisplayName(leave.leaveType.leaveName);
          const isCompOff = leave.leaveType.leaveName === 'COMPENSATORY_LEAVE';
          const isUnpaid = leave.leaveType.leaveName === 'UNPAID_LEAVE';

          return (
            <div
              key={leave.balanceId}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center w-full justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{displayName}</h3>
                <button 
                  onClick={()=> handleViewDetails(leave, displayName)}
                  className="text-indigo-600 text-xs hover:text-indigo-800 transition-colors"
                >
                  View details
                </button>
              </div>

              {/* Always show chart for main leaves */}
              <LeaveUsageChart leave={leave} />

              {/* Stats section */}
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">AVAILABLE</span>
                  <span className="text-gray-500 text-right">CONSUMED</span>
                </div>
                <div className="flex justify-between text-sm">
                  {isUnpaid ? "∞ Days" : (
                    <span>
                      {Math.max(leave.remainingLeaves, 0)} days
                    </span>
                  )}
                  <span>{leave.usedLeaves} days</span>
                </div>
                {!isCompOff && (
                <div className="flex justify-between text-xs">
                  {!isUnpaid && (
                    <span className="text-gray-500">ACCRUED SO FAR</span>
                  )}
                  <span className="text-gray-500 text-right">ANNUAL QUOTA</span>
                </div>
                )}
                {!isCompOff && (
                  <div className="flex justify-between text-sm">
                    {!isUnpaid && (
                      <span>{leave.accruedLeaves} days</span>
                    )}
                    {isUnpaid 
                    ? "∞ Days" : 
                    (
                      <span>{leave.totalLeaves || "-"} days</span>
                    )}
                  </div>
                )}
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