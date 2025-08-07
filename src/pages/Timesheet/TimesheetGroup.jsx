import React from "react";
import StatusBadge from "../../components/status/StatusBadge";
import EntriesTable from "./EntriesTable";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }); // e.g., Mon, 2 Aug
};

const calculateTotalHours = (entries) => {
  let totalMinutes = 0;
  entries.forEach((entry) => {
    const start = new Date(entry.fromTime);
    const end = new Date(entry.toTime);
    const diffMinutes = (end - start) / (1000 * 60);
    totalMinutes += diffMinutes;
  });
  return (totalMinutes / 60).toFixed(2);
};

const TimesheetGroup = ({
  timesheetId, 
  workDate,
  entries,
  status,
  projectIdToName,
  taskIdToName,
  mapWorkType,
  onSaveSuccess, // ✅ Optional: Refresh parent state after save
}) => {
  const totalHours = calculateTotalHours(entries);

  return (
    <div className="mb-6 bg-gray-200 pt-1 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-1 mx-4">
        <div className="text-sm text-gray-700 font-semibold">
          {formatDate(workDate)}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-gray-700">{totalHours} hrs</span>
          <StatusBadge label={status} />
        </div>
      </div>
      <EntriesTable
        entries={entries}
        timesheetId={timesheetId} 
        workDate={workDate}
        currentStatus={status}
        onSaveSuccess={onSaveSuccess}
        projectIdToName={projectIdToName}
        taskIdToName={taskIdToName}
        mapWorkType={mapWorkType}
      />
    </div>
  );
};

export default TimesheetGroup;
