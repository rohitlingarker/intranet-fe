import React from "react";
import { TimeSheetHistoryDTO } from "../types/TimesheetTypes";
import TimesheetCard from "./TimesheetCard";

interface Props {
  timesheets: TimeSheetHistoryDTO[];
}

const TimesheetApprovalList: React.FC<Props> = ({ timesheets }) => {
  if (timesheets.length === 0) return <p>No pending timesheets found.</p>;

  return (
    <div>
      {timesheets.map((sheet) => (
        <TimesheetCard key={sheet.timesheetId} timesheet={sheet} />
      ))}
    </div>
  );
};

export default TimesheetApprovalList;
