// WeeklySummaryCard.jsx
import React from "react";

/**
 * WeeklySummaryCard
 * props:
 *  - week: single element from weeklySummaryHistory
 *  - monthBase: a Date object for the month to compute week index inside month (option C)
 *
 * The function computeWeekOfMonth returns 1-based week index relative to the month.
 */
const computeWeekOfMonth = (dateStr) => {
  // compute which week index in the month the given date belongs to
  const d = new Date(dateStr);
  // find first day of month
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  // week index based on ISO-like start Monday -> compute week number within month
  const dayOfMonth = d.getDate();
  // shift to Monday-based weeks: get day of week (0-Sun ..6-Sat). we want Monday-first.
  const offset = (first.getDay() + 6) % 7; // 0 for Monday
  return Math.ceil((dayOfMonth + offset) / 7);
};

const statusToColor = (status) => {
  if (!status) return { bg: "bg-gray-50", badge: "bg-gray-600", border: "border-gray-200", totalText: "text-gray-700" };
  const s = status.toLowerCase();
  if (s.includes("submitted") || s === "draft") return { bg: "bg-yellow-50", badge: "bg-yellow-600", border: "border-yellow-200", totalText: "text-yellow-700" };
  if (s.includes("approved") || s.includes("partially approved")) return { bg: "bg-green-50", badge: "bg-green-600", border: "border-green-200", totalText: "text-green-700" };
  if (s.includes("rejected")) return { bg: "bg-red-50", badge: "bg-red-600", border: "border-red-200", totalText: "text-red-700" };
  return { bg: "bg-gray-50", badge: "bg-gray-600", border: "border-gray-200", totalText: "text-gray-700" };
};

const CustomStatusBadge = ({ label }) => {
  const col = statusToColor(label);
  return (
    <span className={`inline-block rounded-full font-medium border px-3 py-0.5 text-xs ${col.badge} text-white`}>
      {label || "Unknown"}
    </span>
  );
};

const formatShortDate = (isoDate) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
};

const WeeklySummaryCard = ({ week, monthReference = null }) => {
  // monthReference can be any date inside the month you want to use to compute week indices;
  // we'll compute week number from the first timesheet date in the week if available, otherwise from startDate
  const anchor = week.timesheets?.[0]?.workDate ?? week.startDate;
  const weekNo = computeWeekOfMonth(anchor);

  const col = statusToColor(week.weeklyStatus);
  // compute hours difference to display arrow? We'll skip complex diff; show only total for now.
  return (
    <div className={`mb-6 bg-white rounded-xl shadow-lg border-2 ${col.border} text-xs overflow-hidden`}>
      {/* Header */}
      <div className={`${col.bg} border-b px-4 py-3`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`${col.badge} text-white px-3 py-1 rounded-full text-sm font-bold`}>
              Week {weekNo}
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {(() => {
                // display month name and year derived from anchor
                const d = new Date(anchor);
                return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
              })()}
            </div>
            <div className="text-sm text-gray-600">{`${week.startDate} — ${week.endDate}`}</div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`text-lg font-bold ${col.totalText}`}>{week.totalHours} hrs</div>
            <CustomStatusBadge label={week.weeklyStatus} />
          </div>
        </div>
      </div>

      {/* Content: timesheets per day */}
      <div className="p-4 space-y-3">
        {week.timesheets && week.timesheets.length > 0 ? (
          week.timesheets
            .slice()
            .sort((a, b) => new Date(a.workDate) - new Date(b.workDate))
            .map((ts) => (
              <div key={ts.timesheetId} className="bg-gray-50 rounded-lg border border-gray-200 overflow-visible">
                <div className={`flex justify-between items-center px-4 py-3 border-b-2 ${ts.defaultHolidayTimesheet ? "bg-red-50" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-gray-700">{formatShortDate(ts.workDate)}</div>
                    <div className="text-sm text-gray-500">{ts.hoursWorked} hrs</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CustomStatusBadge label={ts.status} />
                    {ts.actionStatus && ts.actionStatus.length > 0 && (
                      <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">{ts.actionStatus.length} approver{ts.actionStatus.length>1?"s":""}</div>
                    )}
                  </div>
                </div>

                {/* entries table summary */}
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
                        {ts.entries && ts.entries.length > 0 ? (
                          ts.entries.map((e, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="py-2">{e.projectName || `Project ${e.projectId ?? ""}`}</td>
                              <td className="py-2">{e.taskName || `Task ${e.taskId ?? ""}`}</td>
                              <td className="py-2">{e.fromTime || "-"}</td>
                              <td className="py-2">{e.toTime || "-"}</td>
                              <td className="py-2">{e.workLocation || "-"}</td>
                              <td className="py-2">{e.description || "-"}</td>
                              <td className="py-2">{e.isBillable ? "Yes" : "No"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="py-3 text-gray-500">No entries</td>
                          </tr>
                        )}
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
    </div>
  );
};

export default WeeklySummaryCard;