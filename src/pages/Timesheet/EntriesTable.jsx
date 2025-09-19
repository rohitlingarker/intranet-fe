import React, { useState, useEffect } from "react";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTime from "../../components/forms/FormTime";
import { addEntryToTimesheet, fetchProjectTaskInfo, updateTimesheet } from "./api";
import { Pencil, Check, X } from "lucide-react";
import { showStatusToast } from "../../components/toastfy/toast";

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
}) => {
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const [addData, setAddData] = useState({workType:"Office"});

  userId = userId || 1; // Default to 1 if not provided

  useEffect(() => {
    if (!addingNewEntry) setEditIndex(null);
  }, [addingNewEntry]);

  

  const workTypeOptions = [
    { label: "Office", value: "Office" },
    { label: "Home", value: "Home" },
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

  const handleEditClick = (idx) => {
    if (addingNewEntry) return;
    if (status === "Approved") return;
    console.log(status);

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
    });
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditData({});
    setAddingNewEntry(false);
    setAddData({workType:"Office"});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (addingNewEntry) setAddData((prev) => ({ ...prev, [name]: value }));
    else setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = (data) => {
    const { projectId, taskId, fromTime, toTime, workType } = data;
    return (
      projectId && taskId && fromTime && toTime && workType && fromTime < toTime
    );
  };

  const handleSave = async () => {
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
          hoursWorked: 0, // server may recalculate
          fromTime: new Date(`${workDate}T${editData.fromTime}`).toISOString(),
          toTime: new Date(`${workDate}T${editData.toTime}`).toISOString(),
          otherDescription: "",
        },
      ],
    };

    try {
      await updateTimesheet(timesheetId, payload);
      setEditIndex(null);
      setEditData({});
      refreshData(); // Reload entries after update
    } catch (err) {
      showStatusToast("Failed to update entry", "error");
    }
  };

  const handleAddEntry = async () => {
    const payload = [
      {
        projectId: parseInt(addData.projectId),
        taskId: parseInt(addData.taskId),
        description: addData.description,
        workType: addData.workType,
        hoursWorked: 0, // server may recalculate
        fromTime: new Date(`${workDate}T${addData.fromTime}`).toISOString(),
        toTime: new Date(`${workDate}T${addData.toTime}`).toISOString(),
        otherDescription: "",
      },
    ];

    try {
      await addEntryToTimesheet(timesheetId, workDate, payload);
      setAddingNewEntry(false);
      setAddingNewTimesheet(false);
      setAddData({workType:"Office"});
      refreshData(); // Reload entries after update
    } catch (err) {
      showStatusToast("Failed to update entry", "error");
    }
  };

  return (
    // <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
    //   <h4 className="font-semibold mb-4 text-gray-800 text-md">
    //     Detailed Entries
    //   </h4>
    <table className="w-full border-collapse rounded ">
      <thead>
        <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
          <th className="text-left px-4 py-2">Project</th>
          <th className="text-left px-4 py-2">Task</th>
          <th className="text-left px-4 py-2">Start</th>
          <th className="text-left px-4 py-2">End</th>
          <th className="text-left px-4 py-2">Work Type</th>
          <th className="text-left px-4 py-2">Description</th>
          <th className="text-left px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {entries.length === 0 && <tr></tr>}
        {entries.map((entry, idx) => (
          <tr
            key={entry.timesheetEntryId}
            className={`text-sm ${
              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
            } hover:bg-blue-50 transition`}
          >
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
                <td className="px-4 py-2 text-xs">
                  <div className="flex gap-2">
                    <button
                      className="text-green-500"
                      disabled={!isValid(editData)}
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
                  {projectIdToName[entry.projectId] ||
                    `Project-${entry.projectId}`}
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
                <td className="px-4 py-2">
                  <button
                    className={`text-blue-600 hover:underline text-sm ${
                      status === "Approved"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
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
                <div className="flex gap-2">
                  <button
                    className="text-green-500"
                    disabled={!isValid(addData)}
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
    </table>
    // </div>
  );
};

export default EntriesTable;
