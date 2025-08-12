import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CompOffRequestModal = ({ onSubmit, onClose }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [note, setNote] = useState("");

  // Helper to calculate number of days
  const calculateDays = () => {
    if (!startDate) return 0;
    if (isHalfDay) return 0.5;

    // Clone dates to avoid mutation
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 1; // If somehow end < start, treat as 1 day

    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  };

  const handleSubmit = () => {
    if (!startDate) {
      alert("Please select a start date");
      return;
    }

    const duration = calculateDays();

    const payload = {
      dates: {
        start: startDate,
        end: endDate || startDate,
        isHalf: isHalfDay,
      },
      note,
      numberOfDays: duration,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-[90%] max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Request Comp Off</h2>

        {/* Start Date */}
        <label className="block text-sm font-medium text-gray-700">Start Date</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="border rounded px-3 py-2 w-full"
          maxDate={new Date()}
          placeholderText="Select start date"
        />

        {/* End Date */}
        {!isHalfDay && (
          <>
            <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="border rounded px-3 py-2 w-full"
              maxDate={new Date()}
              placeholderText="Select end date"
            />
          </>
        )}

        {/* Half-day toggle */}
        <div className="flex items-center space-x-3 mt-2">
          <span className="text-sm font-medium text-gray-700">Request Half Day</span>
          <button
            type="button"
            role="switch"
            aria-checked={isHalfDay}
            onClick={() => setIsHalfDay(!isHalfDay)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isHalfDay ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isHalfDay ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Note */}
        <label className="block text-sm font-medium text-gray-700">Note</label>
        <textarea
          className="border rounded px-3 py-2 w-full"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Comment or note..."
        />

        {/* Days preview */}
        {startDate && (
          <div className="text-sm text-gray-600">
            <strong>Calculated Days:</strong> {calculateDays()}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompOffRequestModal;