import React from 'react';

interface TimesheetEntry {
  employee: string;
  initials: string;
  email: string;
  Date: string;
  project: string;
  task: string;
  start: string;
  end: string;
  workType: 'Office' | 'Home' | 'Hybrid';
  status: 'Approved' | 'Submitted'  | 'Rejected';
  hours: number;
}

const entries: TimesheetEntry[] = [
  {
    employee: 'John Administrator',
    initials: 'JA',
    email: 'john.admin@company.com',
    Date: '2025-07-20',
    project: 'Timesheet System',
    task: 'Design DB Schema',
    start: '09:00',
    end: '12:00',
    workType: 'Office',
    status: 'Approved',
    hours: 3,
  },
  {
    employee: 'Emily Davis',
    initials: 'ED',
    email: 'emily.davis@company.com',
    Date: '2025-07-21',
    project: 'Leave Tracker',
    task: 'API Integration',
    start: '10:00',
    end: '13:30',
    workType: 'Home',
    status: 'Submitted',
    hours: 3.5,
  },
];

const TimeManagementTable: React.FC = () => {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours Worked</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map((entry, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-700 text-white font-semibold">
                  {entry.initials}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{entry.employee}</div>
                  <div className="text-sm text-gray-500">{entry.email}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.Date}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.project}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.task}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.start}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.end}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.workType}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.hours}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    entry.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : entry.status === 'Submitted'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {entry.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimeManagementTable;
