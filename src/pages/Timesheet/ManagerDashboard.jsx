import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { getManagerDashboardData } from "./api";

const ManagerDashboard = () => {
  // Mock Data
  const stats = {
    hoursLogged: 100,
    billableUtilization: 90,
    missingTimesheets: ["John Doe", "Jane Smith", "Robert Lee"],
    pendingApprovals: ["Project A - 12h", "Project B - 8h"],
  };

  const numPendingEntries = stats.pendingApprovals.length;

  const weeklyData = [
    { day: "Mon", hours: 8, utilization: 85 },
    { day: "Tue", hours: 9, utilization: 88 },
    { day: "Wed", hours: 7, utilization: 82 },
    { day: "Thu", hours: 10, utilization: 92 },
    { day: "Fri", hours: 8, utilization: 87 },
    { day: "Sat", hours: 6, utilization: 70 },
    { day: "Sun", hours: 5, utilization: 65 },
  ];
  // const [stats, setStats] = useState({});
  // const [weeklyData, setWeeklyData] = useState([]);

  // useEffect(() => {
  //   getManagerDashboardData().then((data) => {
  //     setStats(data.stats);
  //     setWeeklyData(data.weeklyData);
  //   });
  // }, []);


  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Top Section: Stats then chart (stacked on mobile, row on desktop) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Stats stacked */}
        <div className="flex flex-col gap-6 lg:w-1/3">
          {/* Hours logged */}
          <div className="bg-white shadow-lg rounded-2xl p-12">
            <h2 className="text-lg font-semibold text-gray-700">
              Hours logged by team
            </h2>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {stats.hoursLogged}
            </p>
          </div>
          {/* Billable utilization */}
          <div className="bg-white shadow-lg rounded-2xl p-12">
            <h2 className="text-lg font-semibold text-gray-700">
              Billable utilization %
            </h2>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.billableUtilization}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{ width: `${stats.billableUtilization}%` }}
              ></div>
            </div>
          </div>
        </div>
        {/* Right: Productivity Trend */}
        <div className="bg-white shadow-lg rounded-2xl p-5 flex-1">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Weekly Productivity Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#b0b6c1" />
              <YAxis stroke="#b0b6c1" />
              <Tooltip 
                contentStyle={{ background: "#23272f", border: "none", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#38bdf8" }}/>
              <Legend />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#4F46E5"
                strokeWidth={3}
                
              />
              <Line
                type="monotone"
                dataKey="utilization"
                stroke="#16A34A"
                strokeWidth={3}
                
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Missing Timesheets */}
      {/* <div className="bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Missing Timesheets
          </h2>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow">
            Remind
          </button>
        </div>
        <ul className="list-disc list-inside text-gray-600">
          {stats.missingTimesheets.map((user, idx) => (
            <li key={idx}>{user}</li>
          ))}
        </ul>
      </div> */}

      {/* Pending Approvals with total entries */}
      {/* <div className="bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 inline-block">
              Pending Approvals
            </h2>
            <span className="ml-3 text-sm text-gray-500">
              ({numPendingEntries} timesheet entries)
            </span>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">
            View & Approve
          </button>
        </div>
        <ul className="list-disc list-inside text-gray-600">
          {stats.pendingApprovals.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div> */}
    </div>
  );
};

export default ManagerDashboard;
