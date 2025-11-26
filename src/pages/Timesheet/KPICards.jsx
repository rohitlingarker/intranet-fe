import React from "react";

/**
 * KPI summary cards
 */
const KPICards = ({ kpis }) => {
  return (
    <div className="kpi-grid">
      <div className="kpi-card kpi-card-indigo">
        <p className="kpi-label">Total Hours Logged</p>
        <p className="kpi-value kpi-value-indigo">{kpis.monthlyTotalAdjusted.toFixed(1)} hours</p>
        {/* <span className="kpi-meta kpi-meta-green">Goal: 160 hrs</span> */}
      </div>

      <div className="kpi-card bg-purple-50 shadow-md rounded-xl p-5 border-l-4 border-purple-600">
        <p className="kpi-label">Total Working Days</p>
        <p className="kpi-value text-3xl font-bold text-purple-800 mt-1">
          {kpis.totalWorkingDays || 0} Days
          </p>
      </div>

        
      <div className="kpi-card kpi-card-green">
        <p className="kpi-label">Billable vs Non-Billable</p>
        <p className="kpi-value kpi-value-green">
          {kpis.monthlyBillableHours} / {kpis.monthlyNonBillableHours} hours
        </p>
        {/* <span className="kpi-meta kpi-meta-gray">
          {kpis.monthlyBillableHours.toFixed(1)} Billable hrs
        </span> */}
      </div>

      <div className="kpi-card kpi-card-sky">
        <p className="kpi-label">Current Active Projects</p>
        <p className="kpi-value kpi-value-sky">{kpis.activeProjectsCount} Projects</p>
        {/* <span className="kpi-meta kpi-meta-gray">Based on logged time</span> */}
      </div>

      <div className="kpi-card kpi-card-amber">
        <p className="kpi-label"> Total Leaves</p>
        <p className="kpi-value kpi-value-amber">
          {kpis.leaves?.days || 0} Days
        </p>
        {/* <span className="kpi-meta kpi-meta-red">
          {(kpis.leaves?.hours || 0).toFixed(1)} Adjusted hrs
        </span> */}
      </div>

      <div className="kpi-card bg-rose-50 shadow-md rounded-xl p-5 border-l-4 border-rose-600">
        <p className="kpi-label">Total Monthly Holidays</p>
        <p className="kpi-value text-3xl font-bold text-rose-800 mt-1">
          {kpis.holidays?.days || 0} Days
          </p>
        </div>
    </div>
  );
};

export default KPICards;