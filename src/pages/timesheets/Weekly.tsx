import React from 'react';
import { BarChart3 } from 'lucide-react';

const weeklyData = [
  { day: 'Monday', hours: 8 },
  { day: 'Tuesday', hours: 7.5 },
  { day: 'Wednesday', hours: 8 },
  { day: 'Thursday', hours: 6.5 },
  { day: 'Friday', hours: 7 },
];

const Weekly: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2" />
        Weekly Summary
      </h3>

      <div className="space-y-4">
        {weeklyData.map((day, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{day.day}</span>
            <div className="flex items-center space-x-2">
              <div className="w-28 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#263383] h-2 rounded-full"
                  style={{ width: `${(day.hours / 8) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">{day.hours}h</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm font-medium">
          <span>Total Hours:</span>
          <span className="text-[#263383] font-semibold">37 hours</span>
        </div>
      </div>
    </div>
  );
};

export default Weekly;