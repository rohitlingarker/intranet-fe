import React, { useState } from "react";

const mockExecutionData = [
{
day: "Day 1 Execution",
date: "Mar 5",
executed: 40,
total: 50,
status: "Completed",
color: "green",
},
{
day: "Day 2 Execution",
date: "Mar 6",
executed: 10,
total: 50,
status: "InProgress",
color: "blue",
},
];

export default function TestExecutionPage() {
const [selectedSprint, setSelectedSprint] = useState("Sprint 10 Regression (Sprint 10)");

const getStatusBadge = (status, color) => {
const bgColor = color === "green" ? "bg-green-100" : "bg-blue-100";
const textColor = color === "green" ? "text-green-800" : "text-blue-800";
return (
<span className={`${bgColor} ${textColor} text-xs px-2 py-0.5 rounded-full`}>
{status} </span>
);
};

return ( <div className="p-6 bg-gray-50 min-h-screen"> <div className="flex justify-between items-center mb-6"> <h1 className="text-xl font-bold">Test Execution</h1> <div className="flex items-center gap-4">
<select
className="border rounded px-3 py-1 focus:outline-none"
value={selectedSprint}
onChange={(e) => setSelectedSprint(e.target.value)}
> <option>Sprint 10 Regression (Sprint 10)</option> <option>Sprint 9 Regression (Sprint 9)</option> <option>Sprint 8 Regression (Sprint 8)</option> </select> <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
+ New Run </button> </div> </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {mockExecutionData.map((item, index) => {
      const progress = Math.round((item.executed / item.total) * 100);
      return (
        <div key={index} className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">{item.day}</h2>
            {getStatusBadge(item.status, item.color)}
          </div>
          <p className="text-sm text-gray-500 mb-2">{item.date}</p>
          <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
            <div
              className={`h-2 rounded-full ${
                item.color === "green" ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {item.executed} / {item.total} Executed
            </span>
            <span>{progress}%</span>
          </div>
        </div>
      );
    })}
  </div>
</div>

);
}
