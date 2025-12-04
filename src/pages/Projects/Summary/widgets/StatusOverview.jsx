"use client";
import React, { useEffect, useState } from "react";
import { Card, Typography } from "antd";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const { Title, Text } = Typography;

const COLORS = [
  "#4f46e5",
  "#7c3aed",
  "#0d9488",
  "#db2777",
  "#ea580c",
  "#2563eb",
  "#65a30d",
  "#be185d",
];

export default function StatusOverview({ workItems = [], statuses = [] }) {
  const [chart, setChart] = useState([]);

  useEffect(() => {
    const map = new Map(statuses.map((s) => [s.id, { ...s, count: 0 }]));
    workItems.forEach((w) => {
      if (map.has(w.status?.id)) map.get(w.status.id).count++;
    });

    const arr = Array.from(map.values()).map((s, i) => ({
      name: s.name,
      value: s.count,
      fill: COLORS[i % COLORS.length],
    }));

    setChart(arr);
  }, [workItems, statuses]);

  return (
    <Card>
      <Title level={4}>Status Overview</Title>

      <div style={{ height: 220 }} className="mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chart} dataKey="value" innerRadius={45} outerRadius={75}>
              {chart.map((s, i) => (
                <Cell key={i} fill={s.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
