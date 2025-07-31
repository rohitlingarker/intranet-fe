// Enum-like union type to represent status
export type TimesheetStatus = "PENDING" | "APPROVED" | "REJECTED";

// Entry under a timesheet (task details for display)
export interface TaskEntry {
  projectName: string;
  taskName: string;
  description: string;
  workType: string;
  hoursWorked: number;
  from: string;
  to: string;
}

// Entry fetched from backend (flat structure)
export interface TimesheetEntry {
  timesheetId: number;
  userId: number;
  projectId: number | null;
  taskId: number | null;
  hoursWorked: number;
  approvalStatus: TimesheetStatus;
  description: string;
  workDate: string;
}

// DTO format for displaying grouped timesheets in frontend UI
export interface TimeSheetHistoryDTO {
  timesheetId: number;
  userId: number;
  projectId: number | null;
  taskId: number | null;
  hoursWorked: number;
  approvalStatus: TimesheetStatus;
  description: string;
  status: TimesheetStatus;
  workDate: string;
  entries: TaskEntry[]; // detailed breakdown
}

// Grouped timesheets under one employee
export interface GroupedTimesheets {
  employeeId: number;
  employeeName: string;
  timesheets: TimeSheetHistoryDTO[]; // list of timesheets for the employee
}
