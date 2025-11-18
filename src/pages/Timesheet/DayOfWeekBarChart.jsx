import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Rectangle } from "recharts";

// Helper to get weekday name from date
const getWeekday = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

const DayOfWeekBarChart = ({ entries, dataOverride }) => {
  const data = useMemo(() => {
    if (Array.isArray(dataOverride)) return dataOverride;
    const weekdayTotals = {};
    entries.forEach((entry) => {
      const day = getWeekday(entry.date);
      const hours = parseFloat(entry.hours) || 0;
      if (!weekdayTotals[day]) weekdayTotals[day] = 0;
      weekdayTotals[day] += hours;
    });
    const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return orderedDays.map((day) => ({ day, hours: weekdayTotals[day] || 0 }));
  }, [entries, dataOverride]);

  return (
    <div className="chart-container">
      <h2 className="section-title">Total Hours by Day of Week (Monthly)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="day" />
          <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
          <Tooltip cursor={false} />
          <Legend />
          <Bar dataKey="hours" fill="#3b82f6" name="Total Hours" barSize={45} radius={[10, 10, 0, 0]} activeBar={<Rectangle fill="rgba(26, 109, 243, 0.2)" radius={[4,4,0,0]} />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DayOfWeekBarChart;