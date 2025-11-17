// KPICards.jsx

import React from 'react';

/**
 * Component for rendering KPI summary cards
 */
const KPICards = ({ kpis }) => {
    console.log("KPI DATA ↓↓↓ : ", kpis);
    return (
        <div className="kpi-grid">
            {/* Card 1: Total Hours Logged */}
            <div className="kpi-card kpi-card-indigo">
                <p className="kpi-label">Total Hours Logged </p>
                <p className="kpi-value kpi-value-indigo">
                    {kpis.monthlyTotalAdjusted.toFixed(1)} hrs
                </p>
                {/* <span className="kpi-meta kpi-meta-green">Goal: 160 hrs</span> */}
            </div>

            {/* Card 2: Billable vs Non-Billable */}
            <div className="kpi-card kpi-card-green">
                <p className="kpi-label">Billable vs Non-Billable</p>
                <p className="kpi-value kpi-value-green">
                    {kpis.billableRatio} hrs / {kpis.nonBillableRatio} hrs
                </p>
                {/* <span className="kpi-meta kpi-meta-gray">
                    {kpis.monthlyBillableHours.toFixed(1)} Billable hrs
                </span> */}
            </div>

            {/* Card 3: Leaves / Absence */}
            <div className="kpi-card kpi-card-amber">
                <p className="kpi-label">Leaves / Holidays (Days)</p>
                <p className="kpi-value kpi-value-amber">
                    {kpis?.leavesAndHolidays.totalLeavesDays ?? 0} / {kpis?.leavesAndHolidays.totalHolidays ?? 0} Days
                </p>
                {/* <span className="kpi-meta kpi-meta-red">
                    1 Personal Day, 1.0 Sick Day (16.0 Adjusted hrs)
                </span> */}
            </div>
            

            {/* Card 4: Current Active Projects */}
            <div className="kpi-card kpi-card-sky">
                <p className="kpi-label">Current Active Projects</p>
                <p className="kpi-value kpi-value-sky">{kpis.activeProjectsCount} Projects</p>
                {/* <span className="kpi-meta kpi-meta-gray">Based on logged time</span> */}
            </div>
        </div>
    );
};

export default KPICards;