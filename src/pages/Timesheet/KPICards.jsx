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

      <div className="kpi-card kpi-card-green">
        <p className="kpi-label">Billable vs Non-Billable</p>
        <p className="kpi-value kpi-value-green">
          {kpis.monthlyBillableHours.toFixed(1)} / {kpis.monthlyNonBillableHours.toFixed(1)} hours
        </p>
        {/* <span className="kpi-meta kpi-meta-gray">
          {kpis.monthlyBillableHours.toFixed(1)} Billable hrs
        </span> */}
      </div>

      <div className="kpi-card kpi-card-amber">
        <p className="kpi-label">Leaves / Holidays (Days)</p>
        <p className="kpi-value kpi-value-amber">
          {kpis.leaves?.days || 0} / {kpis.holidays?.days || 0} Days
        </p>
        {/* <span className="kpi-meta kpi-meta-red">
          {(kpis.leaves?.hours || 0).toFixed(1)} Adjusted hrs
        </span> */}
      </div>

      <div className="kpi-card kpi-card-sky">
        <p className="kpi-label">Current Active Projects</p>
        <p className="kpi-value kpi-value-sky">{kpis.activeProjectsCount} Projects</p>
        {/* <span className="kpi-meta kpi-meta-gray">Based on logged time</span> */}
      </div>
    </div>
  );
};

export default KPICards;