import React, { useState } from "react";
import { TimesheetGroup } from "../types/TimesheetTypes";
import ApproveRejectButtons from "./ApproveRejectButtons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import "./../styles/TimesheetManager.css";

const mockData: TimesheetGroup[] = [
  {
    employeeId: 1,
    employeeName: "John Doe",
    timesheets: [
      {
        taskId: 101,
        projectName: "Project Alpha",
        projectId: 1,
        taskDescription: "API Development",
        hours: 5,
        status: "Pending",
        logDateTime: "2025-07-25T10:30:00",
        logDate: "",
        logTime: ""
      },
      {
        taskId: 102,
        projectName: "Project Alpha",
        projectId: 1,
        taskDescription: "Bug Fixes",
        hours: 3,
        status: "Pending",
        logDateTime: "2025-07-25T11:00:00",
        logDate: "",
        logTime: ""
      },
    ],
  },
  {
    employeeId: 2,
    employeeName: "Jane Smith",
    timesheets: [
      {
        taskId: 103,
        projectName: "Project Beta",
        projectId: 2,
        taskDescription: "UI Design",
        hours: 4,
        status: "Pending",
        logDateTime: "2025-07-24T15:45:00",
        logDate: "",
        logTime: ""
      },
    ],
  },
];

const TimesheetApprovalTable: React.FC = () => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<number | "all">("all");

  const toggleExpand = (employeeId: number) => {
    setExpanded((prev) => ({ ...prev, [employeeId]: !prev[employeeId] }));
  };

  const handleApprove = (empId: number, taskId: number) => {
    const groupIndex = mockData.findIndex((g) => g.employeeId === empId);
    if (groupIndex !== -1) {
      const entryIndex = mockData[groupIndex].timesheets.findIndex((t) => t.taskId === taskId);
      if (entryIndex !== -1) {
        mockData[groupIndex].timesheets[entryIndex].status = "Approved";
      }
    }
  };

  const handleReject = (empId: number, taskId: number) => {
    const groupIndex = mockData.findIndex((g) => g.employeeId === empId);
    if (groupIndex !== -1) {
      const entryIndex = mockData[groupIndex].timesheets.findIndex((t) => t.taskId === taskId);
      if (entryIndex !== -1) {
        mockData[groupIndex].timesheets[entryIndex].status = "Rejected";
      }
    }
  };

  const filteredData =
    selectedProjectId === "all"
      ? mockData
      : mockData
          .map((group) => ({
            ...group,
            timesheets: group.timesheets.filter((ts) => ts.projectId === selectedProjectId),
          }))
          .filter((group) => group.timesheets.length > 0);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Timesheet Report", 14, 16);

    filteredData.forEach((group, index) => {
      autoTable(doc, {
        startY: 25 + index * 60,
        head: [["Project", "Task ID", "Description", "Hours", "Status", "Log Date/Time"]],
        body: group.timesheets.map((ts) => [
          ts.projectName,
          ts.taskId,
          ts.taskDescription,
          ts.hours,
          ts.status,
          new Date(ts.logDateTime).toLocaleString(),
        ]),
        theme: "striped",
        margin: { top: 20 },
        didDrawPage: (data) => {
          doc.setFontSize(12);
          doc.text(`Employee: ${group.employeeName}`, 14, data.settings.startY - 10);
        },
      });
    });

    doc.save("timesheet-report.pdf");
  };

  const exportToCSV = () => {
    const csvData: any[] = [];

    filteredData.forEach((group) => {
      group.timesheets.forEach((ts) => {
        csvData.push({
          Employee: group.employeeName,
          Project: ts.projectName,
          TaskID: ts.taskId,
          Description: ts.taskDescription,
          Hours: ts.hours,
          Status: ts.status,
          "Log Date/Time": new Date(ts.logDateTime).toLocaleString(),
        });
      });
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "timesheet-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="approval-table">
      <div className="filter-section" style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
        <div>
          <label>Filter by Project ID: </label>
          <select
            onChange={(e) => {
              const value = e.target.value;
              setSelectedProjectId(value === "all" ? "all" : parseInt(value));
            }}
          >
            <option value="all">All</option>
            <option value="1">Project Alpha (ID: 1)</option>
            <option value="2">Project Beta (ID: 2)</option>
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

      {filteredData.map((group) => (
        <div key={group.employeeId} className="employee-group">
          <div className="employee-header">
            <button className="toggle-btn" onClick={() => toggleExpand(group.employeeId)}>
              {expanded[group.employeeId] ? "▼" : "▶"} {group.employeeName}
            </button>
          </div>

          {expanded[group.employeeId] && (
            <table className="task-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Task ID</th>
                  <th>Task Description</th>
                  <th>Hours</th>
                  <th>Log Date/Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {group.timesheets.map((entry) => (
                  <tr key={entry.taskId}>
                    <td>{entry.projectName}</td>
                    <td>{entry.taskId}</td>
                    <td>{entry.taskDescription}</td>
                    <td>{entry.hours}</td>
                    <td>{new Date(entry.logDateTime).toLocaleString()}</td>
                    <td>
                      <span className={`status ${entry.status.toLowerCase()}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td>
                      {entry.status === "Pending" ? (
                        <ApproveRejectButtons
                          employeeId={group.employeeId}
                          timesheetId={entry.taskId}
                          onApprove={() => handleApprove(group.employeeId, entry.taskId)}
                          onReject={() => handleReject(group.employeeId, entry.taskId)}
                        />
                      ) : (
                        <button className="btn btn-secondary" onClick={() => alert(`Reviewing Task ID ${entry.taskId}`)}>
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};

export default TimesheetApprovalTable;
