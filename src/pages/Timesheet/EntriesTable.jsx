
import React, { useState, useEffect } from "react";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTime from "../../components/forms/FormTime";
import {
  addEntryToTimesheet,
  fetchProjectTaskInfo,
  updateTimesheet,
} from "./api";
import { Pencil, Check, X } from "lucide-react";
import { showStatusToast } from "../../components/toastfy/toast";
import Button from "../../components/Button/Button";

const EntriesTable = ({
  entries,
  mapWorkType,
  userId,
  timesheetId,
  workDate,
  status,
  addingNewEntry,
  setAddingNewEntry,
  setAddingNewTimesheet,
  refreshData, // callback to reload entries after update
  projectInfo,
  selectedEntryIds,  
  setSelectedEntryIds,
  selectionMode,
}) => {
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const [addData, setAddData] = useState({ workType: "Office", isBillable: "Yes" });

  const [pendingEntries, setPendingEntries] = useState([]);

  userId = userId || 1; // Default to 1 if not provided

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


  const projectOptions = projectInfo.map((p) => ({
    label: p.project,
    value: p.projectId,
  }));

  const projectIdToName = Object.fromEntries(
    projectInfo.map((p) => [p.projectId, p.project])
  );
  const taskIdToName = Object.fromEntries(
    projectInfo.flatMap((p) => p.tasks.map((t) => [t.taskId, t.task]))
  );

  const getTaskOptions = (projectId) => {
    const proj = projectInfo.find((p) => p.projectId === parseInt(projectId));
    return proj
      ? proj.tasks.map((t) => ({ label: t.task, value: t.taskId }))
      : [];
  };

  const toggleCheckbox = (entryId, checked) => {
    if (checked) {
      setSelectedEntryIds((prev) => [...prev, entryId]);
    } else {
      setSelectedEntryIds((prev) => prev.filter((id) => id !== entryId));
    }
  };

  // Helper to check if all entries are selected
  const allSelected =
    entries.length > 0 && selectedEntryIds.length === entries.length;

  // Toggle select all
  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedEntryIds(entries.map((e) => e.timesheetEntryId));
    } else {
      setSelectedEntryIds([]);
    }
  };


  const handleEditClick = (idx) => {
    if (addingNewEntry) return;
    if (status === "Approved") return;

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
    setAddData({ workType: "Office" , isBillable: "Yes" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (addingNewEntry) setAddData((prev) => ({ ...prev, [name]: value }));
    else setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = (data) => {
    const { projectId, taskId, fromTime, toTime, workType } = data;
    // show error toast mentioning which field is invalid
    if (!projectId) showStatusToast("Please select a project", "error");
    if (!taskId) showStatusToast("Please select a task", "error");
    if (!fromTime) showStatusToast("Please select a start time", "error");
    if (!toTime) showStatusToast("Please select an end time", "error");
    if (!workType) showStatusToast("Please select a work type", "error");

    return (
      projectId && taskId && fromTime && toTime && workType && fromTime < toTime
    );
  };

  // ✅ Check overlap helper
  const hasOverlap = (newStart, newEnd, ignoreId = null) => {
    for (let entry of entries) {
      if (ignoreId && entry.timesheetEntryId === ignoreId) continue;

      const existingStart = new Date(entry.fromTime);
      const existingEnd = new Date(entry.toTime);

      if (newStart < existingEnd && existingStart < newEnd) {
        return true;
      }
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

    const payload = {
      workDate,
      status,
      entries: [
        {
          timesheetEntryId: editData.timesheetEntryId,
          projectId: parseInt(editData.projectId),
          taskId: parseInt(editData.taskId),
          description: editData.description,
          workType: editData.workType,
          hoursWorked: 0,
          fromTime: newStart.toISOString(),
          toTime: newEnd.toISOString(),
          otherDescription: "",
          isBillable: editData.isBillable === "Yes",
        },
      ],
    };

    try {
      await updateTimesheet(timesheetId, payload);
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
        projectId: parseInt(addData.projectId),
        taskId: parseInt(addData.taskId),
        description: addData.description,
        workType: addData.workType,
        hoursWorked: 0,
        fromTime: newStart.toISOString(),
        toTime: newEnd.toISOString(),
        otherDescription: "",
        isBillable: addData.isBillable === "Yes",
      },
    ]);
    setAddingNewEntry(false);
    setAddData({ workType: "Office" , isBillable: "Yes" });
  };
  
  return (
    <table className="w-full border-collapse rounded ">
      <thead>
        <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
          <th className="px-4 py-2">
            <label className="inline-flex items-center cursor-pointer select-none" title="Select All"></label>
            <input 
              type="checkbox"
              title="Select All"
              checked={allSelected}
              onChange={(e) => toggleSelectAll(e.target.checked)}
            />
          </th>  
          
    

          
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
        {entries.length === 0 && <tr></tr>}
        {[...entries, ...pendingEntries].map((entry, idx) => (
          <tr
            key={entry.timesheetEntryId}
            className={`text-sm ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
          >
           
              <td className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedEntryIds.includes(entry.timesheetEntryId)}
                  onChange={(e) => toggleCheckbox(entry.timesheetEntryId, e.target.checked)}
                />
              </td>
          
            {editIndex === idx ? (
              <>
                <td className="px-4 py-2 text-xs">
                  <FormSelect
                    name="projectId"
                    value={editData.projectId}
                    onChange={handleChange}
                    options={projectOptions}
                  />
                </td>
                <td className="px-4 py-2 text-xs">
                  <FormSelect
                    name="taskId"
                    value={editData.taskId}
                    onChange={handleChange}
                    options={getTaskOptions(editData.projectId)}
                  />
                </td>
                <td className="px-4 py-2 text-xs">
                  <FormTime
                    name="fromTime"
                    value={editData.fromTime}
                    onChange={handleChange}
                  />
                </td>
                <td className="px-4 py-2 text-xs">
                  <FormTime
                    name="toTime"
                    value={editData.toTime}
                    onChange={handleChange}
                  />
                </td>
                <td className="px-4 py-2 text-xs">
                  <FormSelect
                    name="workType"
                    value={editData.workType}
                    onChange={handleChange}
                    options={workTypeOptions}
                  />
                </td>
                <td className="px-4 py-2 text-xs">
                  <FormInput
                    name="description"
                    value={editData.description}
                    onChange={handleChange}
                  />
                </td>
                <td className="px-4 py-2">
                  <FormSelect
                    name="isBillable"
                    value={addData.isBillable}
                    onChange={handleChange}
                    options={billableOptions}
                  />
                </td>
                <td className="px-4 py-2 text-xs">
                  <div className="flex gap-2">
                    <button
                      className="text-green-500"
                      // disabled={!isValid(editData)}
                      onClick={handleSave}
                    >
                      <Check />
                    </button>
                    <button className="text-red-500" onClick={handleCancel}>
                      <X />
                    </button>
                  </div>
                </td>
              </>
            ) : (
              <>
                <td className="px-4 py-2 border-b border-gray-200">
                  {projectIdToName[entry.projectId] || `Project-${entry.projectId}`}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {taskIdToName[entry.taskId] || `Task-${entry.taskId}`}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {new Date(entry.fromTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {new Date(entry.toTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {mapWorkType(entry.workType)}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {entry.description}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {entry.isBillable ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2">
                  <button
                    className={`text-blue-600 hover:underline text-sm ${
                      status === "Approved" ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={status === "Approved"}
                    onClick={() => handleEditClick(idx)}
                  >
                    <Pencil className="inline w-4 h-4" />
                  </button>
                </td>
              </>
            )}
          </tr>
        ))}
        {addingNewEntry && (
          <tr>
            <>
            <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          checked={selectedEntryIds.includes('add-entry-temp')}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedEntryIds((prev) => [...prev, 'add-entry-temp']);
            } else {
              setSelectedEntryIds((prev) => prev.filter((id) => id !== 'add-entry-temp'));
            }
          }}
        />
      </td>
              <td className="px-4 py-2">
                <FormSelect
                  name="projectId"
                  value={addData.projectId}
                  onChange={handleChange}
                  options={projectOptions}
                />
              </td>
              <td className="px-4 py-2">
                <FormSelect
                  name="taskId"
                  value={addData.taskId}
                  onChange={handleChange}
                  options={getTaskOptions(addData.projectId)}
                />
              </td>
              <td className="px-4 py-2">
                <FormTime
                  name="fromTime"
                  value={addData.fromTime}
                  onChange={handleChange}
                />
              </td>
              <td className="px-4 py-2">
                <FormTime
                  name="toTime"
                  value={addData.toTime}
                  onChange={handleChange}
                />
              </td>
              <td className="px-4 py-2">
                <FormSelect
                  name="workType"
                  value={addData.workType}
                  onChange={handleChange}
                  options={workTypeOptions}
                />
              </td>
              <td className="px-4 py-2">
                <FormInput
                  name="description"
                  value={addData.description}
                  onChange={handleChange}
                />
              </td>
              <td className="px-4 py-2">
              <FormSelect
                name="isBillable"
                value={addData.isBillable}
                onChange={handleChange}
                options={billableOptions}
              />
            </td>
              <td className="px-4 py-2">
                <div className="flex gap-2">
                  <button
                    className="text-green-500"
                    // disabled={!isValid(addData)}
                    onClick={handleAddEntry}
                  >
                    <Check />
                  </button>
                  <button className="text-red-500" onClick={handleCancel}>
                    <X />
                  </button>
                </div>
              </td>
            </>
          </tr>
        )}
      </tbody>
      {pendingEntries.length > 0 && (
        <tfoot>
  <tr>
    <td colSpan="7" className="px-4 py-1">
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
              // showStatusToast("Failed to submit timesheet", "error");
              throw err;
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

