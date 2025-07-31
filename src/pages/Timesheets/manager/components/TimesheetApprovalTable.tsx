import React, { useState } from "react";
import { TimeSheetHistoryDTO, GroupedTimesheets } from "../types/TimesheetTypes";
import ApproveRejectButtons from "./ApproveRejectButtons";
import jsPDF from "jspdf";

import Papa from "papaparse";
import "./../styles/TimesheetManager.css";

// Sample mock data
const mockData: GroupedTimesheets[] = [
  {
    employeeId: 1,
    employeeName: "John Doe",
    timesheets: [
      {
        timesheetId: 1,
        employeeId: 1,
        employeeName: "John Doe",
        workDate: "2025-07-26",
        createdAt: "2025-07-26T09:30:00",
        entries: [
          {
            projectId: 1,
            taskId: 1,
            description: "TESTING",
            workType: "Office",
            hoursWorked: 3,
            otherDescription: "",
            projectName: "Intranet Portal",
            taskName: "UI Design",
            from: "16:45",
            to: "19:45",
          },
          {
            projectId: 2,
            taskId: 2,
            description: "TESTING",
            workType: "Office",
            hoursWorked: 3,
            otherDescription: "",
            projectName: "HR Dashboard",
            taskName: "API Integration",
            from: "16:45",
            to: "19:45",
          },
        ],
        approvals: [],
        status: "Pending",
        id: undefined
      },
    ],
  },
  {
    employeeId: 2,
    employeeName: "Jane Smith",
    timesheets: [
      {
        timesheetId: 2,
        employeeId: 2,
        employeeName: "Jane Smith",
        workDate: "2025-07-27",
        createdAt: "2025-07-27T11:00:00",
        entries: [],
        approvals: [],
        status: "Pending",
        id: undefined
      },
    ],
  },
];

const TimesheetApprovalTable: React.FC = () => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [employeeFilter, setEmployeeFilter] = useState<number | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApprove = (employeeId: number, timesheetId: number) => {
    const emp = mockData.find((g) => g.employeeId === employeeId);
    const ts = emp?.timesheets.find((t) => t.timesheetId === timesheetId);
    if (ts) ts.status = "Approved";
  };

  const handleReject = (employeeId: number, timesheetId: number) => {
    const emp = mockData.find((g) => g.employeeId === employeeId);
    const ts = emp?.timesheets.find((t) => t.timesheetId === timesheetId);
    if (ts) ts.status = "Rejected";
  };

  const filteredData = mockData
    .filter((emp) => employeeFilter === "all" || emp.employeeId === employeeFilter)
    .map((emp) => ({
      ...emp,
      timesheets: emp.timesheets.filter((ts) =>
        projectFilter === "all"
          ? true
          : ts.entries.some((e) =>
              e.projectName.toLowerCase().includes(projectFilter.toLowerCase())
            )
      ),
    }))
    .filter((emp) => emp.timesheets.length > 0);

  const uniqueProjects = Array.from(
    new Set(
      mockData.flatMap((g) =>
        g.timesheets.flatMap((t) => t.entries.map((e) => e.projectName))
      )
    )
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Timesheet Report", 14, 16);

    filteredData.forEach((group, index) => {
      group.timesheets.forEach((ts, tsIndex) => {
        autoTable(doc, {
          startY: 25 + index * 60 + tsIndex * 50,
          head: [["Project", "Task", "Description", "Work Type", "Hours", "From", "To"]],
          body: ts.entries.map((e) => [
            e.projectName,
            e.taskName,
            e.description,
            e.workType,
            e.hoursWorked,
            e.from,
            e.to,
          ]),
          theme: "striped",
          margin: { top: 20 },
          didDrawPage: (data) => {
            doc.setFontSize(12);
            doc.text(
              `Employee: ${group.employeeName}, Timesheet #${ts.timesheetId}, Date: ${ts.workDate}`,
              14,
              data.settings.startY - 10
            );
          },
        });
      });
    });

    doc.save("timesheet-report.pdf");
  };

  const exportToCSV = () => {
    const rows: any[] = [];

    filteredData.forEach((emp) => {
      emp.timesheets.forEach((ts) => {
        ts.entries.forEach((e) => {
          rows.push({
            Employee: emp.employeeName,
            TimesheetID: ts.timesheetId,
            WorkDate: ts.workDate,
            Project: e.projectName,
            Task: e.taskName,
            Description: e.description,
            WorkType: e.workType,
            Hours: e.hoursWorked,
            From: e.from,
            To: e.to,
            Status: ts.status,
          });
        });
      });
    });

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "timesheet-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="approval-table">
      <div className="filter-section" style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
        <div>
          <label>Project: </label>
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="all">All</option>
            {uniqueProjects.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <label style={{ marginLeft: "1rem" }}>Employee: </label>
          <select
            value={employeeFilter}
            onChange={(e) =>
              setEmployeeFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))
            }
          >
            <option value="all">All</option>
            {mockData.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.employeeName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button className="btn btn-success" onClick={exportToPDF}>
            Export PDF
          </button>
          <button className="btn btn-secondary" onClick={exportToCSV} style={{ marginLeft: "1rem" }}>
            Export CSV
          </button>
        </div>
      </div>

      {filteredData.map((group) =>
        group.timesheets.map((ts) => (
          <div key={ts.timesheetId} className="employee-group">
            <div className="employee-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button className="toggle-btn" onClick={() => toggleExpand(ts.timesheetId)}>
                {expanded[ts.timesheetId] ? "▼" : "▶"} {group.employeeName} - Timesheet #{ts.timesheetId} | Date: {ts.workDate}
              </button>
              {ts.status === "Pending" ? (
                <ApproveRejectButtons
                  employeeId={group.employeeId}
                  timesheetId={ts.timesheetId}
                  onApprove={() => handleApprove(group.employeeId, ts.timesheetId)}
                  onReject={() => handleReject(group.employeeId, ts.timesheetId)}
                />
              ) : (
                <button className="btn btn-secondary" onClick={() => alert(`Reviewing Timesheet #${ts.timesheetId}`)}>
                  Review
                </button>
              )}
            </div>
            {expanded[ts.timesheetId] && (
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Description</th>
                    <th>Work Type</th>
                    <th>Hours</th>
                    <th>From</th>
                    <th>To</th>
                  </tr>
                </thead>
                <tbody>
                  {ts.entries.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.projectName}</td>
                      <td>{e.taskName}</td>
                      <td>{e.description}</td>
                      <td>{e.workType}</td>
                      <td>{e.hoursWorked}</td>
                      <td>{e.from}</td>
                      <td>{e.to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TimesheetApprovalTable;
function autoTable(doc: any, arg1: { startY: number; head: string[][]; body: (string | number)[][]; theme: string; margin: { top: number; }; didDrawPage: (data: any) => void; }) {
  throw new Error("Function not implemented.");
}

