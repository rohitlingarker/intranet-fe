"use client";
import React, { useEffect, useState } from "react";
import { Card, Typography, Avatar } from "antd";
import DistributionBar from "./DistributionBar";

const { Title } = Typography;

export default function TeamWorkload({ workItems = [], users = [] }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const total = workItems.length;

    const map = new Map(users.map((u) => [u.id, { ...u, count: 0 }]));
    const unassigned = { id: null, name: "Unassigned", count: 0 };

    workItems.forEach((w) => {
      const uid = w.assignee?.id || w.assigneeId;
      if (map.has(uid)) map.get(uid).count++;
      else unassigned.count++;
    });

    const arr = [...Array.from(map.values())];
    if (unassigned.count > 0) arr.unshift(unassigned);

    setRows(
      arr.map((r, i) => ({
        ...r,
        percentage: total ? (r.count / total) * 100 : 0,
        color: ["#4f46e5", "#7c3aed", "#db2777", "#0d9488", "#ea580c"][i % 5],
      }))
    );
  }, [workItems, users]);

  return (
    <Card>
      <Title level={4}>Team Workload</Title>

      <div className="mt-4 space-y-4">
        {rows.map((r) => (
          <div className="flex items-center justify-between" key={r.name}>
            <div className="flex items-center space-x-2">
              <Avatar style={{ background: r.color }}>
                {r.name?.[0] || "?"}
              </Avatar>
              <span>{r.name}</span>
            </div>

            <div className="w-2/3">
              <DistributionBar percentage={r.percentage} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
