import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import useLeaveData from "../hooks/useLeaveData"; // adjust path as needed

const WeeklyPattern = ({ employeeId }) => {
  const { leaveData, loading } = useLeaveData(employeeId);

  const [weeklyCounts, setWeeklyCounts] = useState([
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ]);

  useEffect(() => {
    if (!loading) {
      const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun

      leaveData.forEach((leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const isMaternity = leave.leaveType?.leaveName
          ?.toLowerCase()
          .includes("maternity");

        // Count applicable days (only weekdays unless maternity)
        let validDays = 0;
        let current = new Date(start);
        while (current <= end) {
          const jsDay = current.getDay();
          if (isMaternity || (jsDay !== 0 && jsDay !== 6)) {
            validDays++;
          }
          current.setDate(current.getDate() + 1);
        }

        if (validDays === 0) return; // Avoid division by 0

        const perDayValue = parseFloat(leave.daysRequested) / validDays;

        // Add values to the correct day in chart
        current = new Date(start);
        while (current <= end) {
          const jsDay = current.getDay(); // 0 = Sunday, 6 = Saturday
          const dayIdx = (jsDay + 6) % 7; // Convert to Mon=0 ... Sun=6

          if (isMaternity || (jsDay !== 0 && jsDay !== 6)) {
            counts[dayIdx] += perDayValue;
          }

          current.setDate(current.getDate() + 1);
        }
      });

      const formatted = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
        (day, i) => ({
          day,
          value: parseFloat(counts[i].toFixed(2)),
        })
      );

      setWeeklyCounts(formatted);
    }
  }, [leaveData, loading]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full h-42">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Weekly Leave Pattern</h3>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyCounts}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <XAxis dataKey="day" stroke="#888888" fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366F1" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default WeeklyPattern;
