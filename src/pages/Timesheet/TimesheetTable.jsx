                
import React, { useState } from "react";
import Table from "../../components/Table/table";
import Pagination from "../../components/Pagination/pagination";
import { ChevronDown, ChevronRight } from "lucide-react";

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

const mapStatus = (status) => {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "REJECT":
      return "Rejected"; // If you want full word
    case "PENDING":
      return "Pending";
    default:
      return status;
  }
};


const TimesheetTable = ({
  loading,
  data,
  totalPages,
  currentPage,
  setCurrentPage,
  projectIdToName,
  taskIdToName,
  mapWorkType,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const headers = ["", "Timesheet ID", "Date", "Hours Worked", "Status"];

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "24px",
        margin: "32px 0",
        borderRadius: 10,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      {loading ? (
        <div className="text-center text-gray-500">Loading timesheet entries...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-gray-500">No timesheet entries found.</div>
      ) : (
        <>
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gradient-to-r  from-blue-900 to-indigo-900 bg-blue-900  text-white text-sm">
                {headers.map((h, i) => (
                  <th key={i} className="text-left px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <React.Fragment key={row.timesheetId}>
                  <tr
                    className={`hover:bg-blue-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td
                      className="p-3 text-center cursor-pointer"
                      onClick={() => toggleRow(row.timesheetId)}
                    >
                      {expandedRow === row.timesheetId ? (
                        <ChevronDown className="w-5 h-5 text-blue-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-blue-500" />
                      )}
                    </td>
                    <td className="p-3 font-medium text-gray-700">{row.timesheetId}</td>
                    <td className="p-3 text-gray-600">{row.workDate}</td>
                    <td className="p-3 text-gray-600">{calculateTotalHours(row.entries)}</td>
                    <td
                      className={`p-3 font-semibold ${
                        row.approvalStatus === "APPROVED"
                          ? "text-green-600"
                          : row.approvalStatus === "REJECTED"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                    {mapStatus(row.approvalStatus)}
                    </td>
                  </tr>
                  {expandedRow === row.timesheetId && (
                    <tr>
                    <td colSpan={5} className="p-4 bg-gray-100 border-t border-gray-300">
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <h4 className="font-semibold mb-4 text-gray-800 text-md">
                     Detailed Entries
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
                    </tr>
                    </thead>
                    <tbody>
                    {row.entries.map((entry, idx) => (
                    <tr
                    key={idx}
                                    className={`text-sm ${
                                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    } hover:bg-blue-50 transition`}
                    >
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
                    <td className="px-4 py-2 border-b border-gray-200">{mapWorkType(entry.workType)}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">{entry.description}
                    </td>
                    </tr>

                    ))}
                    </tbody>
                    </table>
                    </div>
                    </td>
                    </tr>

                    )}
                
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          />
        </>
      )}
    </div>
  );
};

export default TimesheetTable;

