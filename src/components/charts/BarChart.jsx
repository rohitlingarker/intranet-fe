import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

// Sample Data
const data = [
  { name: 'Jan', uv: 400 },
  { name: 'Feb', uv: 300 },
  { name: 'Mar', uv: 500 },
  { name: 'Apr', uv: 200 },
];

function App() {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="uv" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;


/**
 * TO TAKE THE DATA FROM BACKEND AND DISPLAY IN BAR CHART
 * 
 * import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

function App() {
  const [data, setData] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    fetch('https://your-backend-api.com/chart-data')  // Replace with your backend URL
      .then((response) => response.json())
      .then((json) => {
        setData(json);  // Backend should return an array of { name, uv } objects
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="uv" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;

 * 
 */