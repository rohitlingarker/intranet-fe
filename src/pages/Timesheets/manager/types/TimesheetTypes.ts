export interface TimeSheetEntryDTO {
  projectId: number;
  taskId: number;
  description: string;
  workType: string;
  hoursWorked: number;
  otherDescription?: string;
}

export interface TimeSheetApprovalDTO {
  approvalStatus: string;
  approverId: number;
  approvalTime: string; // ISO datetime format
  description: string;
}

export interface TimeSheetHistoryDTO {
  timesheetId: number;
  employeeId: number;
  employeeName: string;
  workDate: string; // Format: YYYY-MM-DD
  entries: TimeSheetEntryDTO[];
  approvals: TimeSheetApprovalDTO[];
}

export interface GroupedTimesheets {
  employeeId: number;
  employeeName: string;
  timesheets: TimeSheetHistoryDTO[];
}
export interface TimesheetEntry {
  taskId: number;
  projectName: string;
  taskDescription: string;
  hours: number;
  status: string;
}

export interface TimesheetGroup {
  employeeId: number;
  employeeName: string;
  timesheets: TimesheetEntry[];
}
export interface TimesheetEntry {
  taskId: number;
  projectId: number;
  projectName: string;
  taskDescription: string;
  hours: number;
  status: string;
  logDate: string;
  logTime: string;
}

export interface TimesheetGroup {
  employeeId: number;
  employeeName: string;
  timesheets: TimesheetEntry[];
}
export interface TimesheetEntry {
  taskId: number;
  projectId: number;
  projectName: string;
  taskDescription: string;
  hours: number;
  status: string;
  logDateTime: string;
}

export interface TimesheetGroup {
  employeeId: number;
  employeeName: string;
  timesheets: TimesheetEntry[];
}
export interface TimesheetEntry {
  taskId: number;
  projectName: string;
  taskDescription: string;
  hours: number;
  status: string;
  logTime: string;
}

export interface TimesheetGroup {
  employeeId: number;
  employeeName: string;
  timesheets: TimesheetEntry[];
}

export interface ReviewableTimesheet extends TimesheetEntry {
  reviewed?: boolean;
}
export interface TimesheetEntry {
  taskId: number;
  projectName: string;
  taskDescription: string;
  hours: number;
  status: string;
  logTime: string;
}

export interface TimesheetGroup {
  employeeId: number;
  employeeName: string;
  timesheets: TimesheetEntry[];
}

export interface ReviewableTimesheet extends TimesheetEntry {
  reviewed?: boolean;
}
