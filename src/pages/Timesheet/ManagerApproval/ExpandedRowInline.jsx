import React from "react";
import { Check, X } from "lucide-react";

const ExpandedRowInline = ({
  entries,
  projectIdToName,
  taskIdToName,
  onApprove,
  onReject,
  timesheetId,
}) => {
  return (
    <div className="bg-white p-4 rounded-md shadow border border-gray-200">
      <h4 className="text-md font-semibold mb-4 text-gray-800">
        Timesheet Entries
      </h4>
      <table className="w-full border-collapse rounded overflow-hidden">
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
          {entries.map((entry, idx) => (
            <tr
              key={entry.timesheetEntryId}
              className={`text-sm ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-blue-50 transition`}
            >
              <td className="px-4 py-2 border-b border-gray-200">
                {projectIdToName?.[entry.projectId] ||
                  `Project-${entry.projectId}`}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {taskIdToName?.[entry.taskId] || `Task-${entry.taskId}`}
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
                {entry.workType}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {entry.description}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(timesheetId)}
                    className="text-green-500 hover:text-green-700"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onReject(timesheetId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpandedRowInline;
