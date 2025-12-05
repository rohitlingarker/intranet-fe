// Summary/widgets/TypesOfWork.jsx
"use client";
import React, { useMemo } from "react";
import { Card, Typography } from "antd";
import DistributionBar from "./DistributionBar";

const { Title } = Typography;

function TypesOfWorkInner({ tasks = [], stories = [], epics = [], bugs = [] }) {
  const rows = useMemo(() => ([
    { name: "Tasks", count: (tasks || []).length },
    { name: "Stories", count: (stories || []).length },
    { name: "Epics", count: (epics || []).length },
    { name: "Bugs", count: (bugs || []).length },
  ]), [tasks, stories, epics, bugs]);

  const total = useMemo(() => rows.reduce((a, b) => a + b.count, 0), [rows]);

  if (!total) return null;

  return (
    <Card>
      <Title level={4}>Types of Work</Title>
      <div className="mt-4 space-y-3">
        {rows.map(r => (
          <div key={r.name} className="flex items-center justify-between">
            <span>{r.name} ({r.count})</span>
            <div className="w-2/3">
              <DistributionBar percentage={(r.count/total)*100} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default React.memo(TypesOfWorkInner);
