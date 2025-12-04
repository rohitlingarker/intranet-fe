"use client";
import React from "react";
import { Card, Typography } from "antd";
import DistributionBar from "./DistributionBar";

const { Title } = Typography;

export default function TypesOfWork({ tasks = [], stories = [], epics = [], bugs = [] }) {
  const rows = [
    { name: "Tasks", count: tasks.length },
    { name: "Stories", count: stories.length },
    { name: "Epics", count: epics.length },
    { name: "Bugs", count: bugs.length },
  ];

  const total = rows.reduce((a, b) => a + b.count, 0);

  return (
    <Card>
      <Title level={4}>Types of Work</Title>

      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center justify-between">
            <span>{r.name} ({r.count})</span>
            <div className="w-2/3">
              <DistributionBar percentage={(r.count / total) * 100} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
