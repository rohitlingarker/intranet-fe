import React, { useState, useEffect } from "react";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTime from "../../components/forms/FormTime";
import { addEntryToTimesheet, updateTimesheet } from "./api";
import { Pencil, Check, X } from "lucide-react";
import { showStatusToast } from "../../components/toastfy/toast";
import Button from "../../components/Button/Button";
// inside EntriesTable component (place near other helpers)



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
const safeCombineDateTime = (dateString, timeString) => {
  try {
    // Case 1: If timeString is already an ISO string
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      if (!isNaN(date)) return date;
    }

    // Case 2: If timeString is plain "HH:mm"
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return new Date(`${dateString}T${timeString}:00`);
    }

    // Case 3: If something else (fallback)
    const fallback = new Date(timeString);
    if (!isNaN(fallback)) return fallback;

    throw new Error(`Invalid time format: ${timeString}`);
  } catch (err) {
    console.error("safeCombineDateTime error:", dateString, timeString, err);
    return null;
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
  const [submitting, setSubmitting] = useState(false);
  // Submit pending entries one-by-one and avoid duplicates
  const submitPendingEntries = async () => {
    if (pendingEntries.length === 0) {
      showStatusToast("No new entries to submit.", "info");
      return;
    }

    setSubmitting(true);

    // Make a shallow copy so we can update state as we go
    let currentPending = [...pendingEntries];

    // We'll collect tempIds of successes to remove later
    const succeededTempIds = [];
    const failedTempIds = [];

    for (const entry of currentPending) {
      // only attempt entries that are new or previously failed
      if (!entry._isNew && !entry._failedOnce) continue;

      // prevent double-submit for same tempId
      if (entry._submitting) continue;

      // mark as submitting in state
      setPendingEntries((prev) =>
        prev.map((p) =>
          p._tempId === entry._tempId ? { ...p, _submitting: true } : p
        )
      );

      // safe combine times
      const from = safeCombineDateTime(workDate, entry.fromTime);
      const to = safeCombineDateTime(workDate, entry.toTime);

      if (!from || !to) {
        // invalid — mark failed and continue
        failedTempIds.push(entry._tempId);
        setPendingEntries((prev) =>
          prev.map((p) =>
            p._tempId === entry._tempId
              ? { ...p, _failedOnce: true, _submitting: false }
              : p
          )
        );
        continue;
      }

      const payload = {
        ...entry,
        fromTime: from.toISOString(),
        toTime: to.toISOString(),
      };

      try {
        // Call API for one entry at a time so failures don't block others.
        // If your backend supports batch create, you can adjust to send a small batch.
        await addEntryToTimesheet(timesheetId, workDate, [
          {
            projectId: parseInt(payload.projectId),
            taskId: parseInt(payload.taskId),
            fromTime: payload.fromTime,
            toTime: payload.toTime,
            billable: !!payload.billable,
            workLocation: payload.workLocation,
            description: payload.description || "",
          },
        ]);

        succeededTempIds.push(entry._tempId);

        // remove this entry from pendingEntries immediately
        setPendingEntries((prev) =>
          prev.filter((p) => p._tempId !== entry._tempId)
        );
      } catch (err) {
        console.error("submit entry failed:", entry._tempId, err);
        failedTempIds.push(entry._tempId);

        // mark failed so user can retry
        setPendingEntries((prev) =>
          prev.map((p) =>
            p._tempId === entry._tempId
              ? { ...p, _failedOnce: true, _submitting: false }
              : p
          )
        );
      }
    }

    setSubmitting(false);

    if (succeededTempIds.length > 0) {
      showStatusToast(
        `Submitted ${succeededTempIds.length} entr${
          succeededTempIds.length > 1 ? "ies" : "y"
        } successfully`,
        "success"
      );
    }

    if (failedTempIds.length > 0) {
      showStatusToast(
        `${failedTempIds.length} entr${
          failedTempIds.length > 1 ? "ies" : "y"
        } failed to submit — please correct and retry.`,
        "error"
      );
    }

    // After attempts, refresh the data (successful ones will now be in backend)
    if (succeededTempIds.length > 0) await refreshData();
  };

  // ✅ Converts a backend UTC datetime string (e.g. "2025-11-10T04:30:00Z")
  //    to a local "HH:mm" string that will show correctly in <input type="time">
  const toLocalTimeString = (utcString) => {
    if (!utcString) return "";
    try {
      // Ensure it's treated as UTC — even if backend sends without "Z"
      const utcDate = utcString.endsWith("Z")
        ? new Date(utcString)
        : new Date(utcString + "Z");

      const localHours = utcDate.getHours().toString().padStart(2, "0");
      const localMinutes = utcDate.getMinutes().toString().padStart(2, "0");
      return `${localHours}:${localMinutes}`;
    } catch (err) {
      console.error("Error converting UTC to local:", utcString, err);
      return "";
    }
  };

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

    const combined = [...entries, ...pendingEntries];
    const entry = combined[idx];

    if (!entry) return;

    setEditIndex(idx);
    setAddingNewEntry(false);

    setEditData({
      timesheetEntryId: entry.timesheetEntryId,
      _isNew: entry._isNew || false,
      _tempId: entry._tempId,
      projectId: entry.projectId,
      taskId: entry.taskId,
      fromTime: entry._isNew
        ? entry.fromTime
        : toLocalTimeString(entry.fromTime),
      toTime: entry._isNew ? entry.toTime : toLocalTimeString(entry.toTime),
      workType: entry.workLocation || entry.workType,
      description: entry.description,
      isBillable: entry.billable ?? entry.isBillable,
    });
  };

  const handleCancel = () => {
    // If editing a new pending entry → remove it entirely
    if (editData._isNew) {
      setPendingEntries((prev) =>
        prev.filter((p) => p._tempId !== editData._tempId)
      );
    }

    // Reset editing state
    setEditIndex(null);
    setEditData({});
    setAddingNewEntry(false);

    // Also hide the submit button if no pending entries left
    if (pendingEntries.length <= 1) setPendingEntries([]);
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

    const payloadEntry = {
      projectId: parseInt(editData.projectId),
      taskId: parseInt(editData.taskId),
      fromTime: newStart.toISOString(),
      toTime: newEnd.toISOString(),
      billable: !!editData.isBillable,
      workLocation: editData.workType,
      description: editData.description,
    };

    try {
      if (editData._isNew) {
        // 🟡 Update local entry or add new — but keep `_failedOnce` if it already existed
        setPendingEntries((prev) => {
          const updated = prev.map((p) =>
            p._tempId === editData._tempId
              ? {
                  ...p,
                  ...payloadEntry,
                  _isNew: true,
                  _failedOnce: p._failedOnce || false, // ✅ preserve failed state
                }
              : p
          );

          const exists = prev.some((p) => p._tempId === editData._tempId);
          return exists
            ? updated
            : [
                ...prev,
                {
                  ...payloadEntry,
                  _isNew: true,
                  _failedOnce: false,
                  _tempId: `temp-${Date.now()}`,
                },
              ];
        });

        showStatusToast(
          "Entry saved locally. Click 'Submit Timesheet' to sync.",
          "info"
        );
      } else {
        // 🟩 Existing backend entry → update immediately
        await updateTimesheet(timesheetId, {
          workDate,
          status,
          entries: [
            {
              ...payloadEntry,
              id: editData.timesheetEntryId,
            },
          ],
        });
        showStatusToast("Entry updated successfully", "success");
        refreshData();
      }

      setEditIndex(null);
      setEditData({});
    } catch (err) {
      showStatusToast("Failed to save entry locally.", "error");
    }
  };

  // Add-entry: validate and push to pendingEntries
  const handleAddEntry = () => {
    if (!isValid(addData)) return;

    const newEntry = {
      ...addData,
      projectId: parseInt(addData.projectId),
      taskId: parseInt(addData.taskId),
      fromTime: addData.fromTime,
      toTime: addData.toTime,
      billable: !!addData.isBillable,
      workLocation: addData.workType,
      _isNew: true, // 👈 mark this as new (unsaved)
      _tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    setPendingEntries((prev) => [...prev, newEntry]);
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
            key={entry.timesheetEntryId ?? entry._tempId ?? `new-${idx}`}
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
                  <td className="px-4 py-2">
                    {(
                      editData.isBillable !== undefined
                        ? editData.isBillable
                        : entry.isBillable
                    )
                      ? "Yes"
                      : "No"}
                  </td>
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
                  disabled={submitting}
                  onClick={submitPendingEntries}
                >
                  {submitting ? "Submitting..." : "Submit Timesheet"}
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
