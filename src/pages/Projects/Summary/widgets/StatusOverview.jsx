// Summary/widgets/StatusOverview.jsx
"use client";
import React, { useMemo } from "react";
import { Card, Typography } from "antd";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const { Title, Text } = Typography;
const COLORS = ["#4f46e5","#7c3aed","#0d9488","#db2777","#ea580c","#2563eb","#be185d","#65a30d"];

function StatusOverviewInner({ workItems = [], statuses = [] }) {
  const chartData = useMemo(() => {
    if (!statuses || statuses.length === 0) return [];
    const map = new Map(statuses.map(s => [s.id, { ...s, count: 0 }]));
    workItems.forEach(w => {
      if (w.status && map.has(w.status.id)) map.get(w.status.id).count++;
    });
    return Array.from(map.values()).map((s, i) => ({ name: s.name, value: s.count, color: COLORS[i % COLORS.length] }));
  }, [workItems, statuses]);

  if (!chartData.length) return null;

  return (
    <Card>
      <Title level={4}>Status overview</Title>
      <Text type="secondary">Snapshot of workflow statuses</Text>
      <div style={{ height: 200 }} className="mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" innerRadius={50} outerRadius={80}>
              {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default React.memo(StatusOverviewInner);
