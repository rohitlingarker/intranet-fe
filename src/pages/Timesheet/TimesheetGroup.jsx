import React, { useState, useEffect, useRef } from "react";
import StatusBadge from "../../components/status/statusbadge";
import EntriesTable from "./EntriesTable";
import { CheckCircle, XCircle, Clock, MoreVertical } from "lucide-react";
import Tooltip from "../../components/status/Tooltip";
import { showStatusToast } from "../../components/toastfy/toast";

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
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
  refreshData,
  projectInfo,
  approvers = [
    { approverName: "Dummy Approver1", status: "Pending" },
    { approverName: "Dummy Approver2", status: "Approved" },
  ],
}) => {
  const [entriesState, setEntriesState] = useState(entries);
  const [selectedEntryIds, setSelectedEntryIds] = useState([]);
  const [addingNewEntry, setAddingNewEntry] = useState(false);
  const [date, setDate] = useState(workDate);
  const [editDateIndex, setEditDateIndex] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalHours = calculateTotalHours(entriesState);

  const handleAddEntry = () => {
    setMenuOpen(false);
    setAddingNewEntry(!addingNewEntry);
  };

  const handleDeleteClick = () => {
    if (selectedEntryIds.length === 0) {
      alert("No entries selected for deletion.");
      return;
    }
    setMenuOpen(false);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
  setIsConfirmOpen(false);
  try {
    const response = await fetch(`${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/timesheet/entries`, {
      method: 'DELETE',  // or 'POST' if DELETE is not supported
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        timesheetId: timesheetId, // from your component props
        entryIds: selectedEntryIds, // list of IDs selected for delete
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to delete entries');
    }
    setSelectedEntryIds([]);
    showStatusToast("Entries deleted successfully", "success");
    if (refreshData) await refreshData();
  } catch (error) {
    showStatusToast("Error deleting entries", "error");
  }
};


  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
  };

  const handleSelect = () => {
    setMenuOpen(false);
    const allEntryIds = entriesState.map((entry) => entry.timesheetEntryId);
    setSelectedEntryIds(allEntryIds);
  };

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
            <StatusBadge label={approveStatus ? "Approved" : status} size="sm" />
          </Tooltip>
        </div>

        {/* 3-dots dropdown button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="p-2 rounded-full hover:bg-gray-300 focus:outline-none"
            type="button"
            disabled={status === "Approved"}
          >
            <MoreVertical size={22} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-10 border">
              <button
                onClick={handleAddEntry}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Add Entry
              </button>
              <button
                onClick={handleDeleteClick}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
              >
                Delete
              </button>
              <button
                onClick={handleSelect}
                className="block w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100"
              >
                Select
              </button>
            </div>
          )}
        </div>
      </div>

      <EntriesTable
        entries={entriesState}
        selectedEntryIds={selectedEntryIds}
        setSelectedEntryIds={setSelectedEntryIds}
        timesheetId={timesheetId}
        workDate={date}
        status={status}
        mapWorkType={mapWorkType}
        addingNewEntry={addingNewEntry}
        setAddingNewEntry={setAddingNewEntry}
        setAddingNewTimesheet={setAddingNewTimesheet}
        refreshData={refreshData}
        projectInfo={projectInfo}
        
      />
      <ConfirmDialog
        open={isConfirmOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${selectedEntryIds.length} selected entr${selectedEntryIds.length > 1 ? "ies" : "y"}?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export { TimesheetGroup };
