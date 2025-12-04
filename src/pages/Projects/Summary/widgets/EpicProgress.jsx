// Summary/widgets/EpicProgress.jsx
"use client";
import React, { useMemo } from "react";
import { Card, Typography } from "antd";

const { Title } = Typography;

let FixedSizeList = null;
try {
  // optional dependency - react-window
  // if not installed, code will fallback to non-virtualized rendering
  // install: npm i react-window
  // eslint-disable-next-line
  FixedSizeList = require("react-window").FixedSizeList;
} catch (e) {
  FixedSizeList = null;
}

function EpicProgressInner({ epics = [], stories = [], tasks = [], bugs = [], statuses = [] }) {
  const all = useMemo(() => [...(stories || []), ...(tasks || []), ...(bugs || [])], [stories, tasks, bugs]);

  const sortedStatuses = useMemo(() => (statuses || []).slice().sort((a,b) => (a.sortOrder||0) - (b.sortOrder||0)), [statuses]);

  const rows = useMemo(() => {
    return (epics || []).map(e => {
      const children = all.filter(c => c.epicId === e.id || (c.epic && c.epic.id === e.id));
      const total = children.length;
      const dist = sortedStatuses.map((s, i) => {
        const count = children.filter(c => c.status?.id === s.id).length;
        return { id: s.id, name: s.name, percent: total ? (count/total)*100 : 0, color: ["#4f46e5","#7c3aed","#0d9488","#ea580c"][i % 4] };
      });
      return { ...e, total, dist };
    }).filter(r => r.total > 0);
  }, [epics, all, sortedStatuses]);

  if (!rows.length) return null;

  const Row = ({ index, style }) => {
    const r = rows[index];
    return (
      <div style={style} className="p-2" key={r.id}>
        <div className="flex items-center justify-between mb-1">
          <strong>{r.key || `EPIC-${r.id}`}</strong>
          <span className="text-sm text-gray-500">{r.total}</span>
        </div>
        <div className="h-6 w-full rounded overflow-hidden flex">
          {r.dist.map(s => <div key={s.id} style={{ width: `${s.percent}%`, background: s.color }} className="flex items-center justify-center text-white text-xs">{s.percent > 10 ? `${Math.round(s.percent)}%` : ""}</div>)}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <Title level={4}>Epic progress</Title>
      <div className="mt-3">
        {FixedSizeList ? (
          <FixedSizeList height={360} itemCount={rows.length} itemSize={72} width="100%">
            {Row}
          </FixedSizeList>
        ) : (
          <div className="space-y-3">
            {rows.map(r => (
              <div key={r.id}>
                <div className="flex items-center justify-between mb-1">
                  <strong>{r.key || `EPIC-${r.id}`}</strong>
                  <span className="text-sm text-gray-500">{r.total}</span>
                </div>
                <div className="h-6 w-full rounded overflow-hidden flex mb-2">
                  {r.dist.map(s => <div key={s.id} style={{ width: `${s.percent}%`, background: s.color }} className="flex items-center justify-center text-white text-xs">{s.percent > 10 ? `${Math.round(s.percent)}%` : ""}</div>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default React.memo(EpicProgressInner);
