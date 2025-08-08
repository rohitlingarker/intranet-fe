// api.js
import { showStatusToast } from "../../components/toastfy/toast";

const apiEndpoint = "http://localhost:8080";

export const fetchProjectTaskInfo = async ( ) => {
  try {
    const response = await fetch(
      `${apiEndpoint}/api/timesheet/project-info/projects`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,cd 
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



export async function updateTimesheet(timesheetId, payload) {
  try {
    const res = await fetch(`${apiEndpoint}/api/timesheet/update/${timesheetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json()
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
