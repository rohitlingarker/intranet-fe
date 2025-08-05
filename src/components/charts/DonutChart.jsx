import React from "react";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";



// 🎯 Mock Data for Donut Chart
const data = [
  { name: "Engineering", value: 45 },
  { name: "Marketing", value: 25 },
  { name: "HR", value: 15 },
  { name: "Finance", value: 15 }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function App() {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            innerRadius={60} // 🎯 This makes it a "donut"
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/*
    * To fetch data from the backend and display in Donut Chart
    * 
    * import React, { useState, useEffect } from "react";
    * import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
    *
    * function App() {
    *   const [data, setData] = useState([]);
    *
    *   useEffect(() => {
    *     fetch("https://your-backend-api.com/donut-data") // Replace with your backend URL
    *       .then((response) => response.json())
    *       .then((json) => setData(json));
    *   }, []);
    *
    *   return (
    *     <div style={{ width: "100%", height: 400 }}>
    *       <ResponsiveContainer>
    *         <PieChart>
    *           <Pie
    *             data={data}
    *             dataKey="value"
    *             nameKey="name"
    *             outerRadius={100}
    *             innerRadius={60}
    *             fill="#8884d8"
    *             label
    *           >
    *             {data.map((entry, index) => (
    *               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    *             ))}
    *           </Pie>
    *           <Tooltip />
    *         </PieChart>
    *       </ResponsiveContainer>
    *     </div>
    *   );
    * }
    *
    * export default App;
*/