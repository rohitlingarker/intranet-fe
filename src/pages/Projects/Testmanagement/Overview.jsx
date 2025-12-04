"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Overview() {
  const executionData = [
    { name: "Pass", value: 45, color: "#22c55e" },
    { name: "Fail", value: 12, color: "#ef4444" },
    { name: "Block", value: 5, color: "#f59e0b" },
    { name: "Pending", value: 38, color: "#94a3b8" },
  ];

  const defectData = [
    { day: "Day 1", pass: 2, fail: 6 },
    { day: "Day 2", pass: 4, fail: 7 },
    { day: "Day 3", pass: 5, fail: 10 },
    { day: "Day 4", pass: 20, fail: 12 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-4 gap-6">
        {/* Story Coverage */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm font-medium text-gray-500">STORY COVERAGE</p>
          <p className="text-3xl font-bold mt-2">78%</p>
          <p className="text-xs text-gray-400">Target: 85% by Friday</p>
        </div>

        {/* Execution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm font-medium text-gray-500">EXECUTION</p>
          <p className="text-3xl font-bold mt-2">45%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div className="bg-blue-500 h-2 w-[45%] rounded-full"></div>
          </div>
        </div>

        {/* Active Defects */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm font-medium text-gray-500">ACTIVE DEFECTS</p>
          <p className="text-3xl font-bold mt-2">12</p>
          <p className="text-xs text-red-500">+2 from yesterday</p>
        </div>

        {/* Critical Risk */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm font-medium text-gray-500">CRITICAL RISK</p>
          <p className="text-3xl font-bold mt-2">2</p>
          <p className="text-xs text-gray-400">US-103, US-108</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Execution Progress */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-lg font-semibold mb-4">Execution Progress</p>

          <div className="flex gap-6 items-center">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={executionData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {executionData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-sm">
              {executionData.map((item, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: item.color }}
                  ></span>
                  <p>
                    {item.name} – <span className="font-semibold">{item.value}%</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Defect Status Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-lg font-semibold mb-4">Defect Status Trend</p>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={defectData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="fail" fill="#ef4444" />
              <Bar dataKey="pass" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
