"use client";

import React from "react";

export default function JobPage() {
  const jobData = {
    employee_number: "PAVS001",
    date_of_joining: "23 Apr 2023",
    primary_job: "Graduate Software Engineer",
    employment_type: "Permanent",
    time_type: "Full Time",
    notice_period: "90 Days",
    contract_status: "Not Applicable",
  };

  const organizationData = {
    business_unit: "Not Set",
    department: "Engineering",
    location: "Hyderabad Office",
    cost_center: "Not Set",
    legal_entity: "Paves Global Fintech Private Limited",
    reports_to: "Ram Gopal Varma",
    manager: "Sambi Reddy",
    direct_reports: "0 Employees",
  };

  const timeData = {
    shift: "Shift 1",
    weekly_policy: "Standard Weekly Off (Sat-Sun)",
    leave_plan: "General Leave Plan",
    holiday_calendar: "2026",
    attendance_number: "PAVS001",
    attendance_policy: "General Attendance Policy",
    overtime: "Not Set",
  };

  const otherData = {
    expense_policy: "General Expense Policy",
    loan_policy: "Not Set",
    ar_ticket_policy: "Not Set",
  };

  return (
    <div className="space-y-6">

      {/* ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        <Card title="Job Details">
          <Row label="Employee Number" value={jobData.employee_number} />
          <Row label="Date of Joining" value={jobData.date_of_joining} />
          <Row label="Designation" value={jobData.primary_job} />
          <Row label="Employment Type" value={jobData.employment_type} />
          <Row label="Time Type" value={jobData.time_type} />
          <Row label="Notice Period" value={jobData.notice_period} />
          <Row label="Contract Status" value={jobData.contract_status} />
        </Card>

        <Card title="Organization">
          <Row label="Business Unit" value={organizationData.business_unit} />
          <Row label="Department" value={organizationData.department} />
          <Row label="Location" value={organizationData.location} />
          <Row label="Cost Center" value={organizationData.cost_center} />
          <Row label="Legal Entity" value={organizationData.legal_entity} />
          <Row label="Reports To" value={organizationData.reports_to} />
          <Row label="Manager" value={organizationData.manager} />
          <Row label="Direct Reports" value={organizationData.direct_reports} />
        </Card>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        <Card title="Employee Time">
          <Row label="Shift" value={timeData.shift} />
          <Row label="Weekly Off Policy" value={timeData.weekly_policy} />
          <Row label="Leave Plan" value={timeData.leave_plan} />
          <Row label="Holiday Calendar" value={timeData.holiday_calendar} />
          <Row label="Attendance Number" value={timeData.attendance_number} />
          <Row label="Attendance Policy" value={timeData.attendance_policy} />
          <Row label="Overtime" value={timeData.overtime} />
        </Card>

        <Card title="Other">
          <Row label="Expense Policy" value={otherData.expense_policy} />
          <Row label="Loan Policy" value={otherData.loan_policy} />
          <Row label="AR Ticket Policy" value={otherData.ar_ticket_policy} />
        </Card>
      </div>
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

const Card = ({ title, children }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-indigo-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-indigo-100 bg-indigo-50/60">
      <h3 className="text-sm font-semibold text-indigo-800">{title}</h3>
    </div>
    <div className="p-6 space-y-3 text-sm">
      {children}
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm min-w-0">
    <span className="text-gray-500 shrink-0">{label}</span>
    <span className="text-gray-900 font-medium text-right break-words min-w-0">
      {value}
    </span>
  </div>
);