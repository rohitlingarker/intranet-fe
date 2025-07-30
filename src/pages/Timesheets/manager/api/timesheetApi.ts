import axios from "axios";
import { TimeSheetHistoryDTO } from "../types/TimesheetTypes";

const BASE_URL = "http://localhost:8080/api/timesheet";

export const fetchPendingTimesheets = async (): Promise<TimeSheetHistoryDTO[]> => {
  const res = await axios.get<TimeSheetHistoryDTO[]>(`${BASE_URL}/pending`);
  return res.data;
};

export const approveTimesheet = (id: number) => {
  return axios.post(`${BASE_URL}/${id}/approve`);
};

export const rejectTimesheet = (id: number) => {
  return axios.post(`${BASE_URL}/${id}/reject`);
};
