import React, { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

// import { WEEKS } from "./constants"; 
import { isDateInWeek, groupBy, getDailyTotal } from "./utils";

import KPICards from "./KPICards";
import ProjectDonutChart from "./ProjectDonutChart";
import DayOfWeekBarChart from "./DayOfWeekBarChart";
import WeeklySummaryCard from "./WeeklySummaryCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./MonthlyTSReport.css";

const transformProjectSummary = (summary) => {
  if (!summary?.projects) return [];

  return summary.projects.map((p) => ({
    project: p.projectName,
    hours: p.totalHours,
    billableHours: p.billableHours,
    nonBillableHours: p.nonBillableHours,
    type: p.billableHours > 0 ? "Billable" : "Non-Billable",
  }));
};

const MonthlyTSReport = () => {
  const TS_BASE_URL = import.meta.env.VITE_TIMESHEET_API_ENDPOINT;

  // backend response
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [weeklyStatuses, setWeeklyStatuses] = useState(() => WEEKS.map(() => "Draft"));
  const [weeklyTotals, setWeeklyTotals] = useState({});

  // Flatten timesheet entries from backend to a simple array used by charts/PDF/KPIs
  const allEntries = useMemo(() => {
    if (!reportData) return [];

    const list = [];

    // backend structure: reportData.weeklySummaryHistory[].timesheets[].entries[]
    (reportData.weeklySummaryHistory || []).forEach((week) => {
      (week.timesheets || []).forEach((ts) => {
        const workDate = ts.workDate || ts.workDate; // standardize
        (ts.entries || []).forEach((e) => {
          list.push({
            date: workDate,
            projectId: e.projectId,
            taskId: e.taskId,
            description: e.description,
            hours: e.hoursWorked,
            isBillable: !!e.isBillable,
            type: e.isBillable ? "Billable" : "Non-Billable",
            project: e.projectName || `Project ${e.projectId}`,
            rawEntry: e,
            timesheetId: ts.timesheetId,
            timesheetStatus: ts.status,
          });
        });

        // if there are timesheets with 0 entries but have hours (default holiday), we still want a record
        if ((!ts.entries || ts.entries.length === 0) && ts.hoursWorked) {
          list.push({
            date: workDate,
            projectId: null,
            taskId: null,
            description: ts.isHolidayTimesheet ? "Holiday/Default" : "",
            hours: ts.hoursWorked,
            isBillable: false,
            type: "Non-Billable",
            project: ts.isHolidayTimesheet ? "Holiday" : "",
            rawEntry: null,
            timesheetId: ts.timesheetId,
            timesheetStatus: ts.status,
          });
        }
      });
    });

    return list;
  }, [reportData]);

  // KPIs state derived from backend values where possible, but compute any derived ones
  const [kpis, setKpis] = useState({
    monthlyTotalAdjusted: 0,
    monthlyBillableHours: 0,
    billableRatio: 0,
    nonBillableRatio: 0,
    activeProjectsCount: 0,
    leavesAndHolidays: { totalLeavesDays: 0, totalHolidays: 0 },
  });

  // fetch report on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    axios
      .get(`${TS_BASE_URL}/api/report/user_monthly`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          month: 11,
          year: 2025,
        },
      })
      .then((res) => {
        if (!mounted) return;
        console.log("API RESPONSE ↓↓↓");
        console.log(res.data);

        setReportData(res.data);

        // set weeklyStatuses initial value if backend provides statuses
        if (res.data && Array.isArray(res.data.weeklySummaryHistory)) {
          const statuses = res.data.weeklySummaryHistory.map((w) => w.weeklyStatus || "Draft");
          setWeeklyStatuses(statuses);
        }

        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Error fetching monthly report:", err);
        setError(err);
        setLoading(false);
      });

    return () => (mounted = false);
  }, [TS_BASE_URL]);


  useEffect(() => {
    // If backend provided summary totals, prefer those for accuracy
    if (!reportData && allEntries.length === 0) return;

    // Start from backend aggregate values if available
    const backendTotal = reportData?.totalHoursWorked ?? null;
    const backendBillable = reportData?.billableHours ?? null;

    // Compute weekly totals with date-grouping (fallback if backend totals are absent)
    let monthlyTotalAdjusted = backendTotal !== null ? backendTotal : 0;
    let monthlyBillableHours = backendBillable !== null ? backendBillable : 0;

    const newWeeklyTotals = {};

    WEEKS.forEach((week, idx) => {
      const weekEntries = allEntries.filter((e) => isDateInWeek(e.date, week.start, week.end));

      if (weekEntries.length === 0) {
        // if backend has weekly summary, use that
        const backendWeek = (reportData?.weeklySummaryHistory || []).find(
          (w) => w.startDate === week.start || w.weekId === week.weekId
        );
        newWeeklyTotals[idx] = backendWeek ? (backendWeek.totalHours || 0) : 0;
        return;
      }

      const grouped = groupBy(weekEntries, "date");
      let weeklyTotal = 0;

      Object.keys(grouped).forEach((date) => {
        const dailyEntries = grouped[date];
        const dailyTotal = getDailyTotal(dailyEntries);
        weeklyTotal += dailyTotal;

        // if backend aggregates not present, accumulate
        if (backendTotal === null) monthlyTotalAdjusted += dailyTotal;

        dailyEntries.forEach((e) => {
          if (e.isBillable && backendBillable === null) monthlyBillableHours += e.hours;
        });
      });

      newWeeklyTotals[idx] = Number(weeklyTotal.toFixed(1));
    });

    const monthlyNonBillableAdjusted = monthlyTotalAdjusted - monthlyBillableHours;

    const billableRatio = monthlyTotalAdjusted > 0 ? Number(((monthlyBillableHours / monthlyTotalAdjusted) * 100).toFixed(1)) : 0;
    const nonBillableRatio = monthlyTotalAdjusted > 0 ? Number(((monthlyNonBillableAdjusted / monthlyTotalAdjusted) * 100).toFixed(1)) : 0;

    setKpis((prev) => ({
      monthlyTotalAdjusted,
      monthlyBillableHours,
      billableRatio,
      nonBillableRatio,
      activeProjectsCount: reportData?.activeProjectsCount ?? prev.activeProjectsCount,
      leavesAndHolidays: {
        totalLeavesDays: reportData?.leavesAndHolidays?.totalLeavesDays ??
      prev.leavesAndHolidays.totalLeavesDays,
        totalHolidays: reportData?.leavesAndHolidays?.totalHolidays ??
      prev.leavesAndHolidays.totalHolidays,
      },
    }));

    setWeeklyTotals(newWeeklyTotals);
  }, [reportData, allEntries]);

  const handleSubmitWeek = (index) => {
    const updated = [...weeklyStatuses];
    updated[index] = "Submitted";
    setWeeklyStatuses(updated);

    // optionally call backend to submit week
    // axios.post(`${TS_BASE_URL}/api/timesheet/submitWeek`, { weekIndex: index }, { headers: ... })
  };

  /** Generate PDF using flattened entries + weekly totals + reportData details */
  const handleDownloadPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");

    const monthTitle = `Monthly Timesheet: ${reportData?.monthName ?? "November 2025"}`;
    pdf.setFontSize(18);
    pdf.text(monthTitle, 14, 20);

    pdf.setFontSize(12);
    pdf.text(`Employee: ${reportData?.employeeName ?? "-"}`, 14, 28);
    pdf.text(`Employee ID: ${reportData?.employeeId ?? "-"} | Active Projects: ${reportData?.activeProjectsCount ?? "-"}`, 14, 34);

    // KPI summary
    pdf.setFontSize(14);
    pdf.text("KPI Summary", 14, 44);
    pdf.setFontSize(12);
    pdf.text(`Monthly Total Adjusted: ${kpis.monthlyTotalAdjusted.toFixed(1)} hrs`, 14, 52);
    pdf.text(`Monthly Billable Hours: ${kpis.monthlyBillableHours.toFixed(1)} hrs`, 14, 58);
    pdf.text(`Billable Ratio: ${kpis.billableRatio}%`, 14, 64);
    pdf.text(`Non-Billable Ratio: ${kpis.nonBillableRatio}%`, 14, 70);

    // Detailed table
    const tableData = [];

    WEEKS.forEach((week, index) => {
      const entriesForWeek = allEntries.filter((entry) => isDateInWeek(entry.date, week.start, week.end));

      if (entriesForWeek.length === 0) {
        // show a placeholder row if backend has week summary but no entries
        const backendWeek = (reportData?.weeklySummaryHistory || [])[index];
        if (backendWeek && backendWeek.totalHours) {
          tableData.push([`${week.start} - ${week.end}`, "-", "-", backendWeek.totalHours, backendWeek.weeklyStatus || ""]);
        }
      }

      entriesForWeek.forEach((entry) => {
        tableData.push([
          entry.date,
          entry.project || "-",
          entry.type || "-",
          entry.hours,
          entry.description || "",
        ]);
      });

      // weekly total row
      tableData.push([`Week ${index + 1} Total`, "", "", weeklyTotals[index] ?? 0, ""]);
    });

    autoTable(pdf, {
      head: [["Date", "Project", "Type", "Hours", "Description"]],
      body: tableData,
      startY: 80,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });

    const finalY = (pdf).lastAutoTable?.finalY || 80;
    pdf.setFontSize(12);
    pdf.text(`MONTHLY TOTAL LOGGED (ADJUSTED): ${kpis.monthlyTotalAdjusted.toFixed(1)} hrs`, 14, finalY + 10);

    const fileName = `Monthly_Timesheet_${reportData?.employeeName?.replace(/\s+/g, "_") ?? "user"}_${reportData?.monthName ?? "Nov_2025"}.pdf`;
    pdf.save(fileName);
  };

  if (loading) {
    return (
        <div className="p-6"><LoadingSpinner text="Loading monthly timesheet..." /></div>
    );
  }

  if (error) {
    return (
      <div className="timesheet-wrapper">
        <div className="p-6 text-red-600">Error loading report. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="timesheet-wrapper">
      {/* Header */}
      <header className="timesheet-header">
        <div className="header-content">
          <div>
            <h1 className="timesheet-title">Monthly Timesheet: {reportData?.monthName ?? "November 2025"}</h1>
            <p className="employee-name">Employee: {reportData?.employeeName}</p>
            <p className="employee-details">Employee ID: {reportData?.employeeId}</p>
          </div>

          <div className="header-actions">
            <button className="download-btn" onClick={handleDownloadPDF}>⬇️ Download PDF</button>
          </div>
        </div>
      </header>

      {/* KPI Summary */}
      <KPICards kpis={kpis} />

      {/* Donut Chart */}
      <ProjectDonutChart entries={transformProjectSummary(reportData?.projectSummaries)} globalTotalHours={reportData.projectSummaries.globalTotalHours} />

      {/* Day of Week Chart */}
      <DayOfWeekBarChart entries={allEntries} dayWiseSummary={reportData?.dayWiseSummary} />
      {/* Detailed Log (weekwise) */}
      <section className="timesheet-section">
        <div className="mb-4 text-lg font-semibold text-gray-800">Month (Week-wise)</div>
        <div className="space-y-4">
          {(reportData?.weeklySummaryHistory || []).map((week, idx) => (
            <WeeklySummaryCard
              key={week.weekId ?? idx}
              week={week}
              onSubmit={() => handleSubmitWeek(idx)}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="footer-summary">
        <span className="footer-label">MONTHLY TOTAL LOGGED :</span>
        <span className="footer-value">{kpis.monthlyTotalAdjusted.toFixed(1)} hrs</span>
      </div>
    </div>
  );
};

export default MonthlyTSReport;