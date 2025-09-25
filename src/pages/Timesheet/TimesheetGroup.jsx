import React from "react";
import StatusBadge from "../../components/status/statusbadge";
import Button from "../../components/Button/Button";

import EntriesTable from "./EntriesTable";
import { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react"; // nice icons
import Tooltip from "../../components/status/Tooltip";

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
  projectInfo,
  approvers = [
    {
      approverName: "Dummy Approver1",
      status: "Pending",
    },
    {
      approverName: "Dummy Approver2",
      status: "Approved",
    },
  ],
}) => {
  const totalHours = calculateTotalHours(entries);

  const [addingNewEntry, setAddingNewEntry] = useState(false);
  const [date, setDate] = useState(workDate);
  const [editDateIndex, setEditDateIndex] = useState(null);

  // check if all approvers have status approved
  const approveStatus = approvers.every((a) => a.status === "Approved");


  const formatApproverTooltip = (approvers) => {
    if (!approvers || approvers.length === 0) {
      return <p className="text-gray-400">No approver data</p>;
    }

    const approved = approvers.filter((a) => a.status === "Approved");
    const rejected = approvers.filter((a) => a.status === "Rejected");
    const pending = approvers.filter((a) => a.status === "Pending");

    return (
      <div className="space-y-2 text-xs">
        {approved.length > 0 && (
          <div>
            <div className="flex items-center gap-1 font-medium text-green-400">
              <CheckCircle size={14} /> Approved by:
            </div>
            <ul className="list-disc list-inside text-gray-200 ml-4">
              {approved.map((a) => (
                <li key={a.approverName}>{a.approverName}</li>
              ))}
            </ul>
          </div>
        )}
        {pending.length > 0 && (
          <div>
            <div className="flex items-center gap-1 font-medium text-yellow-400">
              <Clock size={14} /> Yet to be approved by:
            </div>
            <ul className="list-disc list-inside text-gray-200 ml-4">
              {pending.map((a) => (
                <li key={a.approverName}>{a.approverName}</li>
              ))}
            </ul>
          </div>
        )}
        {rejected.length > 0 && (
          <div>
            <div className="flex items-center gap-1 font-medium text-red-400">
              <XCircle size={14} /> Rejected by:
            </div>
            <ul className="list-disc list-inside text-gray-200 ml-4">
              {rejected.map((a) => (
                <li key={a.approverName}>{a.approverName}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-6 bg-gray-200 pt-1 rounded-lg shadow-sm border border-gray-200 text-xs">
      <div className="flex justify-between items-center mb-1 mx-4">
        {editDateIndex === timesheetId && emptyTimesheet ? (
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            value={date}
            onChange={(e) => {
              setEditDateIndex(null);
              setDate(e.target.value);
            }}
          />
        ) : (
          <div
            onClick={() => setEditDateIndex(timesheetId)}
            className="text-gray-500 font-semibold cursor-pointer"
          >
            {formatDate(date)}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-700">
            Total hours : {totalHours} hrs
          </span>
          <Tooltip content={formatApproverTooltip(approvers)}>
            <StatusBadge
              label={approveStatus ? "Approved" : status}
              size="sm"
            />
          </Tooltip>
        </div>
        <Button
          size="small"
          variant="primary"
          onClick={() => setAddingNewEntry(!addingNewEntry)}
          type="button"
          disabled={status === "Approved"}
        >
          Add Entry
        </Button>
      </div>
      <EntriesTable
        entries={entries}
        timesheetId={timesheetId}
        workDate={date}
        status={status}
        mapWorkType={mapWorkType}
        addingNewEntry={addingNewEntry}
        setAddingNewEntry={setAddingNewEntry}
        setAddingNewTimesheet={setAddingNewTimesheet}
        refreshData={refreshData} // ✅ Pass the callback to refresh data
        projectInfo={projectInfo}
      />
    </div>
  );
};

export { TimesheetGroup };
