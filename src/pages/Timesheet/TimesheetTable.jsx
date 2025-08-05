import React from "react";
import Table from "../../components/Table/table";
import Pagination from "../../components/Pagination/pagination";


const calculateTotalHours = (entries) => {
  let totalMinutes = 0;
  entries.forEach(entry => {
    const start = new Date(entry.fromTime);
    const end = new Date(entry.toTime);
    const diffMinutes = (end - start) / (1000 * 60);
    totalMinutes += diffMinutes;
  });
  return (totalMinutes / 60).toFixed(2); // Returns hours with 2 decimals
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
  const headers = ["Timesheet ID", "Date","Hours worked", "Status"];

  return (
    <div
      style={{
        background: "#fff",
        padding: "24px",
        margin: "32px 0",
        borderRadius: 10,
        boxShadow: "0 1px 6px #e4e7ee",
      }}
    >
      {loading ? (
        <div className="text-center text-gray-500">Loading timesheet entries...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-gray-500">No timesheet entries found.</div>
      ) : (
        <>
          <Table
            headers={headers}
            rows={data}
            renderRow={(row) => (
              <>
                <td className="border p-2">{row.timesheetId}</td>
                <td className="border p-2">{row.workDate}</td>
                <td className="border p-2">{calculateTotalHours(row.entries)}</td>
                <td className="border p-2">{row.approvalStatus}</td>                
              </>
            )}
            renderExpandedRow={(row) => (
              <div>
                
                <h4 className="font-semibold mb-2">Detailed Entries: </h4>
                <table className="w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Project</th>
                      <th className="border p-2">Task</th>
                      <th className="border p-2">Start</th>
                      <th className="border p-2">End</th>
                      <th className="border p-2">Work Type</th>
                      <th className="border p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {row.entries.map((entry, idx) => (
                      <tr key={idx}>
                        <td className="border p-2">
                          {projectIdToName[entry.projectId] || `Project-${entry.projectId}`}
                        </td>
                        <td className="border p-2">
                          {taskIdToName[entry.taskId] || `Task-${entry.taskId}`}
                        </td>
                        <td className="border p-2">
                         {new Date(entry.fromTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="border p-2">
                         {new Date(entry.toTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="border p-2">{mapWorkType(entry.workType)}</td>
                        <td className="border p-2">{entry.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          />

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
