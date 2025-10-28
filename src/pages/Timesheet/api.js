// utils/timesheetApi.js
import { showStatusToast } from "../../components/toastfy/toast";

const apiEndpoint = import.meta.env.VITE_TIMESHEET_API_ENDPOINT;

export const fetchProjectTaskInfo = async () => {
  try {
    const response = await fetch(`${apiEndpoint}/api/timesheet/project-info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
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

export const reviewTimesheet = async (timesheetId, comment, status) => {
  try {
    const res = await fetch(
      `${apiEndpoint}/api/timesheets/review?status=${encodeURIComponent(
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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

export async function fetchTimesheetHistory() {
  try {
    const res = await fetch(`${apiEndpoint}/api/timesheet/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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

export async function addEntryToTimesheet(timesheetId, workdate, payload) {
  try {
    let res;
    if (timesheetId === undefined) {
      res = await fetch(
        `${apiEndpoint}/api/timesheet/create?workDate=${workdate}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );
    } else {
      res = await fetch(
        `${apiEndpoint}/api/timesheet/add-entry/${timesheetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );
    }

    if (!res.ok) {
      if (res.status === 400) {
        const errorData = await res.text();
        throw new Error(errorData || "Failed to add entry to timesheet");
      }
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to add entry to timesheet");
    }
    showStatusToast("Timesheet entry added successfully", "success");
  } catch (err) {
    showStatusToast(err.message || "Update failed", "error");
    throw err;
  }
}

export async function bulkReviewTimesheet(timesheetIds, status, comment) {
  try {
    // example body
    // {
    //   "timesheetIds": [14,15
    //   ],
    //   "status": "Approved",
    //   "comment": "Testing Bulk"
    // }
    const res = await fetch(`${apiEndpoint}/api/timesheets/review/bulk`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        timesheetIds,
        status,
        comment: status === "Rejected" ? comment : "Bulk Approved",
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to bulk review timesheet");
    }

    showStatusToast(`Timesheet ${status} successfully`, "success");
    return;
  } catch (err) {
    showStatusToast("Update failed", "error");
    throw err;
  }
}

// Dashboard Summary API
export async function fetchDashboardSummary() {
  try {
    const response = await fetch(`${apiEndpoint}/api/dashboard/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        errorData || `Error ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    showStatusToast({
      type: "error",
      message: "Failed to fetch dashboard summary. Please try again.",
    });
    console.error("Fetch dashboard summary error:", error);
    return null; // Return null so calling code can check for loading/error
  }
}

export async function filterByRange(startDate, endDate) {
  try {
    const res = await fetch(
      `${apiEndpoint}/api/timesheet/filter?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to filter timesheet");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    showStatusToast(err.message || "Filter failed", "error");
    throw err;
  }
}

export async function getManagerDashboardData(startDate, endDate) {
  try {
    const res = await fetch(
      `${apiEndpoint}/api/manager/summary?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message || "Failed to fetch manager dashboard data"
      );
    }

    const data = await res.json();
    return data;
  } catch (err) {
    showStatusToast(
      err.message || "Failed to fetch manager dashboard data",
      "error"
    );
    throw err;
  }
}

export async function submitWeeklyTimesheet(timesheetIds) {
  try {
    const res = await fetch(`${apiEndpoint}/api/weeklyReview/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(timesheetIds),
    });

    if (!res.ok) {
      // Try to parse as JSON, fallback to text
      let errorMessage = "Failed to submit weekly timesheet";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await res.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Handle both JSON and text responses
    let responseMessage = "Weekly timesheet submitted successfully";
    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      responseMessage = data.message || responseMessage;
    } else {
      const text = await res.text();
      responseMessage = text || responseMessage;
    }

    showStatusToast(responseMessage, "success");
    return responseMessage;
  } catch (err) {
    showStatusToast(
      err.message || "Failed to submit weekly timesheet",
      "error"
    );
    throw err;
  }
}
export async function fetchCalendarHolidays() {
  try {
    const response = await fetch(`${apiEndpoint}/api/holidays/currentMonth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    showStatusToast({
      type: "error",
      message: "Failed to fetch calendar holidays. Please try again.",
    });
    console.error("Fetch calendar holidays error:", error);
    return null; // Return null so calling code can check for loading/error
  }
}
