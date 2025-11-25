"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";

const Timeline = ({ projectId }) => {
  const [sprints, setSprints] = useState([]);
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);
  const [expandedSprints, setExpandedSprints] = useState(new Set());
  const [expandedEpics, setExpandedEpics] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const headerRef = useRef(null);

  const today = dayjs();
  const startTimeline = today.subtract(1, "month").startOf("month");
  const endTimeline = today.add(3, "month").endOf("month");

  const days = [];
  let cursor = startTimeline;
  while (cursor.isBefore(endTimeline)) {
    days.push(cursor);
    cursor = cursor.add(1, "day");
  }

  const fetchData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      const [sprintRes, epicRes, storyRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`, authHeaders),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`, authHeaders),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`, authHeaders),
      ]);

      setSprints(Array.isArray(sprintRes.data) ? sprintRes.data : sprintRes.data?.data || []);
      setEpics(Array.isArray(epicRes.data) ? epicRes.data : epicRes.data?.data || []);
      setStories(Array.isArray(storyRes.data) ? storyRes.data : storyRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching timeline data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const cellWidth = 40;
  const stickyWidth = 420;

  const fallbackStart = (item) => {
    const date = item?.startDate || item?.start_date;
    return date ? dayjs(date) : today;
  };

  const fallbackEnd = (item) => {
    const date = item?.endDate || item?.end_date || item?.dueDate || item?.due_date;
    return date ? dayjs(date) : fallbackStart(item).add(7, "day");
  };

  const calcX = (d) => dayjs(d).diff(startTimeline, "day") * cellWidth;
  const calcW = (s, e) => Math.max(dayjs(e).diff(s, "day") * cellWidth, cellWidth);

  const monthGroups = [];
  let currentMonth = null;
  let monthStart = 0;
  days.forEach((d, i) => {
    const monthKey = d.format("MMM YYYY");
    if (monthKey !== currentMonth) {
      if (currentMonth) {
        monthGroups[monthGroups.length - 1].daysInMonth = i - monthStart;
      }
      monthGroups.push({
        month: d.format("MMM"),
        year: d.format("YYYY"),
        startIndex: i,
        daysInMonth: 0,
      });
      currentMonth = monthKey;
      monthStart = i;
    }
  });
  if (monthGroups.length > 0) {
    monthGroups[monthGroups.length - 1].daysInMonth = days.length - monthStart;
  }

  const toggleExpand = (id, type) => {
    if (type === "sprint") {
      setExpandedSprints((prev) => {
        const newSet = new Set(prev);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        return newSet;
      });
    } else if (type === "epic") {
      setExpandedEpics((prev) => {
        const newSet = new Set(prev);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        return newSet;
      });
    }
  };

  const Bar = ({ item, label, color, showDate = false }) => {
    const start = fallbackStart(item);
    const end = fallbackEnd(item);
    const displayLabel =
      label && typeof label === "object" ? label.name || "" : label || "";

    return (
      <div className="relative" style={{ height: 40, marginBottom: 8 }}>
        {showDate && (
          <div
            className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-md z-20"
            style={{ left: stickyWidth + calcX(start) - 80, top: 0 }}
          >
            {start.format("MMM D, YYYY")}
          </div>
        )}
        <div
          className="absolute rounded text-sm text-white px-3 flex items-center font-medium shadow cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            left: stickyWidth + calcX(start),
            width: calcW(start, end),
            height: 32,
            top: showDate ? 0 : 4,
            background: color,
            zIndex: 10,
          }}
          title={`${displayLabel} (${start.format("MMM D")} - ${end.format("MMM D")})`}
        >
          <span className="truncate">{displayLabel}</span>
        </div>
      </div>
    );
  };

  const ItemRow = ({
    item,
    color,
    labelKey,
    icon,
    indent = 0,
    showCheckbox = true,
    expandable = false,
    isExpanded = false,
    onToggle,
    showDate = false,
    status = null,
    actions = false,
  }) => {
    const labelValue =
      (item && labelKey && item[labelKey] !== undefined ? item[labelKey] : null) ||
      item?.name ||
      item?.title;
    const displayLabel =
      labelValue && typeof labelValue === "object" ? labelValue.name || "" : labelValue || "";

    const displayStatus =
      status && typeof status === "object" ? status.name || "" : status || "";

    return (
      <div className="flex items-start border-b hover:bg-gray-50">
        <div
          className="sticky left-0 bg-white z-20 flex items-center gap-2 py-3 border-r"
          style={{ width: stickyWidth, paddingLeft: 16 + indent * 24 }}
        >
          {showCheckbox && <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />}
          {expandable ? (
            <button
              onClick={onToggle}
              className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-gray-600"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          ) : (
            <div className="w-5"></div>
          )}
          {icon && <span className="text-lg">{icon}</span>}
          <span className="text-sm text-gray-800 font-medium truncate flex-1">{displayLabel}</span>
          {displayStatus && (
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${
                displayStatus === "DONE"
                  ? "bg-green-100 text-green-800"
                  : displayStatus === "IN PROGRESS"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {displayStatus}
            </span>
          )}
          {actions && (
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded text-gray-600">
                +
              </button>
              <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded text-gray-600">
                •••
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 relative min-w-[2000px]">
          <Bar item={item} color={color} label={displayLabel} showDate={showDate} />
        </div>
      </div>
    );
  };

  const StoryRow = ({ story, indent = 0 }) => (
    <ItemRow item={story} color="#10B981" labelKey="title" icon="📋" indent={indent} showCheckbox={true} status={story?.status} />
  );

  const EpicRow = ({ epic, sprintId = null, indent = 0 }) => {
    const epicId = epic?.id || epic?._id;
    const isExpanded = expandedEpics.has(epicId);

    const epicStories = stories.filter((s) => {
      const storyEpicId = s?.epicId || s?.epic_id;
      const storySprintId = s?.sprintId || s?.sprint_id;
      if (sprintId) return storyEpicId === epicId && storySprintId === sprintId;
      return storyEpicId === epicId;
    });

    return (
      <>
        <ItemRow
          item={epic}
          color="#A855F7"
          labelKey="name"
          icon="⬡"
          indent={indent}
          showCheckbox={true}
          expandable={epicStories.length > 0}
          isExpanded={isExpanded}
          onToggle={() => toggleExpand(epicId, "epic")}
          actions={true}
        />
        {isExpanded &&
          epicStories.map((story, idx) => <StoryRow key={`story-${story?.id || idx}`} story={story} indent={indent + 1} />)}
      </>
    );
  };

  const SprintRow = ({ sprint }) => {
    const sprintId = sprint?.id || sprint?._id;
    const isExpanded = expandedSprints.has(sprintId);

    const sprintEpics = epics.filter((e) => {
      const epicSprintId = e?.sprintId || e?.sprint_id;
      return epicSprintId === sprintId;
    });

    const directStories = stories.filter((s) => {
      const storySprintId = s?.sprintId || s?.sprint_id;
      const storyEpicId = s?.epicId || s?.epic_id;
      return storySprintId === sprintId && !storyEpicId;
    });

    return (
      <>
        <ItemRow
          item={sprint}
          color="#0EA5E9"
          labelKey="name"
          icon="⚡"
          showCheckbox={true}
          expandable={true}
          isExpanded={isExpanded}
          onToggle={() => toggleExpand(sprintId, "sprint")}
          showDate={true}
          actions={true}
        />
        {isExpanded && (
          <>
            {sprintEpics.map((epic, idx) => (
              <EpicRow key={`epic-${epic?.id || idx}`} epic={epic} sprintId={sprintId} indent={1} />
            ))}
            {directStories.map((story, idx) => (
              <StoryRow key={`story-${story?.id || idx}`} story={story} indent={1} />
            ))}
          </>
        )}
      </>
    );
  };

  const unassignedEpics = epics.filter((e) => !e?.sprintId && !e?.sprint_id);
  const unassignedStories = stories.filter((s) => !s?.sprintId && !s?.sprint_id && !s?.epicId && !s?.epic_id);

  // Horizontal scroll sync
  const handleScroll = (e) => {
    if (headerRef.current) headerRef.current.scrollLeft = e.target.scrollLeft;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-lg shadow-lg border">
        <div className="text-gray-500">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg border overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-50 border-b sticky top-0 z-50">
        <div className="flex">
          <div className="w-[420px] bg-white border-r flex items-center px-4 py-3">
            <span className="font-semibold text-gray-900 text-sm">Work</span>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin" ref={headerRef}>
            <div className="inline-block min-w-[2000px]">
              <div className="flex bg-white">
                {monthGroups.map((group, i) => (
                  <div key={i} style={{ width: group.daysInMonth * cellWidth }} className="text-center border-r border-gray-200 py-2">
                    <div className="font-semibold text-gray-900 text-sm">{group.month}</div>
                  </div>
                ))}
              </div>
              <div className="flex bg-gray-50 border-t">
                {days.map((d, i) => (
                  <div key={i} style={{ width: cellWidth }} className="text-xs text-gray-600 text-center py-2 border-r border-gray-200 last:border-r-0">
                    {d.date()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto scrollbar-thin" ref={scrollRef} onScroll={handleScroll}>
        {sprints.map((sprint, idx) => (
          <SprintRow key={`sprint-${sprint?.id || idx}`} sprint={sprint} />
        ))}

        {unassignedEpics.length > 0 && (
          <>
            <div className="border-b bg-gray-100 mt-4">
              <div className="flex">
                <div className="sticky left-0 w-[420px] bg-gray-100 z-10 px-4 py-2 border-r">
                  <span className="font-semibold text-gray-700 text-sm">Epics</span>
                </div>
                <div className="flex-1"></div>
              </div>
            </div>
            {unassignedEpics.map((epic, idx) => (
              <EpicRow key={`epic-${epic?.id || idx}`} epic={epic} indent={0} />
            ))}
          </>
        )}

        {unassignedStories.length > 0 && (
          <>
            <div className="border-b bg-gray-100 mt-4">
              <div className="flex">
                <div className="sticky left-0 w-[420px] bg-gray-100 z-10 px-4 py-2 border-r">
                  <span className="font-semibold text-gray-700 text-sm">Stories</span>
                </div>
                <div className="flex-1"></div>
              </div>
            </div>
            {unassignedStories.map((story, idx) => (
              <StoryRow key={`story-${story?.id || idx}`} story={story} indent={0} />
            ))}
          </>
        )}

        <div className="border-t p-4">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <span className="text-lg">+</span>
            <span>Create Epic</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default Timeline;
