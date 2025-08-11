import React from "react";
import StatusBadge from "../../components/status/StatusBadge";
import Button from "../../components/Button/Button";

import EntriesTable from "./EntriesTable";
import { useState } from "react";

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
  mapWorkType,
  refreshData, // ✅ Optional: Refresh parent state after save
}) => {
  const totalHours = calculateTotalHours(entries);

  const [addingNewEntry, setAddingNewEntry] = useState(false);

  return (
    <div className="mb-6 bg-gray-200 pt-1 rounded-lg shadow-sm border border-gray-200 text-xs">
      <div className="flex justify-between items-center mb-1 mx-4">
        <div className="text-gray-500 font-semibold ">
          {formatDate(workDate)}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-700">Total hours : {totalHours} hrs</span>
          <StatusBadge label={status} size="sm" />
        </div>
        <Button
          size="small"
          variant="primary"
          onClick={() => setAddingNewEntry(true)}
          type="button"
        >
          Add Entry
        </Button>
      </div>
      <EntriesTable
        entries={entries}
        timesheetId={timesheetId} 
        workDate={workDate}
        currentStatus={status}
        mapWorkType={mapWorkType}
        addingNewEntry={addingNewEntry}
        setAddingNewEntry={setAddingNewEntry}
        refreshData={refreshData} // ✅ Pass the callback to refresh data
      />
    </div>
  );
};

export default TimesheetGroup;
