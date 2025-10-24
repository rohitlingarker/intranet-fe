import React, { useState, useEffect } from "react";
import TimesheetHeader from "./TimesheetHeader";
import { TimesheetFilters } from "./TimesheetFilters";
import { TimesheetTable } from "./TimesheetTable";
import { fetchTimesheetHistory, fetchProjectTaskInfo } from "./api";
import DashboardPage from "./DashboardPage";

const TimesheetHistoryPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [user, setUser] = useState(null);
  const [projectInfo, setProjectInfo] = useState([]);

  // Function to get the start of the week (Monday) for a given date
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Function to get the end of the week (Sunday) for a given date
  const getWeekEnd = (date) => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  // Function to format week range
  const formatWeekRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    const endStr = end.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  };

  // Function to group entries by week
  const groupEntriesByWeek = (entries) => {
    const weekGroups = {};

    entries.forEach((timesheet) => {
      const workDate = new Date(timesheet.workDate);
      const weekStart = getWeekStart(workDate);
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = {
          weekStart: weekStart.toISOString().split("T")[0],
          weekEnd: getWeekEnd(workDate).toISOString().split("T")[0],
          weekRange: formatWeekRange(weekStart, getWeekEnd(workDate)),
          timesheets: [],
          totalHours: 0,
          status: "Pending", // Default status, will be calculated based on individual timesheets
          actionStatus: [],
          weekNumber: getWeekNumber(weekStart),
          monthName: new Date(weekStart).toLocaleDateString("en-US", {
            month: "long",
          }),
          year: new Date(weekStart).getFullYear(),
        };
      }

      weekGroups[weekKey].timesheets.push(timesheet);
      weekGroups[weekKey].totalHours += parseFloat(
        calculateTotalHours(timesheet.entries)
      );

      // Update status based on individual timesheet statuses
      if (timesheet.status === "Approved") {
        weekGroups[weekKey].status = "Approved";
      } else if (timesheet.status === "Rejected") {
        weekGroups[weekKey].status = "Rejected";
      } else if (
        weekGroups[weekKey].status !== "Approved" &&
        weekGroups[weekKey].status !== "Rejected"
      ) {
        weekGroups[weekKey].status = "Pending";
      }

      // Merge action status from individual timesheets
      if (timesheet.actionStatus) {
        weekGroups[weekKey].actionStatus = [
          ...weekGroups[weekKey].actionStatus,
          ...timesheet.actionStatus,
        ];
      }
    });

    // Convert to array and sort by week start date (newest first)
    const sortedWeeks = Object.values(weekGroups).sort(
      (a, b) => new Date(b.weekStart) - new Date(a.weekStart)
    );

    // Calculate week-to-week differences
    return sortedWeeks.map((week, index) => {
      const previousWeek = sortedWeeks[index + 1];
      let hoursDifference = 0;
      let differenceType = "neutral"; // "increase", "decrease", "neutral"

      if (previousWeek) {
        hoursDifference = week.totalHours - previousWeek.totalHours;
        if (hoursDifference > 0) {
          differenceType = "increase";
        } else if (hoursDifference < 0) {
          differenceType = "decrease";
        }
      }

      return {
        ...week,
        hoursDifference: Math.abs(hoursDifference),
        differenceType,
        isFirstWeek: index === 0,
        isLastWeek: index === sortedWeeks.length - 1,
      };
    });
  };

  // Function to get week number of the year
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((d.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7
      )
    );
  };

  // Function to calculate total hours for entries
  const calculateTotalHours = (entries) => {
    let totalMinutes = 0;
    entries.forEach((entry) => {
      const start = new Date(entry.fromTime);
      const end = new Date(entry.toTime);
      totalMinutes += (end - start) / (1000 * 60);
    });
    return (totalMinutes / 60).toFixed(2);
  };

  // Fetch user info
  // useEffect(() => {
  //   fetch(`${import.meta.env.VITE_TIMESHEET_API_ENDPOINT}/me`)
  //     .then((res) => {
  //       if (!res.ok) throw new Error("Failed to fetch user");
  //       return res.json();
  //     })
  //     .then((userData) => setUser({ name: userData.name, email: userData.email }))
  //     .catch((err) => console.error("Error fetching user:", err));
  // }, []);

  // Fetch timesheet history
  useEffect(() => {
    fetchProjectTaskInfo().then(setProjectInfo);
  }, []);

  const projectIdToName = Object.fromEntries(
    projectInfo.map((p) => [p.projectId, p.project])
  );

  useEffect(() => {
    const loadTimesheetHistory = async () => {
      try {
        setLoading(true);
        const data = await fetchTimesheetHistory(user?.user_id || 1);
        console.log("Fetched timesheet history:", data);

        // Group entries by week
        const weeklyEntries = groupEntriesByWeek(data);
        setEntries(weeklyEntries);
      } catch (err) {
        console.error("Failed to fetch timesheet history:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTimesheetHistory();
  }, [user]);

  const mapWorkType = (type) => {
    switch (type) {
      case "WFO":
        return "Office";
      case "WFH":
        return "Home";
      case "HYBRID":
        return "Hybrid";
      default:
        return type;
    }
  };

  // Filter entries
  const filteredEntries = entries.filter((weekGroup) => {
    const matchesSearch = weekGroup.timesheets.some((timesheet) => {
      return timesheet.entries.some((entry) => {
        const projectName = projectIdToName[entry.projectId] || "";
        return projectName.toLowerCase().includes(searchText.toLowerCase());
      });
    });

    const matchesDate =
      (!filterStartDate && !filterEndDate) ||
      ((!filterStartDate ||
        new Date(weekGroup.weekStart) >= new Date(filterStartDate)) &&
        (!filterEndDate ||
          new Date(weekGroup.weekEnd) <= new Date(filterEndDate)));

    const matchesStatus =
      filterStatus === "All Status" || weekGroup.status === filterStatus;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage);
  const paginatedData = filteredEntries.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f9fb" }}>
      <main style={{ flex: 1, padding: 36 }}>
        <TimesheetHeader />
        {/*<DashboardPage />*/}
        <TimesheetFilters
          searchText={searchText}
          setSearchText={setSearchText}
          filterStartDate={filterStartDate}
          setFilterStartDate={setFilterStartDate}
          filterEndDate={filterEndDate}
          setFilterEndDate={setFilterEndDate}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        <TimesheetTable
          loading={loading}
          data={paginatedData}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          mapWorkType={mapWorkType}
          projectInfo={projectInfo}
          refreshData={() => {
            // Callback to refresh data after save
            setLoading(true);
            fetch(
              `${
                import.meta.env.VITE_TIMESHEET_API_ENDPOINT
              }/api/timesheet/history`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            )
              .then((res) => res.json())
              .then((data) => {
                // Group entries by week
                const weeklyEntries = groupEntriesByWeek(data);
                setEntries(weeklyEntries);
                setLoading(false);
              })
              .catch((err) => {
                console.error("Failed to fetch timesheets:", err);
                setLoading(false);
              });
          }}
        />
      </main>
    </div>
  );
};

export default TimesheetHistoryPage;
