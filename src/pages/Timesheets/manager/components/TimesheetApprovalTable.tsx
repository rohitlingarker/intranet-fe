import React, { useEffect, useState } from "react";
import {
  GroupedTimesheets,
  TimeSheetHistoryDTO,
  TaskEntry,
  TimesheetStatus,
} from "../types/TimesheetTypes";
import {
  fetchGroupedTimesheets,
  approveTimesheet,
  rejectTimesheet,
} from "../api/timesheetApi";
import ApproveRejectButtons from "./ApproveRejectButtons";
import jsPDF from "jspdf";

import Papa from "papaparse";
import "./../styles/TimesheetManager.css";

const TimesheetApprovalTable: React.FC = () => {
  const [data, setData] = useState<GroupedTimesheets[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [employeeFilter, setEmployeeFilter] = useState<number | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const flatList = await fetchGroupedTimesheets(); // returns flat structure

        const groupedMap: Record<number, GroupedTimesheets> = {};

        flatList.forEach((entry: any) => {
          const empId = entry.userId;

          if (!groupedMap[empId]) {
            groupedMap[empId] = {
              employeeId: empId,
              employeeName: `Employee ${empId}`,
              timesheets: [],
            };
          }

          const timesheet: TimeSheetHistoryDTO = {
            timesheetId: entry.timesheetId,
            userId: entry.userId,
            projectId: entry.projectId,
            taskId: entry.taskId,
            hoursWorked: entry.hoursWorked,
            approvalStatus: entry.approvalStatus,
            description: entry.description,
            workDate: entry.workDate,
            status: entry.approvalStatus,
            entries: [
              {
                projectName: `Project ${entry.projectId ?? "N/A"}`,
                taskName: `Task ${entry.taskId ?? "N/A"}`,
                description: entry.description,
                workType: "General",
                hoursWorked: entry.hoursWorked,
                from: "09:00",
                to: "17:00",
              },
            ],
          };

          groupedMap[empId].timesheets.push(timesheet);
        });

        setData(Object.values(groupedMap));
      } catch (error) {
        console.error("Failed to load timesheets:", error);
      }
    };

    loadData();
  }, []);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateStatus = (
    employeeId: number,
    timesheetId: number,
    newStatus: TimesheetStatus
  ) => {
    const updated = data.map((emp) =>
      emp.employeeId === employeeId
        ? {
            ...emp,
            timesheets: (emp.timesheets || []).map((ts) =>
              ts.timesheetId === timesheetId ? { ...ts, status: newStatus } : ts
            ),
          }
        : emp
    );
    setData(updated);
  };

  const handleApprove = async (employeeId: number, timesheetId: number) => {
    try {
      await approveTimesheet(timesheetId, employeeId.toString());
      updateStatus(employeeId, timesheetId, "APPROVED");
    } catch (error) {
      console.error("Approval failed", error);
    }
  };

  const handleReject = async (employeeId: number, timesheetId: number) => {
    try {
      await rejectTimesheet(timesheetId,employeeId.toString());
      updateStatus(employeeId, timesheetId, "REJECTED");
    } catch (error) {
      console.error("Rejection failed", error);
    }
  };

  // Filter logic
  const filteredData = data
    .filter(
      (emp) => employeeFilter === "all" || emp.employeeId === employeeFilter
    )
    .map((emp) => ({
      ...emp,
      timesheets: (emp.timesheets || []).filter((ts) =>
        projectFilter === "all"
          ? true
          : ts.entries.some((entry) =>
              (entry.projectName ?? "")
                .toLowerCase()
                .includes(projectFilter.toLowerCase())
            )
      ),
    }))
    .filter((emp) => (emp.timesheets || []).length > 0);

  const uniqueProjects = Array.from(
    new Set(
      data.flatMap((group) =>
        (group.timesheets || []).flatMap((ts) =>
          ts.entries.map((e) => e.projectName).filter(Boolean)
        )
      )
    )
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Timesheet Report", 14, 16);
    let startY = 25;

    filteredData.forEach((group) => {
      (group.timesheets || []).forEach((ts) => {
        autoTable(doc, {
          startY,
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
          margin: { top: 20 },
          didDrawPage: (data) => {
            doc.setFontSize(12);
            doc.text(
              `Employee: ${group.employeeName} | Timesheet #${ts.timesheetId} | Date: ${ts.workDate}`,
              14,
              data.settings.startY - 10
            );
          },
        });
        startY += 60;
      });
    });

    doc.save("timesheet-report.pdf");
  };

  const exportToCSV = () => {
    const rows: any[] = [];

    filteredData.forEach((group) => {
      (group.timesheets || []).forEach((ts) => {
        ts.entries.forEach((e) => {
          rows.push({
            Employee: group.employeeName,
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
      <h2>Pending Timesheet Approvals</h2>

      <div className="filter-section">
        <label>Project: </label>
        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="all">All</option>
          {uniqueProjects.map((p, index) => (
            <option key={index} value={p}>
              {p}
            </option>
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
          {data.map((emp) => (
            <option key={emp.employeeId} value={emp.employeeId}>
              {emp.employeeName}
            </option>
          ))}
        </select>

        <button className="btn btn-success" onClick={exportToPDF} style={{ marginLeft: "auto" }}>
          Export PDF
        </button>
        <button className="btn btn-secondary" onClick={exportToCSV} style={{ marginLeft: "1rem" }}>
          Export CSV
        </button>
      </div>

      {filteredData.length === 0 && <p>No timesheets found for the selected filters.</p>}

      {filteredData.map((group) =>
        (group.timesheets || []).map((ts) => (
          <div key={ts.timesheetId} className="employee-group">
            <div className="employee-header">
              <button className="toggle-btn" onClick={() => toggleExpand(ts.timesheetId)}>
                {expanded[ts.timesheetId] ? "▼" : "▶"} {group.employeeName} - Timesheet #
                {ts.timesheetId} | Date: {ts.workDate}
              </button>
              <ApproveRejectButtons
                employeeId={group.employeeId}
                timesheetId={ts.timesheetId}
                currentStatus={ts.status}
                onApprove={() => handleApprove(group.employeeId, ts.timesheetId)}
                onReject={() => handleReject(group.employeeId, ts.timesheetId)}
              />
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

