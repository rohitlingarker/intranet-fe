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
  emptyTimesheet,
  addingNewTimesheet,
  setAddingNewTimesheet,
  refreshData, // ✅ Optional: Refresh parent state after save
}) => {
  const totalHours = calculateTotalHours(entries);

  const [addingNewEntry, setAddingNewEntry] = useState(false);
  const [date, setDate] = useState(workDate);
  const [editDateIndex, setEditDateIndex] = useState(null);

  
  return (
    <div className="mb-6 bg-gray-200 pt-1 rounded-lg shadow-sm border border-gray-200 text-xs">
      <div className="flex justify-between items-center mb-1 mx-4">
        {(editDateIndex === timesheetId) && emptyTimesheet ? (
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            value={date}
            onChange={(e) => {
              setEditDateIndex(null);
              setDate(e.target.value)}}
          />
        ) : (
          <div 
          onClick={() => setEditDateIndex(timesheetId)}
          className="text-gray-500 font-semibold cursor-pointer">
            {formatDate(date)}
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-700">Total hours : {totalHours} hrs</span>
          <StatusBadge label={status} size="sm" />
        </div>
        <Button
          size="small"
          variant="primary"
          onClick={() => setAddingNewEntry(!addingNewEntry)}
          type="button"
        >
          Add Entry
        </Button>
      </div>
      <EntriesTable
        entries={entries}
        timesheetId={timesheetId} 
        workDate={date}
        currentStatus={status}
        mapWorkType={mapWorkType}
        addingNewEntry={addingNewEntry}
        setAddingNewEntry={setAddingNewEntry}
        setAddingNewTimesheet={setAddingNewTimesheet}
        refreshData={refreshData} // ✅ Pass the callback to refresh data
      />
    </div>
  );
};

export default TimesheetGroup;
