// Summary/widgets/PriorityDistribution.jsx
"use client";
import React, { useMemo } from "react";
import { Card, Typography } from "antd";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const { Title } = Typography;

function PriorityDistributionInner({ tasks = [], stories = [], bugs = [] }) {
  const data = useMemo(() => {
    const priorities = ["LOW","MEDIUM","HIGH","CRITICAL","UNSPECIFIED"];
    const map = new Map(priorities.map(p => [p, { priority: p, Tasks: 0, Stories: 0, Bugs: 0 }]));
    const all = [
      ...(tasks || []).map(t => ({ ...t, _type: "Tasks" })),
      ...(stories || []).map(s => ({ ...s, _type: "Stories" })),
      ...(bugs || []).map(b => ({ ...b, _type: "Bugs" })),
    ];
    all.forEach(item => {
      const p = (item.priority || "UNSPECIFIED").toString().toUpperCase();
      if (!map.has(p)) return;
      map.get(p)[item._type] = (map.get(p)[item._type] || 0) + 1;
    });
    return Array.from(map.values()).filter(r => r.Tasks || r.Stories || r.Bugs);
  }, [tasks, stories, bugs]);

  if (!data.length) return null;

  return (
    <Card>
      <Title level={4}>Priority Distribution</Title>
      <div style={{ height: 260 }} className="mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 10, left: 8, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="priority" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Tasks" fill="#4f46e5" radius={[6,6,0,0]} />
            <Bar dataKey="Stories" fill="#7c3aed" radius={[6,6,0,0]} />
            <Bar dataKey="Bugs" fill="#06b6d4" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default React.memo(PriorityDistributionInner);
