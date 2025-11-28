import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const overviewData = {
  storyCoverage: 78,
  execution: 45,
  activeDefects: 12,
  criticalRisk: 2,
  executionProgress: [
    { name: "Pass", value: 45 },
    
    { name: "Fail", value: 12 },
    { name: "Block", value: 5 },
    { name: "Pending", value: 38 },
  ],
  defectTrend: [
    { day: "Day 1", pass: 1, fail: 5 },
    { day: "Day 2", pass: 3, fail: 7 },
    { day: "Day 3", pass: 7, fail: 12 },
    { day: "Day 4", pass: 24, fail: 10 },
  ],
};

const COLORS = ["#00C49F", "#FF4C4C", "#FFBB28", "#8884d8"];

export default function Overview() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Test Management Overview</h2>

      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">STORY COVERAGE</p>
          <p className="text-2xl font-bold">{overviewData.storyCoverage}%</p>
          <p className="text-xs text-gray-400">Target: 85% by Friday</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">EXECUTION</p>
          <p className="text-2xl font-bold">{overviewData.execution}%</p>
          <div className="w-full bg-gray-200 h-2 rounded mt-2">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${overviewData.execution}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">ACTIVE DEFECTS</p>
          <p className="text-2xl font-bold">{overviewData.activeDefects}</p>
          <p className="text-xs text-red-500">+2 from yesterday</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">CRITICAL RISK</p>
          <p className="text-2xl font-bold">{overviewData.criticalRisk}</p>
          <p className="text-xs text-gray-400">US-103, US-108</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="font-bold mb-2">Execution Progress</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={overviewData.executionProgress}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {overviewData.executionProgress.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="font-bold mb-2">Defect Status Trend</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={overviewData.defectTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pass" fill="#00C49F" />
              <Bar dataKey="fail" fill="#FF4C4C" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
