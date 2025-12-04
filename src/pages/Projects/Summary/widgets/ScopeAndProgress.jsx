// Summary/widgets/ScopeAndProgress.jsx
"use client";
import React, { useMemo } from "react";
import { Card, Typography } from "antd";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const { Title, Text } = Typography;

function ScopeAndProgressInner({ epics = [], stories = [], tasks = [], bugs = [], statuses = [] }) {
  const all = useMemo(() => [...(stories || []), ...(tasks || []), ...(bugs || [])], [stories, tasks, bugs]);
  const total = all.length;

  const doneStatus = useMemo(() => {
    if (!statuses || statuses.length === 0) return null;
    return statuses.reduce((a, b) => (a.sortOrder > b.sortOrder ? a : b), statuses[0]);
  }, [statuses]);

  const doneCount = useMemo(() => {
    if (!doneStatus) return 0;
    return all.filter(it => it.status?.id === doneStatus.id).length;
  }, [all, doneStatus]);

  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const data = useMemo(() => [{ name: "Completed", value: percent }, { name: "Remaining", value: 100 - percent }], [percent]);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <Title level={4}>Scope & Progress</Title>
          <Text type="secondary">Overview of epics, stories, tasks and bugs</Text>
        </div>
        <div style={{ width: 120, height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={40} outerRadius={55} startAngle={90} endAngle={450}>
                <Cell fill="#4f46e5" />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-3">
        <Title level={4}>{percent}%</Title>
        <Text type="secondary">{doneCount} / {total} completed</Text>
      </div>
    </Card>
  );
}

export default React.memo(ScopeAndProgressInner);
