"use client";
import React from "react";
import { Card, Typography } from "antd";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const { Title, Text } = Typography;

export default function ScopeAndProgress({
  epics = [],
  stories = [],
  tasks = [],
  bugs = [],
  statuses = [],
}) {
  const all = [...stories, ...tasks, ...bugs];
  const total = all.length;

  const doneStatus = statuses.length
    ? statuses.reduce((a, b) => (a.sortOrder > b.sortOrder ? a : b))
    : null;

  const doneCount = all.filter((w) =>
    doneStatus ? w.status?.id === doneStatus.id : false
  ).length;

  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  const data = [
    { name: "Completed", value: percent },
    { name: "Remaining", value: 100 - percent },
  ];

  return (
    <Card>
      <Title level={4}>Scope & Progress</Title>

      <div className="flex items-center justify-between mt-3">
        <div>
          <Text type="secondary">Total Work Items</Text>
          <Title level={4}>{total}</Title>
        </div>

        <div style={{ width: 130, height: 130 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={40} outerRadius={55}>
                <Cell fill="#4f46e5" />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Text className="mt-2 block">{percent}% Completed</Text>
    </Card>
  );
}
