import React, { useState, useEffect } from "react";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTime from "../../components/forms/FormTime";
import { addEntryToTimesheet, updateTimesheet } from "./api";
import { Pencil, Check, X } from "lucide-react";
import { showStatusToast } from "../../components/toastfy/toast";
import Button from "../../components/Button/Button";

// ✅ Robust time formatter for both UTC and local ISO strings
// ✅ Converts UTC timestamps (from backend) to local time before displaying
const prettyTime = (time) => {
  if (!time) return "";

  try {
    // Case 1: raw "HH:mm" strings (local form inputs)
    if (/^\d{2}:\d{2}$/.test(time)) {
      const [h, m] = time.split(":");
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    // Case 2: ISO datetime from backend ("2025-10-31T23:30:00" or "2025-10-31T23:30:00Z")
    const date = new Date(time.endsWith("Z") ? time : time + "Z");

    // Convert UTC -> Local automatically (Date object does this inherently)
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (err) {
    console.error("prettyTime error:", time, err);
    return "";
  }
};

const EntriesTable = ({
  entries,
  mapWorkType,
  timesheetId,
  workDate,
  status,
  addingNewEntry,
  setAddingNewEntry,
  refreshData,
  projectInfo,
  selectedEntryIds,
  setSelectedEntryIds,
  selectionMode,
}) => {
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [addData, setAddData] = useState({
    workType: "Office",
    isBillable: false,
  });
  const [pendingEntries, setPendingEntries] = useState([]);

  // ✅ Add this helper here
  // const isCurrentMonth = (dateStr) => {
  //   const today = new Date();
  //   const work = new Date(dateStr);
  //   return (
  //     work.getMonth() === today.getMonth() &&
  //     work.getFullYear() === today.getFullYear()
  //   );
  //};
  //const editable = isCurrentMonth(workDate) && status !== "Approved";  //added

  useEffect(() => {
    // console.log({addingNewEntry});
    
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
  // console.log({ projectInfo });

  const projectIdToName = Object.fromEntries(
    projectInfo.map((p) => [p.projectId, p.project])
  );
  const taskIdToName = Object.fromEntries(
    projectInfo.flatMap((p) => p.tasks.map((t) => [t.taskId, t.task]))
  );

  const taskIdToBillablity = Object.fromEntries(
    projectInfo.flatMap((p) => p.tasks.map((t) => [t.taskId, t.billable]))
  );

  const getTaskOptions = (projectId) => {
    const proj = projectInfo.find((p) => p.projectId === parseInt(projectId));
    return proj
      ? proj.tasks.map((t) => ({ label: t.task, value: t.taskId }))
      : [];
  };

  const toggleCheckbox = (entryId, checked) => {
    if (checked) setSelectedEntryIds((prev) => [...prev, entryId]);
    else setSelectedEntryIds((prev) => prev.filter((id) => id !== entryId));
  };

  const handleEditClick = (idx) => {
    if (addingNewEntry || status?.toLowerCase() === "approved") return;
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

    if (addingNewEntry) return; // not used for add row

    let updated = { ...editData, [name]: value };

    if (name === "taskId" && editData.projectId) {
      const project = projectInfo.find(
        (p) => p.projectId === parseInt(editData.projectId)
      );
      const task = project?.tasks.find((t) => t.taskId === parseInt(value));
      if (task) updated.isBillable = task.billable;
    }

    setEditData(updated);
  };

  // ←──────── NEW: handler for add-row inputs ────────→
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...addData, [name]: value };

    if (name === "taskId" && addData.projectId) {
      const project = projectInfo.find(
        (p) => p.projectId === parseInt(addData.projectId)
      );
      const task = project?.tasks.find((t) => t.taskId === parseInt(value));
      if (task) updated.isBillable = task.billable;
    }

    setAddData(updated);
  };

  // validation (works for both addData and editData shapes)
  const isValid = (data) => {
    const { projectId, taskId, fromTime, toTime, workType } = data || {};
    if (!projectId) {
      showStatusToast("Please select a project", "error");
      return false;
    }
    if (!taskId) {
      showStatusToast("Please select a task", "error");
      return false;
    }
    if (!fromTime) {
      showStatusToast("Please select a start time", "error");
      return false;
    }
    if (!toTime) {
      showStatusToast("Please select an end time", "error");
      return false;
    }
    if (!workType) {
      showStatusToast("Please select a work type", "error");
      return false;
    }

    // compare times reliably
    const from = new Date(`1970-01-01T${fromTime}:00`);
    const to = new Date(`1970-01-01T${toTime}:00`);
    if (isNaN(from) || isNaN(to) || from >= to) {
      showStatusToast("Start time must be before End time", "error");
      return false;
    }

    return true;
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
            workLocation: editData.workType,
            description: editData.description,
            id: editData.timesheetEntryId,
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

  function parseToLocalTime(datetimeString) {
    if (!datetimeString) return null;

    try {
      // If it's just a time string (HH:MM:SS or HH:MM:SS.mmm), treat it as today's time
      if (/^\d{2}:\d{2}:\d{2}(\.\d{3})?$/.test(datetimeString)) {
        const today = new Date();
        const [hours, minutes, seconds] = datetimeString.split(":");
        const date = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds.split(".")[0])
        );
        return date;
      }

      // If the string doesn't end with 'Z' or a timezone offset, assume it's UTC and add 'Z'
      const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(datetimeString)
        ? datetimeString
        : datetimeString + "Z";

      return new Date(normalized);
    } catch (error) {
      console.error("Error parsing time:", datetimeString, error);
      return null;
    }
  }

  // Add-entry: validate and push to pendingEntries
  const handleAddEntry = () => {
    if (!isValid(addData)) return;
    // const newStart = new Date(`${workDate}T${addData.fromTime}`);
    // const newEnd = new Date(`${workDate}T${addData.toTime}`);
    if (hasOverlap(addData.fromTime, addData.toTime)) {
      showStatusToast("Time overlap detected with another entry!", "error");
      return;
    }
    setPendingEntries((prev) => [
      ...prev,
      {
        ...addData,
        projectId: parseInt(addData.projectId),
        taskId: parseInt(addData.taskId),
        fromTime: addData.fromTime,
        toTime: addData.toTime,
        isBillable: addData.isBillable === "Yes",
        workLocation: addData.workType,
      },
    ]);
    // hide add-row and reset
    setAddingNewEntry(false);
    setAddData({ workType: "Office", isBillable: "Yes" });
  };

  return (
    <table className="w-full border-collapse rounded">
      <thead>
        <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
          {selectionMode && (
            <th className="px-4 py-2">
              <input
                type="checkbox"
                title="Select All"
                checked={
                  entries.length > 0 &&
                  selectedEntryIds.length === entries.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedEntryIds(
                      entries.map((entry) => entry.timesheetEntryId)
                    );
                  } else {
                    setSelectedEntryIds([]);
                  }
                }}
              />
            </th>
          )}
          <th className="text-left px-4 py-2">Project</th>
          <th className="text-left px-4 py-2">Task</th>
          <th className="text-left px-4 py-2">Start</th>
          <th className="text-left px-4 py-2">End</th>
          <th className="text-left px-4 py-2">Work Location</th>
          <th className="text-left px-4 py-2">Description</th>
          <th className="text-left px-4 py-2">Billable</th>
          {window.location.pathname !== "/managerapproval" && (
            <th className="text-left px-4 py-2">Actions</th>
          )}
        </tr>
      </thead>

      {/* ----------------- tbody: mapped rows + add-row (if any) ----------------- */}
      <tbody>
        {[...entries, ...pendingEntries].map((entry, idx) => (
          <tr
            key={entry.timesheetEntryId || `new-${idx}`}
            className={`text-sm ${
              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
            } hover:bg-blue-50 transition`}
          >
            {selectionMode && (
              <td className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedEntryIds.includes(
                    entry.timesheetEntryId || `new-${idx}`
                  )}
                  onChange={(e) =>
                    toggleCheckbox(
                      entry.timesheetEntryId || `new-${idx}`,
                      e.target.checked
                    )
                  }
                />
              </td>
            )}

            {editIndex === idx ? (
              <>
                <td className="px-4 py-2">
                  <FormSelect
                    name="projectId"
                    value={editData.projectId}
                    options={projectOptions}
                    onChange={handleChange}
                  />
                </td>
                <td className="px-4 py-2">
                  <FormSelect
                    name="taskId"
                    value={editData.taskId}
                    options={getTaskOptions(editData.projectId)}
                    onChange={handleChange}
                  />
                </td>
                <td className="px-4 py-2">
                  <FormTime
                    name="fromTime"
                    value={editData.fromTime}
                    onChange={handleChange}
                  />
                </td>
                <td className="px-4 py-2">
                  <FormTime
                    name="toTime"
                    value={editData.toTime}
                    onChange={handleChange}
                  />
                </td>
                <td className="px-4 py-2">
                  <FormSelect
                    name="workType"
                    value={editData.workType}
                    options={workTypeOptions}
                    onChange={handleChange}
                  />
                </td>
                <td className="px-4 py-2">
                  <FormInput
                    name="description"
                    value={editData.description}
                    onChange={handleChange}
                  />
                </td>
                <td className="px-4 py-2">
                  {editData.isBillable}
                </td>
                {window.location.pathname !== "/managerapproval" && (
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button className="text-green-500" onClick={handleSave}>
                        <Check />
                      </button>
                      <button className="text-red-500" onClick={handleCancel}>
                        <X />
                      </button>
                    </div>
                  </td>
                )}
              </>
            ) : (
              <>
                <td className="px-4 py-2">
                  {entry.projectName ||
                    projectIdToName[entry.projectId] ||
                    "N/A"}
                </td>
                <td className="px-4 py-2">
                  {entry.taskName || taskIdToName[entry.taskId] || "N/A"}
                </td>
                <td className="px-4 py-2">{prettyTime(entry.fromTime)}</td>
                <td className="px-4 py-2">{prettyTime(entry.toTime)}</td>
                <td className="px-4 py-2">{mapWorkType(entry.workLocation)}</td>
                <td className="px-4 py-2">{entry.description}</td>
                <td className="px-4 py-2">{entry.isBillable ? "Yes" : "No"}</td>
                {window.location.pathname !== "/managerapproval" && (
                  <td className="px-4 py-2">
                    {status?.toLowerCase() !== "approved" && (
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => handleEditClick(idx)}
                        title="Edit entry"
                      >
                        <Pencil className="inline w-4 h-4" />
                      </button>
                    )}
                  </td>
                )}
              </>
            )}
          </tr>
        ))}

        {/* ←──────── Moved the add-row INSIDE tbody so it renders correctly ───────→ */}
        {addingNewEntry && (
          <tr
            key="add-new"
            className="text-sm bg-white hover:bg-blue-50 transition"
          >
            {selectionMode && <td className="px-4 py-2"></td>}
            <td className="px-4 py-2">
              <FormSelect
                name="projectId"
                value={addData.projectId || ""}
                options={projectOptions}
                onChange={handleAddChange}
              />
            </td>
            <td className="px-4 py-2">
              <FormSelect
                name="taskId"
                value={addData.taskId || ""}
                options={getTaskOptions(addData.projectId)}
                onChange={handleAddChange}
              />
            </td>
            <td className="px-4 py-2">
              <FormTime
                name="fromTime"
                value={addData.fromTime || ""}
                onChange={handleAddChange}
              />
            </td>
            <td className="px-4 py-2">
              <FormTime
                name="toTime"
                value={addData.toTime || ""}
                onChange={handleAddChange}
              />
            </td>
            <td className="px-4 py-2">
              <FormSelect
                name="workType"
                value={addData.workType}
                options={workTypeOptions}
                onChange={handleAddChange}
              />
            </td>
            <td className="px-4 py-2">
              <FormInput
                name="description"
                value={addData.description || ""}
                onChange={handleAddChange}
              />
            </td>
            <td className="px-4 py-2">
              {/* <FormSelect
                name="isBillable"
                value={addData.isBillable}
                options={billableOptions}
                onChange={handleAddChange}
              /> */}
              {addData.projectId &&
              taskIdToBillablity[addData.taskId] !== undefined
                ? taskIdToBillablity[addData.taskId]
                  ? "Yes"
                  : "No"
                : "N/A"}
            </td>
            <td className="px-4 py-2">
              <div className="flex gap-2">
                <button className="text-green-500" onClick={handleAddEntry}>
                  <Check />
                </button>
                <button className="text-red-500" onClick={handleCancel}>
                  <X />
                </button>
              </div>
            </td>
          </tr>
        )}
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
                      await addEntryToTimesheet(
                        timesheetId,
                        workDate,
                        pendingEntries.map((entry) => ({
                          ...entry,
                          fromTime: new Date(
                            `${workDate}T${entry.fromTime}`
                          ).toISOString(),
                          toTime: new Date(
                            `${workDate}T${entry.toTime}`
                          ).toISOString(),
                        }))
                      );
                      setPendingEntries([]);
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
