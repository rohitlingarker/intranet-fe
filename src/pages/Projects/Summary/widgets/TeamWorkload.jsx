// Summary/widgets/TeamWorkload.jsx
"use client";
import React, { useMemo } from "react";
import { Card, Typography, Avatar } from "antd";
import DistributionBar from "./DistributionBar";

const { Title } = Typography;

function TeamWorkloadInner({ workItems = [], users = [] }) {
  const total = (workItems || []).length;

  const rows = useMemo(() => {
    const map = new Map((users || []).map(u => [u.id, { ...u, count: 0 }]));
    const unassigned = { id: null, name: "Unassigned", count: 0 };
    (workItems || []).forEach(w => {
      const uid = w.assigneeId || w.assignee?.id;
      if (uid && map.has(uid)) map.get(uid).count++;
      else unassigned.count++;
    });
    const arr = [...map.values()].filter(u => u.count > 0);
    if (unassigned.count > 0) arr.unshift(unassigned);
    return arr.map((r, i) => ({ ...r, percentage: total ? (r.count/total)*100 : 0, color: ["#4f46e5","#7c3aed","#db2777","#0d9488","#ea580c"][i % 5] }));
  }, [workItems, users, total]);

  if (!rows.length) return null;

  return (
    <Card>
      <Title level={4}>Team workload</Title>
      <div className="mt-3 space-y-3">
        {rows.map(r => (
          <div key={r.name || r.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar style={{ backgroundColor: r.color, marginRight: 12 }}>{r.name ? (r.name.split(" ").map(n => n[0]).join("").toUpperCase()) : "U"}</Avatar>
              <div>{r.name}</div>
            </div>
            <div style={{ flex: 1, marginLeft: 12 }}><DistributionBar percentage={r.percentage} /></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default React.memo(TeamWorkloadInner);
