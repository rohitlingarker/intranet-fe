import { Key } from "react";
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
  id: Key | null | undefined;
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
export interface TaskEntry {
  projectName: string;
  taskName: string;
  description: string;
  workType: string;
  hours: number;
  from: string;
  to: string;
}

export interface Timesheet {
  timesheetId: number;
  workDate: string;      // e.g., "2025-07-26"
  totalHours: number;
  status: "Pending" | "Approved" | "Rejected";
  tasks: TaskEntry[];
}
// src/pages/Timesheets/manager/types/timesheettypes.ts

export interface TimesheetTask {
  projectName: string;
  taskName: string;
  description: string;
  workType: string;
  hours: number;
  from: string;
  to: string;
}

export interface TimesheetEntry {
  timesheetId: number;
  workDate: string; // e.g., "2025-07-26"
  totalHours: number;
  //status: "Pending" | "Approved" | "Rejected";
  tasks: TimesheetTask[];
}

export interface TimesheetGroup {
  employeeId: number;
  employeeName: string;
  timesheets: TimesheetEntry[];
}
// Represents a single task entry in a timesheet
export interface TaskEntry {
  projectName: string;
  taskName: string;
  description: string;
  workType: string;
  hours: number;
  from: string;
  to: string;
}

// Represents a timesheet entry (collection of tasks for one day)
export interface TimesheetEntry {
  timesheetId: number;
  workDate: string; // Format: YYYY-MM-DD
  totalHours: number;
  //status: "Pending" | "Approved" | "Rejected";
  reviewed?: boolean;
  tasks: TaskEntry[];
}

// Represents a group of timesheets submitted by an employee
export interface TimesheetGroup {
  employeeId: number;
  employeeName: string;
  timesheets: TimesheetEntry[];
}
export interface TimeSheetEntryDTO {
  projectId: number;
  taskId: number;
  description: string;
  workType: string;
  hoursWorked: number;
  otherDescription?: string;
  projectName: string;
  taskName: string;
  from: string;
  to: string;
}

export interface TimeSheetApprovalDTO {
  approvalStatus: string;
  approverId: number;
  approvalTime: string; // ISO format
  description: string;
}

export interface TimeSheetHistoryDTO {
  timesheetId: number;
  employeeId: number;
  employeeName: string;
  workDate: string; // YYYY-MM-DD
  createdAt: string; // ISO date-time of upload
  entries: TimeSheetEntryDTO[];
  approvals: TimeSheetApprovalDTO[];
  status: "Pending" | "Approved" | "Rejected";
}

export interface GroupedTimesheets {
  employeeId: number;
  employeeName: string;
  timesheets: TimeSheetHistoryDTO[];
}


