import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { convertUTCtoLocalTime } from "./utils";

const computeWeekOfMonth = (dateStr) => {
  const d = new Date(dateStr);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const dayOfMonth = d.getDate();
  const offset = (first.getDay() + 6) % 7;
  return Math.ceil((dayOfMonth + offset) / 7);
};

const statusToColor = (status) => {
  if (!status)
    return {
      bg: "bg-gray-50",
      badge: "bg-gray-600",
      border: "border-gray-200",
      totalText: "text-gray-700",
    };

  const s = status.toLowerCase();
  if (s.includes("submitted") || s === "draft")
    return {
      bg: "bg-yellow-50",
      badge: "bg-yellow-600",
      border: "border-yellow-200",
      totalText: "text-yellow-700",
    };
  if (s.includes("approved") || s.includes("partially approved"))
    return {
      bg: "bg-green-50",
      badge: "bg-green-600",
      border: "border-green-200",
      totalText: "text-green-700",
    };
  if (s.includes("rejected"))
    return {
      bg: "bg-red-50",
      badge: "bg-red-600",
      border: "border-red-200",
      totalText: "text-red-700",
    };

  return {
    bg: "bg-gray-50",
    badge: "bg-gray-600",
    border: "border-gray-200",
    totalText: "text-gray-700",
  };
};

const CustomStatusBadge = ({ label }) => {
  const col = statusToColor(label);
  return (
    <span
      className={`inline-block rounded-full font-medium border px-3 py-0.5 text-xs ${col.badge} text-white`}
    >
      {label || "Unknown"}
    </span>
  );
};

const formatShortDate = (isoDate) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const WeeklySummaryCard = ({ week, projectInfo }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const getProjectName = (projectId) => {
    const p = projectInfo?.find((pr) => pr.projectId === projectId);
    return p ? p.project : `Project ${projectId}`;
  };

  const getTaskName = (taskId) => {
    for (const p of projectInfo || []) {
      const t = p.tasks.find((t) => t.taskId === taskId);
      if (t) return t.task;
    }
    return `Task ${taskId}`;
  };

  const anchor = week.timesheets?.[0]?.workDate ?? week.startDate;
  const weekNo = computeWeekOfMonth(anchor);
  const col = statusToColor(week.weeklyStatus);

  return (
    <div
      className={`mb-6 bg-white rounded-xl shadow-lg border-2 ${col.border} text-xs overflow-hidden`}
    >
      {/* HEADER (Clickable) */}
      <div
        className={`${col.bg} border-b px-4 py-3 cursor-pointer`}
        onClick={toggleExpand}
      >
        <div className="flex justify-between items-center">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}

            <div
              className={`${col.badge} text-white px-3 py-1 rounded-full text-sm font-bold`}
            >
              Week {weekNo}
            </div>

            <div className="text-lg font-semibold text-gray-800">
              {new Date(anchor).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>

            <div className="text-sm text-gray-600">
              {week.startDate} — {week.endDate}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <div className={`text-lg font-bold ${col.totalText}`}>
              {Number(week.totalHours || 0)} hrs
            </div>

            <CustomStatusBadge label={week.weeklyStatus} />
          </div>
        </div>
      </div>

      {/* BODY (Expandable) */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {week.timesheets?.length > 0 ? (
            week.timesheets
              .slice()
              .sort((a, b) => new Date(a.workDate) - new Date(b.workDate))
              .map((ts) => (
                <div
                  key={ts.timesheetId}
                  className="bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div
                    className={`flex justify-between items-center px-4 py-3 border-b-2 ${
                      ts.defaultHolidayTimesheet ? "bg-red-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-gray-700">
                        {formatShortDate(ts.workDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ts.hoursWorked} hrs
                      </div>
                    </div>

                    <CustomStatusBadge label={ts.status} />
                  </div>

                  {!ts.defaultHolidayTimesheet && (
                    <div className="p-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-gray-500">
                            <th className="py-2">Project</th>
                            <th className="py-2">Task</th>
                            <th className="py-2">Start</th>
                            <th className="py-2">End</th>
                            <th className="py-2">Location</th>
                            <th className="py-2">Description</th>
                            <th className="py-2">Billable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ts.entries.map((e, idx) => (
                            <tr
                              key={idx}
                              className={
                                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="py-2">
                                {getProjectName(e.projectId)}
                              </td>
                              <td className="py-2">{getTaskName(e.taskId)}</td>
                              <td className="py-2">
                                {e.fromTime
                                  ? convertUTCtoLocalTime(e.fromTime)
                                  : "-"}
                              </td>
                              <td className="py-2">
                                {e.toTime
                                  ? convertUTCtoLocalTime(e.toTime)
                                  : "-"}
                              </td>
                              <td className="py-2">
                                {e.workLocation || "-"}
                              </td>
                              <td className="py-2">{e.description || "-"}</td>
                              <td className="py-2">
                                {e.isBillable ? "Yes" : "No"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
          ) : (
            <div className="text-gray-500">No timesheets for this week.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklySummaryCard;
