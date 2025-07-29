import React from 'react';

export interface TimesheetEntry {
  employee?: string;
  initials?: string;
  email?: string;
  date: string;
  project: string;
  task: string;
  start?: string;
  end?: string;
  description: string;
  workType: 'Office' | 'Home' | 'Hybrid' | string;
  status: 'Approved' | 'Submitted' | 'Rejected';
  hours: number;
}

interface TimeManagementTableProps {
  entries: TimesheetEntry[];
}

const getInitials = (name?: string): string => {
  if (!name) return '';
  const words = name.trim().split(' ');
  return words.map(word => word[0]).join('').toUpperCase();
};

const TimeManagementTable: React.FC<TimeManagementTableProps> = ({ entries }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map((entry, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-700 text-white font-semibold">
                  {getInitials(entry.employee)}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{entry.employee || '-'}</div>
                  <div className="text-sm text-gray-500">{entry.email || ''}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.project}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.task}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.date}</td>
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
// import React from 'react';

// export interface TimesheetEntry {
//   employee?: string;
//   initials?: string;
//   email?: string;
//   date: string;
//   project: string;
//   task: string;
//   start?: string;
//   end?: string;
//   description: string;
//   workType: 'Office' | 'Home' | 'Hybrid' | string;
//   status: 'Approved' | 'Submitted' | 'Rejected';
//   hours: number;
// }

// interface TimeManagementTableProps {
//   entries: TimesheetEntry[];
// }

// const TimeManagementTable: React.FC<TimeManagementTableProps> = ({ entries }) => {
//   return (
//     <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
//       <table className="min-w-full divide-y divide-gray-200 bg-white">
//          <thead className="bg-gray-50">
//            <tr>
//              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
//              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
//              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Name</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Type</th>              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours Worked</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//             </tr>  
//         </thead>
//           <tbody className="divide-y divide-gray-200">
//             {entries.map((entry, index) => (
//             <tr key={index}>
//               <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3"> 
//                 <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-700 text-white font-semibold">
//                   {entry.initials}
//                 </span>
//                 <div>
//                   <div className="text-sm font-medium text-gray-900">{entry.employee}</div>
//                   <div className="text-sm text-gray-500">{entry.email}</div>
//                 </div>
//               </td>
//               <td className="px-6 py-4 text-sm text-gray-900">{entry.date}</td>
//               <td className="px-6 py-4 text-sm text-gray-900">{entry.project}</td>
//               <td className="px-6 py-4 text-sm text-gray-900">{entry.task}</td>
//               <td className="px-6 py-4 text-sm text-gray-900">{entry.start}</td>
//                <td className="px-6 py-4 text-sm text-gray-900">{entry.end}</td>
//               <td className="px-6 py-4 text-sm text-gray-900">{entry.workType}</td>
//               <td className="px-6 py-4 text-sm text-gray-900">{entry.hours}</td>
//               <td className="px-6 py-4">
//                 <span
//                   className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                     entry.status === 'Approved'
//                       ? 'bg-green-100 text-green-800'
//                       : entry.status === 'Submitted'
//                       ? 'bg-yellow-100 text-yellow-800'
//                       : 'bg-red-100 text-red-800'
//                   }`}
//                 >
//                   {entry.status}
//                 </span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TimeManagementTable;

