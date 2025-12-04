"use client";
import React, { useEffect, useState } from "react";
import { Card, Typography } from "antd";

const { Title } = Typography;

export default function EpicProgress({ epics = [], stories = [], tasks = [], bugs = [], statuses = [] }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const all = [...stories, ...tasks, ...bugs];
    const sortedStatuses = statuses.sort((a, b) => a.sortOrder - b.sortOrder);

    const result = epics.map((e) => {
      const children = all.filter(
        (c) => c.epicId === e.id || c.epic?.id === e.id
      );

      const total = children.length;
      const dist = sortedStatuses.map((s, i) => {
        const count = children.filter((c) => c.status?.id === s.id).length;
        return {
          id: s.id,
          name: s.name,
          percent: total ? (count / total) * 100 : 0,
          color: ["#4f46e5", "#7c3aed", "#0d9488", "#ea580c"][i % 4],
        };
      });

      return { ...e, total, dist };
    });

    setRows(result.filter((r) => r.total > 0));
  }, [epics, stories, tasks, bugs, statuses]);

  return (
    <Card>
      <Title level={4}>Epic Progress</Title>

      <div className="space-y-4 mt-4">
        {rows.map((r) => (
          <div key={r.id}>
            <strong>{r.key || `EPIC-${r.id}`}</strong> — {r.name}

            <div className="h-5 w-full mt-2 rounded overflow-hidden flex">
              {r.dist.map((s) => (
                <div
                  key={s.id}
                  style={{
                    width: `${s.percent}%`,
                    background: s.color,
                  }}
                  className="flex items-center justify-center text-white text-xs"
                >
                  {s.percent > 10 ? `${Math.round(s.percent)}%` : ""}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
