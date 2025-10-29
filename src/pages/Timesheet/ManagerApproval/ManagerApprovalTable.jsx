import React, { useMemo, useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { reviewTimesheet } from "../api";
import { TimesheetGroup } from "../TimesheetGroup";
import { showStatusToast } from "../../../components/toastfy/toast";

const ManagerApprovalTable = ({
  loading,
  groupedData = [],
  statusFilter = "All",
  onRefresh,
}) => {
  const [rejectionComments, setRejectionComments] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [projectInfo, setProjectInfo] = useState([]);

  // -----------------------------
  // Fetch project info
  // -----------------------------
  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/api/project-info/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch project info");
        const data = await res.json();

        const normalized = data.map((p) => ({
          projectId: p.projectId,
          projectName: p.project,
          tasks: p.tasks.map((t) => ({
            taskId: t.taskId,
            taskName: t.task,
          })),
        }));
        setProjectInfo(normalized);
      } catch (err) {
        console.error("Error fetching project info:", err);
      }
    };
    fetchProjectInfo();
  }, []);

  // -----------------------------
  // Lookup maps for fast access
  // -----------------------------
  const projectIdToName = useMemo(
    () =>
      Object.fromEntries(projectInfo.map((p) => [p.projectId, p.projectName])),
    [projectInfo]
  );

  const taskIdToName = useMemo(
    () =>
      Object.fromEntries(
        projectInfo.flatMap((p) => p.tasks.map((t) => [t.taskId, t.taskName]))
      ),
    [projectInfo]
  );

  // -----------------------------
  // Enrich timesheet entries
  // -----------------------------
  const enrichedGroupedData = useMemo(
    () =>
      groupedData.map((user) => ({
        ...user,
        weeklySummary: user.weeklySummary.map((week) => ({
          ...week,
          timesheets: week.timesheets.map((t) => ({
            ...t,
            entries: t.entries.map((entry) => ({
              ...entry,
              projectName:
                projectIdToName[entry.projectId] ||
                `Project-${entry.projectId}`,
              taskName: taskIdToName[entry.taskId] || `Task-${entry.taskId}`,
            })),
          })),
        })),
      })),
    [groupedData, projectIdToName, taskIdToName]
  );

  // -----------------------------
  // Approve / Reject Logic
  // -----------------------------
  const handleStatusChange = async (timesheetId, status, comment = "") => {
    try {
      await reviewTimesheet(timesheetId, comment, status);
      showStatusToast(
        `Timesheet ${status.toLowerCase()} successfully`,
        "success"
      );
      onRefresh?.();
    } catch (err) {
      console.error("Error updating status:", err);
      showStatusToast("Failed to update timesheet status", "error");
    }
  };

  const handleRejectClick = (timesheetId) =>
    setShowCommentBox((prev) => ({ ...prev, [timesheetId]: true }));

  const handleConfirmReject = (timesheetId) => {
    const comment = rejectionComments[timesheetId] || "";
    handleStatusChange(timesheetId, "Rejected", comment);
    setShowCommentBox((prev) => ({ ...prev, [timesheetId]: false }));
  };

  const handleCancelReject = (timesheetId) => {
    setShowCommentBox((prev) => ({ ...prev, [timesheetId]: false }));
    setRejectionComments((prev) => ({ ...prev, [timesheetId]: "" }));
  };

  // -----------------------------
  // CSV Export
  // -----------------------------
  const exportCSV = () => {
    const rows = [
      [
        "User ID",
        "User Name",
        "Project",
        "Task",
        "Start",
        "End",
        "Work Type",
        "Description",
        "Hours",
        "Date",
        "Status",
      ],
    ];

    enrichedGroupedData.forEach((user) =>
      user.weeklySummary.forEach((week) =>
        week.timesheets.forEach((sheet) =>
          sheet.entries.forEach((entry) => {
            rows.push([
              user.userId,
              user.userName,
              entry.projectName,
              entry.taskName,
              new Date(entry.fromTime).toLocaleTimeString(),
              new Date(entry.toTime).toLocaleTimeString(),
              entry.workLocation || "-",
              entry.description || "",
              entry.hoursWorked?.toFixed(2) || 0,
              new Date(sheet.workDate).toLocaleDateString(),
              sheet.status,
            ]);
          })
        )
      )
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.map((v) => `"${v}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "manager_timesheets.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -----------------------------
  // PDF Export
  // -----------------------------
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Manager Timesheet Report", 14, 10);
    const body = [];

    enrichedGroupedData.forEach((user) =>
      user.weeklySummary.forEach((week) =>
        week.timesheets.forEach((sheet) =>
          sheet.entries.forEach((entry) =>
            body.push([
              user.userId,
              user.userName,
              entry.projectName,
              entry.taskName,
              new Date(entry.fromTime).toLocaleTimeString(),
              new Date(entry.toTime).toLocaleTimeString(),
              entry.workLocation || "-",
              entry.description || "",
              entry.hoursWorked?.toFixed(2) || 0,
              new Date(sheet.workDate).toLocaleDateString(),
              sheet.status,
            ])
          )
        )
      )
    );

    autoTable(doc, {
      head: [
        [
          "User ID",
          "User Name",
          "Project",
          "Task",
          "Start",
          "End",
          "Work Type",
          "Description",
          "Hours",
          "Date",
          "Status",
        ],
      ],
      body,
      startY: 20,
    });
    doc.save("manager_timesheets.pdf");
  };

  // -----------------------------
  // Render Weekly View per User
  // -----------------------------
  const renderUserWeeks = (user) =>
    user.weeklySummary
      .filter(
        (week) =>
          statusFilter === "All" ||
          week.weeklyStatus?.toUpperCase() === statusFilter.toUpperCase()
      )
      .map((week) => (
        <div
          key={week.weekId}
          className="bg-white border rounded-xl shadow-sm mb-6 overflow-hidden"
        >
          {/* 🔹 Task + Project Summary for quick view */}
          <div className="bg-gray-50 px-4 py-2 text-sm border-b">
            {week.timesheets.flatMap((t) =>
              t.entries.map((e, i) => (
                <div key={i} className="flex justify-between text-gray-700">
                  <span>
                    <strong>Project:</strong> {e.projectName}
                  </span>
                  <span>
                    <strong>Task:</strong> {e.taskName}
                  </span>
                </div>
              ))
            )}
          </div>

          <TimesheetGroup
            weekGroup={{
              weekStart: week.startDate,
              weekEnd: week.endDate,
              timesheets: week.timesheets,
              weekRange: `${new Date(
                week.startDate
              ).toLocaleDateString()} - ${new Date(
                week.endDate
              ).toLocaleDateString()}`,
              totalHours: week.totalHours,
              status: week.weeklyStatus,
              weekNumber: week.weekId,
              monthName: new Date(week.startDate).toLocaleString("en-US", {
                month: "long",
              }),
              year: new Date(week.startDate).getFullYear(),
            }}
            refreshData={onRefresh}
            mapWorkType={(type) => type}
            projectInfo={projectInfo}
          />

          {/* Manager actions */}
          <div className="p-4 border-t flex gap-3 justify-end">
            <button
              onClick={() =>
                week.timesheets.forEach((t) =>
                  handleStatusChange(t.timesheetId, "APPROVED")
                )
              }
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Approve All
            </button>
            <button
              onClick={() =>
                week.timesheets.forEach((t) => handleRejectClick(t.timesheetId))
              }
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Reject
            </button>
          </div>

          {/* Rejection boxes */}
          {week.timesheets.map(
            (t) =>
              showCommentBox[t.timesheetId] && (
                <div key={t.timesheetId} className="p-4 bg-red-50 border-t">
                  <textarea
                    className="border p-2 w-full rounded"
                    rows="2"
                    placeholder="Enter rejection reason"
                    value={rejectionComments[t.timesheetId] || ""}
                    onChange={(e) =>
                      setRejectionComments((prev) => ({
                        ...prev,
                        [t.timesheetId]: e.target.value,
                      }))
                    }
                  />
                  <div className="flex gap-2 mt-2 justify-end">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => handleConfirmReject(t.timesheetId)}
                    >
                      Confirm Reject
                    </button>
                    <button
                      className="bg-gray-300 px-3 py-1 rounded"
                      onClick={() => handleCancelReject(t.timesheetId)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
          )}
        </div>
      ));

  // -----------------------------
  // Render Main
  // -----------------------------
  return (
    <div className="space-y-6">
      {loading ? (
        <LoadingSpinner text="Loading manager view..." />
      ) : (
        <>
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={exportCSV}
              className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
            >
              Export CSV
            </button>
            <button
              onClick={exportPDF}
              className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
            >
              Export PDF
            </button>
          </div>

          {enrichedGroupedData.map((user) => (
            <div
              key={user.userId}
              className="bg-white rounded-xl shadow-md border p-4"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-800">
                {user.userName} (ID: {user.userId})
              </h2>
              {renderUserWeeks(user)}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ManagerApprovalTable;
