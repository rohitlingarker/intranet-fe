import React, { useState, useEffect } from "react";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTime from "../../components/forms/FormTime";
import { addEntryToTimesheet, updateTimesheet } from "./api";
import { Pencil, Check, X } from "lucide-react";
import { showStatusToast } from "../../components/toastfy/toast";
import Button from "../../components/Button/Button";

const EntriesTable = ({
  entries,
  mapWorkType,
  timesheetId,
  workDate,
  status,
  addingNewEntry,
  setAddingNewEntry,
  setAddingNewTimesheet,
  refreshData,
  projectInfo,
  selectedEntryIds,
  setSelectedEntryIds,
  selectionMode,
}) => {
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [addData, setAddData] = useState({ workType: "Office", isBillable: "Yes" });
  const [pendingEntries, setPendingEntries] = useState([]);

  useEffect(() => {
    if (!addingNewEntry) setEditIndex(null);
  }, [addingNewEntry]);

  const workTypeOptions = [
    { label: "Office", value: "Office" },
    { label: "Home", value: "Home" },
    { label: "Client Location", value: "Client Location" },
    { label: "Hybrid", value: "Hybrid" },
  ];

  const billableOptions = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
  ];

  const projectOptions = projectInfo.map((p) => ({ label: p.project, value: p.projectId }));
  const projectIdToName = Object.fromEntries(projectInfo.map((p) => [p.projectId, p.project]));
  const taskIdToName = Object.fromEntries(
    projectInfo.flatMap((p) => p.tasks.map((t) => [t.taskId, t.task]))
  );

  const getTaskOptions = (projectId) => {
    const proj = projectInfo.find((p) => p.projectId === parseInt(projectId));
    return proj ? proj.tasks.map((t) => ({ label: t.task, value: t.taskId })) : [];
  };

  const toggleCheckbox = (entryId, checked) => {
    if (checked) setSelectedEntryIds((prev) => [...prev, entryId]);
    else setSelectedEntryIds((prev) => prev.filter((id) => id !== entryId));
  };

  const handleEditClick = (idx) => {
    if (addingNewEntry || status === "Approved") return;
    const entry = entries[idx];
    setEditIndex(idx);
    setAddingNewEntry(false);
    setEditData({
      timesheetEntryId: entry.timesheetEntryId,
      projectId: entry.projectId,
      taskId: entry.taskId,
      fromTime: new Date(entry.fromTime).toISOString().slice(11, 16),
      toTime: new Date(entry.toTime).toISOString().slice(11, 16),
      workType: entry.workType,
      description: entry.description,
      isBillable: entry.isBillable ? "Yes" : "No",
    });
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditData({});
    setAddingNewEntry(false);
    setAddData({ workType: "Office", isBillable: "Yes" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (addingNewEntry) setAddData((prev) => ({ ...prev, [name]: value }));
    else setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = (data) => {
    const { projectId, taskId, fromTime, toTime, workType } = data;
    if (!projectId) showStatusToast("Please select a project", "error");
    if (!taskId) showStatusToast("Please select a task", "error");
    if (!fromTime) showStatusToast("Please select a start time", "error");
    if (!toTime) showStatusToast("Please select an end time", "error");
    if (!workType) showStatusToast("Please select a work type", "error");
    return projectId && taskId && fromTime && toTime && workType && fromTime < toTime;
  };

  const hasOverlap = (newStart, newEnd, ignoreId = null) => {
    for (let entry of entries) {
      if (ignoreId && entry.timesheetEntryId === ignoreId) continue;
      const existingStart = new Date(entry.fromTime);
      const existingEnd = new Date(entry.toTime);
      if (newStart < existingEnd && existingStart < newEnd) return true;
    }
    return false;
  };

  const handleSave = async () => {
    if (!isValid(editData)) return;
    const newStart = new Date(`${workDate}T${editData.fromTime}`);
    const newEnd = new Date(`${workDate}T${editData.toTime}`);
    if (hasOverlap(newStart, newEnd, editData.timesheetEntryId)) {
      showStatusToast("Time overlap detected with another entry!", "error");
      return;
    }
    try {
      await updateTimesheet(timesheetId, {
        workDate,
        status,
        entries: [
          {
            ...editData,
            projectId: parseInt(editData.projectId),
            taskId: parseInt(editData.taskId),
            fromTime: newStart.toISOString(),
            toTime: newEnd.toISOString(),
            isBillable: editData.isBillable === "Yes",
          },
        ],
      });
      setEditIndex(null);
      setEditData({});
      refreshData();
    } catch (err) {
      showStatusToast("Failed to update entry", "error");
    }
  };

  const handleAddEntry = () => {
    if (!isValid(addData)) return;
    const newStart = new Date(`${workDate}T${addData.fromTime}`);
    const newEnd = new Date(`${workDate}T${addData.toTime}`);
    if (hasOverlap(newStart, newEnd)) {
      showStatusToast("Time overlap detected with another entry!", "error");
      return;
    }
    setPendingEntries((prev) => [
      ...prev,
      {
        ...addData,
        projectId: parseInt(addData.projectId),
        taskId: parseInt(addData.taskId),
        fromTime: newStart.toISOString(),
        toTime: newEnd.toISOString(),
        isBillable: addData.isBillable === "Yes",
      },
    ]);
    setAddingNewEntry(false);
    setAddData({ workType: "Office", isBillable: "Yes" });
  };

  return (
    <table className="w-full border-collapse rounded">
      <thead>
        <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
          {selectionMode && <th className="px-4 py-2">
             <input
          type="checkbox"
          title="Select All"
          checked={entries.length > 0 && selectedEntryIds.length === entries.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedEntryIds(entries.map((entry) => entry.timesheetEntryId));
            } else {
              setSelectedEntryIds([]);
            }
          }}
        /> 
          </th>}
          <th className="text-left px-4 py-2">Project</th>
          <th className="text-left px-4 py-2">Task</th>
          <th className="text-left px-4 py-2">Start</th>
          <th className="text-left px-4 py-2">End</th>
          <th className="text-left px-4 py-2">Work Type</th>
          <th className="text-left px-4 py-2">Description</th>
          <th className="text-left px-4 py-2">Billable</th>
          <th className="text-left px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {[...entries, ...pendingEntries].map((entry, idx) => (
          <tr key={entry.timesheetEntryId || `new-${idx}`} className={`text-sm ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}>
            {selectionMode && (
              <td className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedEntryIds.includes(entry.timesheetEntryId || `new-${idx}`)}
                  onChange={(e) =>
                    toggleCheckbox(entry.timesheetEntryId || `new-${idx}`, e.target.checked)
                  }
                />
              </td>
            )}
            <td className="px-4 py-2">{projectIdToName[entry.projectId] || "N/A"}</td>
            <td className="px-4 py-2">{taskIdToName[entry.taskId] || "N/A"}</td>
            <td className="px-4 py-2">{new Date(entry.fromTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
            <td className="px-4 py-2">{new Date(entry.toTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
            <td className="px-4 py-2">{mapWorkType(entry.workType)}</td>
            <td className="px-4 py-2">{entry.description}</td>
            <td className="px-4 py-2">{entry.isBillable ? "Yes" : "No"}</td>
            <td className="px-4 py-2">
              {status !== "Approved" && (
                <button className="text-blue-600 hover:underline text-sm" onClick={() => handleEditClick(idx)}>
                  <Pencil className="inline w-4 h-4" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>

      {pendingEntries.length > 0 && (
        <tfoot>
          <tr>
            <td colSpan="9" className="px-4 py-1">
              <div className="flex justify-end py-1">
                <Button
                  size="small"
                  onClick={async () => {
                    try {
                      await addEntryToTimesheet(timesheetId, workDate, pendingEntries);
                      setPendingEntries([]);
                      setAddingNewTimesheet(false);
                      refreshData();
                      showStatusToast("Timesheet submitted!", "success");
                    } catch (err) {
                      showStatusToast("Failed to submit timesheet", "error");
                    }
                  }}
                >
                  Submit Timesheet
                </Button>
              </div>
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};

export default EntriesTable;
