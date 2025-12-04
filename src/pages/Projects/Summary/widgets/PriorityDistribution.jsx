"use client";
import React, { useMemo } from "react";
import { Card, Typography } from "antd";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const { Title } = Typography;

export default function PriorityDistribution({ tasks = [], stories = [], bugs = [] }) {
  const data = useMemo(() => {
    const groups = ["LOW", "MEDIUM", "HIGH", "CRITICAL", "UNSPECIFIED"];
    const map = new Map(groups.map((p) => [p, { priority: p, Tasks: 0, Stories: 0, Bugs: 0 }]));

    [...tasks, ...stories, ...bugs].forEach((w) => {
      const p = w.priority?.toUpperCase() || "UNSPECIFIED";
      if (map.has(p)) {
        map.get(p)[w.type || (tasks.includes(w) ? "Tasks" : stories.includes(w) ? "Stories" : "Bugs")] += 1;
      }
    });

    return Array.from(map.values()).filter((r) => r.Tasks || r.Stories || r.Bugs);
  }, [tasks, stories, bugs]);

  return (
    <Card>
      <Title level={4}>Priority Distribution</Title>

      <div style={{ height: 260 }} className="mt-4">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="priority" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Tasks" fill="#4f46e5" />
            <Bar dataKey="Stories" fill="#7c3aed" />
            <Bar dataKey="Bugs" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
