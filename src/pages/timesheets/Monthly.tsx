import React from 'react';
import { Calendar } from 'lucide-react';

const Monthly: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2" />
        Monthly Overview (Mock)
      </h3>

      <p className="text-sm text-gray-700 mb-4">
        This is a placeholder for monthly timesheet data. You can integrate charts, tables, or reports here.
      </p>

      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
        <li>Total working days: <strong>22</strong></li>
        <li>Total hours logged: <strong>148h</strong></li>
        <li>Average daily hours: <strong>6.7h</strong></li>
        <li>Overtime: <strong className="text-orange-600">4.5h</strong></li>
      </ul>
    </div>
  );
};

export default Monthly;