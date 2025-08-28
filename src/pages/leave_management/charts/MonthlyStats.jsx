import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import useLeaveData from "../hooks/useLeaveData"; // Make sure this path is correct

const monthsOrder = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MonthlyStats = ({ employeeId }) => {
  const { leaveData, loading, error } = useLeaveData(employeeId);

  const data = useMemo(() => {
    const monthlyCounts = {};

    leaveData.forEach((request) => {
      const monthIndex = new Date(request.startDate).getMonth();
      const monthName = monthsOrder[monthIndex];
      const days = parseFloat(request.daysRequested) || 0;

      if (monthlyCounts[monthName]) {
        monthlyCounts[monthName] += days;
      } else {
        monthlyCounts[monthName] = days;
      }
    });

    return monthsOrder.map((month) => ({
      month,
      leaveDays: monthlyCounts[month] || 0,
    }));
  }, [leaveData]);

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full h-42">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Monthly Leave Days</h3>
        {/* <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </button> */}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value) => `${value} day(s)`} />
              <Bar dataKey="leaveDays" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MonthlyStats;
