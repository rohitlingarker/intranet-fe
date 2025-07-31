// src/pages/Timesheets/manager/api/timesheetApi.ts

import axios from "axios";
import { GroupedTimesheets } from "../types/TimesheetTypes";

const BASE_URL = "http://localhost:8080/api/manager";

export const fetchGroupedTimesheets = async (): Promise<GroupedTimesheets[]> => {
  const response = await axios.get<GroupedTimesheets[]>(`${BASE_URL}/filter`);
  return response.data;
};

export const approveTimesheet = async (timesheetId: number,userId:string) => {
  return axios.put(`${BASE_URL}/approve`, {
    timesheetId,
    userId,
    status: "APPROVED",
  });
};

export const rejectTimesheet = async (timesheetId: number,userId:string) => {
  return axios.put(`${BASE_URL}/approve`, {
    timesheetId,
    userId,
    status: "REJECTED",
  });
};
