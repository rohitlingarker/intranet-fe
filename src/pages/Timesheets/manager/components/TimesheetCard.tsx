import React from "react";
import ApproveRejectButtons from "./ApproveRejectButtons";
import { TimeSheetHistoryDTO } from "../types/TimesheetTypes";

interface Props {
  timesheet: TimeSheetHistoryDTO;
}

const TimesheetCard: React.FC<Props> = ({ timesheet }) => {
  return (
    <div className="timesheet-card">
      <h4>{timesheet.employeeId}</h4>
      <p>Date: {new Date(timesheet.workDate).toLocaleDateString()}</p>
      <ul>
        {timesheet.entries.map((entry, idx) => (
          <li key={idx}>
            <strong>Project:</strong> {entry.projectId} | <strong>Task:</strong> {entry.taskId}<br />
            <em>{entry.description}</em> - {entry.hoursWorked}h ({entry.workType})
          </li>
        ))}
      </ul>
      <ApproveRejectButtons timesheetId={timesheet.timesheetId} employeeId={timesheet.employeeId} />
    </div>
  );
};

export default TimesheetCard;
