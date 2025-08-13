// utils/timesheetApi.js
import { showStatusToast } from "../../components/toastfy/toast";

const apiEndpoint = import.meta.env.VITE_TIMESHEET_API_ENDPOINT;

export const fetchProjectTaskInfo = async (userId) => {
  try {
    const response = await fetch(
      `${apiEndpoint}/api/timesheet/project-info/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    http: if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    showStatusToast({
      type: "error",
      message: "Failed to fetch project/task info. Please try again.",
    });
    console.error("Fetch error:", error);
    return [];
  }
};

export const reviewTimesheet = async (
  managerId,
  timesheetId,
  comment,
  status
) => {
  try {
    const res = await fetch(
      `${apiEndpoint}/api/timesheets/review/${managerId}?status=${encodeURIComponent(
        status
      )}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          timesheetId,
          comment: comment,
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to review timesheet");
    }

    showStatusToast(`Timesheet ${status} successfully`, "success");
    return;
  } catch (err) {
    showStatusToast("Update failed", "error");
    throw err;
  }
};

export async function updateTimesheet(timesheetId, payload) {
  try {
    const res = await fetch(
      `${apiEndpoint}/api/timesheet/update/${timesheetId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update timesheet");
    }

    const data = res;
    showStatusToast("Timesheet updated successfully", "success");
    console.log("Update successful:", data);

    return data;
  } catch (err) {
    showStatusToast(err.message || "Update failed", "error");
    throw err;
  }
}

export async function fetchTimesheetHistory(userId) {
  try {
    const res = await fetch(`${apiEndpoint}/api/timesheet/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch timesheet history");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    showStatusToast(err.message || "Fetch failed", "error");
    throw err;
  }
}

export async function addEntryToTimesheet(timesheetId,workdate, payload) {
  try {
    if (timesheetId === undefined) {
      const res = await fetch(`${apiEndpoint}/api/timesheet/create?workDate=${workdate}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } else {
      const res = await fetch(
        `${apiEndpoint}/api/timesheet/add-entry/${timesheetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
    }
    showStatusToast("Timesheet entry added successfully", "success");
  } catch (err) {
    showStatusToast(err.message || "Update failed", "error");
    throw err;
  }
}
