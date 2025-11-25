"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const Timeline = ({ projectId }) => {
  const [sprints, setSprints] = useState([]);
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);

  const today = dayjs();
  const startTimeline = today.subtract(1, "month").startOf("month");
  const endTimeline = today.add(3, "month").endOf("month");

  // Build day list for header
  const days = [];
  let cursor = startTimeline;
  while (cursor.isBefore(endTimeline)) {
    days.push(cursor);
    cursor = cursor.add(1, "day");
  }

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      const [sprintRes, epicRes, storyRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`, authHeaders),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`, authHeaders),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`, authHeaders)
      ]);

      setSprints(sprintRes.data.data ?? []);
      setEpics(epicRes.data.data ?? []);
      setStories(storyRes.data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  // ---------------- TIMELINE CELL WIDTH (≈500px per month) ----------------
  const cellWidth = 16; // 16px per day → 480px per month approx.

  const fallbackStart = (d) => (d ? dayjs(d) : today);
  const fallbackEnd = (item) =>
    item.endDate || item.dueDate
      ? dayjs(item.endDate || item.dueDate)
      : fallbackStart(item.startDate).add(7, "day");

  const calcX = (d) => dayjs(d).diff(startTimeline, "day") * cellWidth;
  const calcW = (s, e) => Math.max(dayjs(e).diff(s, "day") * cellWidth, cellWidth);

  const Bar = ({ item, label, color }) => {
    const start = fallbackStart(item.startDate);
    const end = fallbackEnd(item);

    return (
      <div
        className="absolute rounded-md text-[12px] text-white px-3 flex items-center font-semibold shadow-md"
        style={{
          left: calcX(start),
          width: calcW(start, end),
          height: 32,
          background: color,
        }}
      >
        {label}
      </div>
    );
  };

  const Row = ({ title, color, items, labelKey }) => (
    <div className="relative h-[95px] border-b flex items-center gap-3">
      {/* Left title */}
      <div className="w-[220px] font-semibold text-gray-800 text-sm">
        {title}
      </div>

      {/* Bars container */}
      <div className="relative flex-1 overflow-visible h-full">
        {items.map((item, idx) => (
          <Bar
            key={idx}
            item={item}
            color={color}
            label={item[labelKey] || item.name}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full overflow-auto bg-gray-50 rounded-md p-5 border shadow-lg">
      
      {/* MONTH HEADER */}
      <div className="flex sticky top-0 bg-gray-50 z-40 pb-1 ml-[220px]">
        {days.map((d, i) =>
          d.date() === 1 ? (
            <div
              key={i}
              style={{ width: cellWidth }}
              className="text-xs font-semibold text-gray-800"
            >
              {d.format("MMM YYYY")}
            </div>
          ) : (
            <div key={i} style={{ width: cellWidth }} />
          )
        )}
      </div>

      {/* DAY HEADER */}
      <div className="flex sticky top-6 bg-gray-50 z-30 border-y py-1 ml-[220px]">
        {days.map((d, i) => (
          <div
            key={i}
            style={{ width: cellWidth }}
            className="text-[10px] text-gray-500 text-center"
          >
            {d.date()}
          </div>
        ))}
      </div>

      {/* ROWS */}
      <Row title="Sprints" items={sprints} color="#0EA5E9" labelKey="name" />
      <Row title="Epics" items={epics} color="#A855F7" labelKey="name" />
      <Row title="Stories" items={stories} color="#10B981" labelKey="title" />
    </div>
  );
};

export default Timeline;
