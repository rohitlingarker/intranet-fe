import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { getManagerDashboardData } from "../Timesheet/api";

const ManagerDashboard = ({setStatusFilter,handleScroll}) => {
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map server weekday names to short labels
  const dayMap = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  };

  useEffect(() => {
    // You can pass dynamic dates here if needed
    const startDate = "2025-10-01";
    const endDate = "2025-10-09";

    getManagerDashboardData(startDate, endDate)
      .then((data) => {
        setStats({
          hoursLogged: data.totalHours,
          billableUtilization: data.billablePercentage,
          missingTimesheets: data.missingTimesheets || [],
          pending: data.pending,
        });

        // Format weekly summary
        const summary = data.weeklySummary || {};
        const formattedWeekly = Object.entries(summary).map(([day, hours]) => {
          return {
            day: dayMap[day] || day, // convert MONDAY -> Mon etc.
            hours: hours,
            utilization: data.billablePercentage, // keep same % for reference
          };
        });

        setWeeklyData(formattedWeekly);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading manager dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Top Section: Stats then chart */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Stats */}
        <div className="flex flex-col gap-6 lg:w-1/3">
          {/* Hours logged */}
          <div className="bg-white shadow-lg rounded-2xl p-12">
            <h2 className="text-lg font-semibold text-gray-700">
              Hours logged by team
            </h2>
            <p className="text-2xl font-bold text-indigo-600 mt-2">
              {stats.hoursLogged} hrs
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
            Weekly hours logged by team
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={weeklyData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            > 
              <XAxis dataKey="day" stroke="#b0b6c1" />
              <YAxis stroke="#b0b6c1" />
              <Tooltip
                contentStyle={{ background: "#23272f", border: "none", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#38bdf8" }}
              />
              <Legend />
              <Line type="monotone" dataKey="hours" stroke="#4F46E5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section: Missing Timesheets + Pending Approvals side by side
       <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Missing Timesheets */}
      <div className="bg-white shadow-lg rounded-2xl p-8 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Yesterday Missing Timesheets
          </h2>
          <button className="bg-orange-400 hover:bg-orange-400 text-white px-4 py-2 rounded-lg shadow">
            Remind
          </button>          
        </div>
        {stats.missingTimesheets.length > 0 ? (
          <ul className="list-disc list-inside text-gray-600 overflow-y-scroll max-h-30">
            {stats.missingTimesheets.map((user, idx) => (
              <li key={idx}>
                <span title={user.email} className="font-medium">{user.fullName} - {user.email}</span>
                {/* <span className="text-sm text-gray-500">({user.email})</span> */}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No missing timesheets today 🎉</p>
        )}
      </div>
  {/* Right: Pending Approvals */}
   <div className="bg-white shadow-lg items-center rounded-2xl p-8 flex-1"> 
    <div className="flex justify-between items-center mb-4 ">
      <h2 className="text-lg font-semibold text-gray-700 ">
        Pending Approvals
      </h2>
      <button 
       onClick={()=>{
        setStatusFilter("Pending")
        handleScroll()
      }}


      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">
        View
      </button>
    </div>
    <span >
      <p className=" justify-center text-2xl font-bold text-blue-800 mt-4">
              {stats.pending}  Entries
            </p>
      </span>
    </div>
      {/* Missing Timesheets */}
      {/* <div className="bg-white shadow-lg rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Today Missing Timesheets
          </h2>
        </div>
        {stats.missingTimesheets.length > 0 ? (
          <ul className="list-disc list-inside text-gray-600">
            {stats.missingTimesheets.map((user, idx) => (
              <li key={idx}>
                <span className="font-medium">{user.fullName}</span>{" "}
                <span className="text-sm text-gray-500">({user.email})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No missing timesheets today 🎉</p>
        )}
      </div> */}

      {/* Pending Approvals */}
      {/* <div className="bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 inline-block">
              Pending Approvals
            </h2>
            <span className="ml-3 text-sm text-gray-500">
              ({stats.pending} timesheet entries)
            </span>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">
            View & Approve
          </button>
        </div>
      </div> */}
    </div>
    
  );
};

export default ManagerDashboard;
