// TaskRow.jsx

import React from 'react';

/**
 * @typedef {Object} TaskEntry
 * @property {number} hours
 * @property {string} type
 * @property {string} project
 * @property {string} task
 * @property {string} start
 * @property {string} end
 * @property {string} location
 */

/**
 * Component for rendering a single task row in the timesheet
 * @param {{ entry: TaskEntry }} props
 */
const TaskRow = React.memo(({ entry }) => {
    let hours = entry.hours > 0 ? entry.hours.toFixed(1) : '-';
    let hoursClass = 'td-hours';
    let rowClass = '';
    let isLeave = entry.type === 'Leave';
    let isWeekend = entry.type === 'Weekend';

    if (isLeave) {
        hoursClass = 'td-hours td-hours-leave';
        rowClass = 'leave-row';
    } else if (isWeekend) {
        rowClass = 'weekend-row';
    }
    
    const billableStatus = entry.type === 'Billable' ? 
        <span className="billable-yes">Yes</span> : 
        (entry.type === 'Non-Billable' ? 
            <span className="billable-no">No</span> : 
            'N/A'
        );

    return (
        <tr className={rowClass}>
            <td className="td-project">{entry.project}</td>
            <td className="td-task">{entry.task}</td>
            <td className="td-time">{entry.start}</td>
            <td className="td-time">{entry.end}</td>
            <td className="td-location">{entry.location}</td>
            <td className="td-billable">{billableStatus}</td>
            <td className={hoursClass}>
                {hours}
                {isLeave && (
                    <span className="hours-adjustment">(8.0 Adj.)</span>
                )}
            </td>
        </tr>
    );
});

TaskRow.displayName = 'TaskRow';

export default TaskRow;