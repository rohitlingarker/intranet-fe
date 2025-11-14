import React, { useEffect, useState, useRef } from "react";
import "./ReportDashboard.css";
import {
  FileDown,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  BarChart2,
  Briefcase,
  Coffee,
  Filter,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import Pagination from "../../components/Pagination/pagination";
import LoadingSpinner from "../../components/LoadingSpinner";

const monthOptions = [
  { name: "January", value: 1 },
  { name: "February", value: 2 },
  { name: "March", value: 3 },
  { name: "April", value: 4 },
  { name: "May", value: 5 },
  { name: "June", value: 6 },
  { name: "July", value: 7 },
  { name: "August", value: 8 },
  { name: "September", value: 9 },
  { name: "October", value: 10 },
  { name: "November", value: 11 },
  { name: "December", value: 12 },
];

const currentYear = new Date().getFullYear();
const yearOptions = [currentYear, currentYear - 1];

export default function ReportDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const TS_BASE_URL = import.meta.env.VITE_TIMESHEET_API_ENDPOINT;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [appliedMonth, setAppliedMonth] = useState(new Date().getMonth() + 1);
  const [appliedYear, setAppliedYear] = useState(new Date().getFullYear());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        const res = await axios.get(
          `${TS_BASE_URL}/api/report/monthly_finance`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: {
              month: appliedMonth,
              year: appliedYear,
            },
          }
        );
        const json = res.data;
        setData(json);
        setSelectedMonth(json.month);
        setSelectedYear(json.year);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [TS_BASE_URL, appliedMonth, appliedYear]);

  const handleFilterApply = () => {
    setAppliedYear(selectedYear);
    setAppliedMonth(selectedMonth);
    setIsFilterOpen(false); // <-- ADD THIS LINE
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: document.documentElement.scrollWidth,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);

    // Handle multipage export if content is taller than one page
    let heightLeft = pdfHeight - pdf.internal.pageSize.getHeight();
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(
      `Finance_Report_${data?.month || "Month"}_${data?.year || "Year"}.pdf`
    );
  };

  if (loading)
    return (
      <div className="loading-screen">
        <LoadingSpinner text="Loading Reports..." />
      </div>
    );
  if (!data)
    return (
      <div className="report-container text-center font-semibold">
        No data found.
      </div>
    );

  const employeeBreakdown = data.employeeBreakdown || [];
  const employeeProductivity = data.employeeProductivity || [];
  const projectBreakdown = data.projectBreakdown || [];
  const leaveHoursBreakdown = data.leaveHoursBreakdown || [];

  // Base pagination on the main list, e.g., employeeBreakdown
  const totalPages = Math.ceil(employeeBreakdown.length / itemsPerPage);

  // Create paginated slices for EACH list you want to paginate
  const paginatedEmployeeBreakdown = employeeBreakdown.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedEmployeeProductivity = employeeProductivity.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedProjectBreakdown = projectBreakdown.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedleaveHoursBreakdown = leaveHoursBreakdown.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="report-container" ref={reportRef}>
      {/* Header */}
      <div className="report-header">
        <div>
          <h1>Monthly Finance Timesheet Report</h1>
          <p className="subtitle pt-1">
            Team Productivity & Utilization Metrics
          </p>
          <p className="month pt-1">
            Report Month:
            <button
              className="filter-toggle-btn"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <span>
                {data.month},{data.year}
              </span>
            </button>
          </p>
          {isFilterOpen && (
            <div className="report-filters">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button className="apply-btn" onClick={handleFilterApply}>
                Apply
              </button>
            </div>
          )}
        </div>
        <button className="export-btn" onClick={handleExportPDF}>
          <FileDown size={16} /> Export PDF
        </button>
      </div>

      {/* Top Stats */}
      <div className="stats-grid compact">
        <div className="stat-card white-card hover-lift">
          <Calendar size={22} className="icon text-blue" />
          <p>Total Working Days</p>
          <h2>{data.totalWorkingDays}</h2>
        </div>
        <div className="stat-card white-card hover-lift">
          <Clock size={22} className="icon text-green" />
          <p>Total Billable Hours</p>
          <h2>{data.totalBillableHours}</h2>
        </div>
        <div className="stat-card white-card hover-lift">
          <TrendingUp size={22} className="icon text-amber" />
          <p>Utilization Rate</p>
          <h2>{data.utilizationRate}</h2>
        </div>
        <div className="stat-card white-card hover-lift">
          <Users size={22} className="icon text-indigo" />
          <p>Total Employees</p>
          <h2>{data.totalEmployees || 0}</h2>
        </div>
      </div>

      {/* Hours Breakdown */}
      <div className="section-card">
        <h3>
          <BarChart2 size={18} /> Hours Breakdown Summary
        </h3>
        <div className="hours-grid">
          {[
            {
              icon: <Briefcase size={18} />,
              label: "Billable Hours",
              value: data.hoursBreakdown?.billableHours,
              color: "green",
            },
            {
              icon: <Coffee size={18} />,
              label: "Non-Billable Hours",
              value: data.hoursBreakdown?.nonBillableHours,
              color: "orange",
            },
            {
              icon: <Clock size={18} />,
              label: "Total Hours",
              value: data.hoursBreakdown?.totalHours,
              color: "blue",
            },
            {
              icon: <Calendar size={18} />,
              label: "Leave Hours",
              value: data.hoursBreakdown?.leaveHours,
              color: "red",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`hours-card hover-lift border-${item.color}`}
            >
              <div className="card-top">
                {item.icon}
                <h4>{item.label}</h4>
              </div>
              <span className={`${item.color}-text`}>{item.value || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Breakdown */}
      <div className="section-card">
        <h3>
          <Users size={18} /> Employee HoursWise Breakdown
        </h3>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Working Days</th>
              <th>Billable</th>
              <th>Non-Billable</th>
              <th>Leave</th>
              <th>Total</th>
              <th>Billable Utilization</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployeeBreakdown.map((e, i) => (
              <tr key={i}>
                <td>{e.name}</td>
                <td>{e.workingDays}</td>
                <td>{e.billableHours}</td>
                <td>{e.nonBillableHours}</td>
                <td>{e.leaveHours ?? "-"}</td>
                <td>{e.totalHours}</td>
                <td>
                  <span className="badge-green">{e.productivity ?? "-"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="mb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              onNext={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
            />
          </div>
        )}
      </div>

      {/* Employee Productivity */}
      <div className="section-card">
        <h3>
          <TrendingUp size={18} /> Employee Productivity
        </h3>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Working Days</th>
              <th>Total Hours</th>
              <th>Productivity</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployeeProductivity.map((p, i) => (
              <tr key={i}>
                <td>{p.employeeId ?? "-"}</td>
                <td>{p.employeeName ?? "-"}</td>
                <td>{p.workingDays ?? "-"}</td>
                <td>{p.totalHours ?? "-"}</td>
                <td>
                  <span className="badge-blue">{p.productivity ?? "-"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="mb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              onNext={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
            />
          </div>
        )}
      </div>

      {/* Employee leaveHoursBreakdown */}
      <div className="section-card">
        <h3>
          <Calendar size={18} /> Employee leaveHoursBreakdown
        </h3>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Leave Days</th>
              <th>Leave Hours</th>
              <th>Contribution</th>
            </tr>
          </thead>
          <tbody>
            {paginatedleaveHoursBreakdown.map((p, i) => (
              <tr key={i}>
                <td>{p.userId ?? "-"}</td>
                <td>{p.userName ?? "-"}</td>
                <td>{p.noOfDays ?? "-"}</td>
                <td>{p.leaveHours ?? "-"}</td>
                <td>
                  <span className="badge-yellow">{p.contribution ?? "-"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="mb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              onNext={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
            />
          </div>
        )}
      </div>

      {/* Project Breakdown */}
      <div className="section-card">
        <h3>
          <Briefcase size={18} /> Project-wise Breakdown
        </h3>
        <div className="projects-grid">
          {paginatedProjectBreakdown.map((p, i) => (
            <div key={i} className="project-card hover-lift">
              <div className="card-top">
                <Users size={18} className="text-blue" />
                <h4>{p.projectName ?? p.name}</h4>
              </div>
              <p>{p.teamMembers ?? "-"} team members</p>
              <span>{p.totalHours ?? p.hours} hrs</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report Notes */}
      <div className="notes-card">
        <h4>Report Notes</h4>
        <ul>
          <li>
            Billable Hours = Total hours spent on tasks classified as billable
            across all projects.
          </li>
          <li>Standard holiday hours = (Mon-Fri calculated 8 hrs/holiday).</li>
          <li>
            Non-Billable Hours = Sum of all task hours marked as non-billable
            across all projects + Standard holiday hours.
          </li>
          <li>Total Hours = Billable Hours + Non-Billable Hours</li>
          <li>Billable Utilization% = Billable Hours ÷ Total Hours × 100</li>
          <li>Minimum Monthly hours = 176</li>
          <li>
            Productivity% = (Total Hours − Holiday Hours) ÷ Minimum Monthly
            hours × 100
          </li>
          {/* <li>Billable Rate = (Billable Hours / Total Available Hours) × 100</li>
          <li>Total Available Hours = Working Days × 8 hours - Leave Hours</li>
          <li>Target utilization rate: 75% for sustainable productivity</li>
          <li>Productivity = (Total Hours / 160) × 100</li> */}
        </ul>
      </div>
    </div>
  );
}
