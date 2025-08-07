import React, { useState, useEffect } from "react";

const DateRangePicker = ({ onChange }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysBetween, setDaysBetween] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        setError("End date cannot be earlier than start date.");
        setDaysBetween(0);
      } else {
        setError("");
        const timeDiff = end.getTime() - start.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // inclusive of both days
        setDaysBetween(days);

        // Optional callback to parent with valid data
        if (onChange) {
          onChange({ startDate, endDate, days });
        }
      }
    }
  }, [startDate, endDate]);

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!error && startDate && endDate && (
        <p className="text-gray-700 text-sm">
          Total days: <strong>{daysBetween}</strong>
        </p>
      )}
    </div>
  );
};

export default DateRangePicker;
