// DailyEntries.jsx

import React from 'react';
import TaskRow from './TaskRow';
import { getDailyTotal, formatDate } from './utils';

/**
 * Component for rendering a single day's timesheet entries
 */
const DailyEntries = React.memo(({ entries }) => {
    if (!entries || entries.length === 0) return null;

    const date = entries[0].date; 
    const dailyTotal = getDailyTotal(entries);
    const displayDate = formatDate(date);
    const isWeekend = entries[0].day === 'Sat' || entries[0].day === 'Sun';

    return (
        <>
            {/* Daily Header */}
            <div className={`daily-header ${isWeekend ? 'daily-header-weekend' : ''}`}>
                <span className="daily-date">{displayDate}</span>
                <span className="daily-total">{dailyTotal.toFixed(1)} hrs</span>
            </div>

            {/* Tasks Table */}
            <div className="timesheet-table-wrapper">
                <table className="timesheet-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Task Description</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Work Location</th>
                            <th className="text-center">Billable</th>
                            <th className="text-right">Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, i) => (
                            <TaskRow key={i} entry={entry} />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
});

DailyEntries.displayName = 'DailyEntries';

export default DailyEntries;