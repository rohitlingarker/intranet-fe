import React, { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
// REMOVED: import { WEEKS, MOCK_DATA } from "./constants";
import KPICards from "./KPICards";
import ProjectDonutChart from "./ProjectDonutChart";
import DayOfWeekBarChart from "./DayOfWeekBarChart";
import WeeklySummaryCard from "./WeeklySummaryCard";
import "./MonthlyTSReport.css";
import LoadingSpinner from "../../components/LoadingSpinner.jsx"

const TS_BASE_URL = import.meta.env.VITE_TIMESHEET_API_ENDPOINT;

const MonthlyTSReport = () => {
  const [apiData, setApiData] = useState(null);
  const [kpis, setKpis] = useState({
    monthlyTotalAdjusted: 0,
    monthlyBillableHours: 0,
    billableRatio: 0,
    nonBillableRatio: 0,
    activeProjectsCount: 0,
    leaves: { days: 0, hours: 0 },
    holidays: { days: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Allow these to be controlled later via UI
  const [month, setMonth] = useState(11);
  const [year, setYear] = useState(2025);
 const [projectInfo, setProjectInfo] = useState([]);

useEffect(() => {
  const loadProjectInfo = async () => {
    try {
      const res = await fetch(`${TS_BASE_URL}/api/project-info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setProjectInfo(data);
    } catch (err) {
      console.error("Failed to load project info", err);
    }
  };

  loadProjectInfo();
}, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${TS_BASE_URL}/api/report/user_monthly?month=${month}&year=${year}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setApiData(data);
      } catch (e) {
        setError(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);


  useEffect(() => {
  if (!apiData) return;

  const total = apiData.totalHoursWorked;        // use as-is
  const billable = apiData.billableHours;        // use as-is
  const nonBillable = apiData.nonBillableHours;  // use as-is

  const billPct =
    total > 0 ? ((billable / total) * 100).toFixed(1) : "0";

  const nonPct =
    total > 0 ? ((nonBillable / total) * 100).toFixed(1) : "0";

  setKpis({
    monthlyTotalAdjusted: total,
    monthlyBillableHours: billable,
    monthlyNonBillableHours: nonBillable,
    billableRatio: billPct,
    nonBillableRatio: nonPct, 
    activeProjectsCount: apiData.activeProjectsCount,
    leaves: {
      days: apiData.leavesAndHolidays?.totalLeavesDays,
      hours: apiData.leavesAndHolidays?.totalLeavesHours,
    },
    holidays: {
      days: apiData.leavesAndHolidays?.totalHolidays,
    },
  });
}, [apiData]);

  const allEntries = useMemo(() => {
    if (!apiData) return [];
    const rows = [];
    for (const week of apiData.weeklySummaryHistory || []) {
      for (const ts of week.timesheets || []) {
        const workDate = ts.workDate;
        if (!ts.defaultHolidayTimesheet && Array.isArray(ts.entries)) {
          for (const e of ts.entries) {
            rows.push({
              date: workDate,
              project: e.projectName || `Project ${e.projectId ?? ""}`,
              type: e.isBillable ? "Billable" : "Non-Billable",
              hours: Number(e.hoursWorked || 0),
              description: e.description || "",
            });
          }
        }
      }
    }
    return rows;
  }, [apiData]);

  const dayOfWeekData = useMemo(() => {
    if (!apiData?.dayWiseSummary) return null;
    const map = apiData.dayWiseSummary;
    const orderedDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    return orderedDays.map((d) => ({
      day: d.charAt(0).toUpperCase() + d.slice(1),
      hours: Number(map[d] || 0),
    }));
  }, [apiData]);

  const handleDownloadPDF = () => {
    if (!apiData) return;
    const pdf = new jsPDF("p", "mm", "a4");

    const monthLabel = new Date(
      `${year}-${String(month).padStart(2, "0")}-01`
    ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Header
    pdf.setFontSize(18);
    pdf.text(`Monthly Timesheet: ${monthLabel}`, 14, 20);
    pdf.setFontSize(12);
    pdf.text(`Employee: ${apiData.employeeName || "-"}`, 14, 28);
    pdf.text(
      `Employee ID: ${
        apiData.employeeId || "-"
      } | Department: Product Development`,
      14,
      34
    );

    // KPI Summary
    pdf.setFontSize(14);
    pdf.text("KPI Summary", 14, 44);
    pdf.setFontSize(12);
    pdf.text(
      `Monthly Total Adjusted: ${kpis.monthlyTotalAdjusted.toFixed(1)} hrs`,
      14,
      52
    );
    pdf.text(
      `Monthly Billable Hours: ${kpis.monthlyBillableHours.toFixed(1)} hrs`,
      14,
      58
    );
    pdf.text(`Billable Ratio: ${kpis.billableRatio}%`, 14, 64);
    pdf.text(`Non-Billable Ratio: ${kpis.nonBillableRatio}%`, 14, 70);

    // Detailed Log Table
    const tableData = [];
    const weeks = (apiData.weeklySummaryHistory || [])
      .slice()
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    weeks.forEach((week, idx) => {
      for (const ts of week.timesheets || []) {
        if (ts.defaultHolidayTimesheet) {
          tableData.push([
            ts.workDate,
            "-",
            "Holiday/Default",
            Number(ts.hoursWorked || 0),
            "-",
          ]);
          continue;
        }
        for (const e of ts.entries || []) {
          tableData.push([
            ts.workDate,
            e.projectName || `Project ${e.projectId ?? ""}`,
            e.isBillable ? "Billable" : "Non-Billable",
            Number(e.hoursWorked || 0),
            e.description || "",
          ]);
        }
      }
      tableData.push([
        `Week ${idx + 1} Total`,
        "",
        "",
        Number(week.totalHours || 0),
        "",
      ]);
    });

    autoTable(pdf, {
      head: [["Date", "Project", "Type", "Hours", "Description"]],
      body: tableData,
      startY: 80,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });

    const finalY = pdf.lastAutoTable?.finalY || 80;
    pdf.setFontSize(12);
    pdf.text(
      `MONTHLY TOTAL LOGGED (ADJUSTED): ${kpis.monthlyTotalAdjusted.toFixed(
        1
      )} hrs`,
      14,
      finalY + 10
    );

    pdf.save(`Monthly_Timesheet_${monthLabel.replace(" ", "_")}.pdf`);
  };

  if (loading) {
    return (
      <div className="timesheet-container">
        <div className="timesheet-wrapper"><LoadingSpinner text="Loading..." /></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="timesheet-container">
        <div className="timesheet-wrapper">Error: {error}</div>
      </div>
    );
  }
  if (!apiData) return null;

  const monthLabelUI = new Date(
    `${year}-${String(month).padStart(2, "0")}-01`
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="timesheet-container">
      <div className="timesheet-wrapper">
        <header className="timesheet-header">
          <div className="header-content">
            <div>
              <h1 className="timesheet-title">{`Monthly Timesheet: ${monthLabelUI}`}</h1>
              <p className="employee-name">Employee: {apiData.employeeName}</p>
              <p className="employee-details">
                Employee ID: {apiData.employeeId} 
              </p>
            </div>
            <button className="download-btn" onClick={handleDownloadPDF}>
              Download 
            </button>
          </div>
        </header>

        <KPICards kpis={kpis} />

        {/* Donut from per-entry aggregation; alternatively you can render from projectSummaries */}
        <ProjectDonutChart entries={apiData.projectSummaries.projects} />

        <DayOfWeekBarChart
          entries={allEntries}
          dataOverride={dayOfWeekData || undefined}
        />

        <section className="timesheet-section">
          <div className="mb-4 text-lg font-semibold text-gray-800">
            Month (Week-wise)
          </div>
          <div className="space-y-4">
            {(apiData.weeklySummaryHistory || []).map((week, idx) => (
              <WeeklySummaryCard key={idx} week={week} projectInfo={projectInfo}/>
            ))}
          </div>
        </section>

        <div className="footer-summary">
          <span className="footer-label">MONTHLY TOTAL LOGGED :</span>
          <span className="footer-value">
            {kpis.monthlyTotalAdjusted.toFixed(1)} hrs
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTSReport;
