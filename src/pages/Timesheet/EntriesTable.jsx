import React from "react";
import { showStatusToast } from "../../components/toastfy/toast";

const EntriesTable = ({
  entries,
  projectIdToName,
  taskIdToName,
  mapWorkType,
}) => {
  return (
    // <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
    //   <h4 className="font-semibold mb-4 text-gray-800 text-md">
    //     Detailed Entries
    //   </h4>
      <table className="w-full border-collapse  overflow-hidden">
        <thead>
          <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
            <th className="text-left px-4 py-2">Project</th>
            <th className="text-left px-4 py-2">Task</th>
            <th className="text-left px-4 py-2">Start</th>
            <th className="text-left px-4 py-2">End</th>
            <th className="text-left px-4 py-2">Work Type</th>
            <th className="text-left px-4 py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr
              key={idx}
              className={`text-sm ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-blue-50 transition`}
              
            >
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
            </tr>
          ))}
        </tbody>
      </table>
//     </div>
  );
};

export default EntriesTable;
