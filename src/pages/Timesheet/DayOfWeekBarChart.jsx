// DayOfWeekBarChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  // CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Helper to get weekday from date
const getWeekday = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

const DayOfWeekBarChart = ({ entries }) => {
  // Aggregate hours by weekday
  const weekdayTotals = {};

  entries.forEach((entry) => {
    const day = getWeekday(entry.date);
    const hours = parseFloat(entry.hours) || 0;
    if (!weekdayTotals[day]) weekdayTotals[day] = 0;
    weekdayTotals[day] += hours;
  });

  // Create chart-friendly array
  const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const data = orderedDays.map((day) => ({
    day,
    hours: weekdayTotals[day] || 0,
  }));

  return (
    <div className="chart-container">
      <h2 className="section-title">Total Hours by Day of Week (Monthly)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis dataKey="day" />
          <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="hours" fill="#3b82f6" name="Total Hours" barSize={45} radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DayOfWeekBarChart;
