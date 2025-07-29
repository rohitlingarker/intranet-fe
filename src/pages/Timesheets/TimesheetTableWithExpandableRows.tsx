import React, { useState } from "react";

export interface Timesheet {
  timesheetId: number;
  workDate: string;
  approvalStatus: "APPROVED" | "REJECTED" | "PENDING";
  entries: TimesheetEntry[];
}

export interface TimesheetEntry {
  projectId: number;
  project: string;
  taskId: number;
  description: string;
  workType: string;
  fromTime: string;
  toTime: string;
  hoursWorked: number;
  otherDescription?: string;
}

interface Props {
  timesheets: Timesheet[];
  projectIdToName: Record<number, string>;
  taskIdToName: Record<number, string>;
}

const formatTimeHHMM = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};


const mapWorkType = (type: string) => {
  switch (type) {
    case "WFO":
      return "Office";
    case "WFH":
      return "Home";
    case "HYBRID":
      return "Hybrid";
    default:
      return type;
  }
};

const TimesheetTableWithExpandableRows: React.FC<Props> = ({
  timesheets,
  projectIdToName,
  taskIdToName,
}) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg overflow-hidden">
      <thead className="bg-[#b22a4f] text-white">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase">
            Timesheet ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase">
            Work Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase">
            Total Hours
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {timesheets.map((sheet) => (
          <React.Fragment key={sheet.timesheetId}>
            <tr
              onClick={() => toggleExpand(sheet.timesheetId)}
              className="cursor-pointer hover:bg-gray-50 even:bg-white odd:bg-gray-100"
            >
              <td className="px-6 py-3">{sheet.timesheetId}</td>
              <td className="px-6 py-3">{sheet.workDate}</td>
              <td className="px-6 py-3">
                  {sheet.entries.reduce((sum, e) => sum + e.hoursWorked, 0)}
                </td>
              <td className="px-6 py-3 flex justify-between items-center">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    sheet.approvalStatus === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : sheet.approvalStatus === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {sheet.approvalStatus}
                </span>
              </td>
                
            </tr>

            {expanded === sheet.timesheetId && (
              <tr>
                <td colSpan={4} className="px-6 pb-4 bg-gray-100">
                  <div className="rounded-b-lg overflow-hidden shadow-inner border border-gray-300 bg-white">
                    <table className="min-w-full">
                      <thead className="bg-[#263383] border-b border-gray-300">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                            Project
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                            Task
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                            Description
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                            Work Type
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                            Hours
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                            From
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                            To
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sheet.entries.map((entry, i) => (
                          <tr
                            key={i}
                            className={
                              i % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50 border-t border-gray-200"
                            }
                          >
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {projectIdToName[entry.projectId]}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {taskIdToName[entry.taskId]}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {entry.description}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {mapWorkType(entry.workType)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {entry.hoursWorked}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {(entry.fromTime && formatTimeHHMM(entry.fromTime)) || "N/A"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {(entry.toTime && formatTimeHHMM(entry.toTime)) || "N/A"}
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
  );
};

export default TimesheetTableWithExpandableRows;
