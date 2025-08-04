import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CompOffRequestModal = ({ onSubmit, onClose }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!startDate) return;

    const dates = {
      start: startDate,
      end: endDate || startDate,
      isHalf: isHalfDay,
    };

    onSubmit({ dates, note });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-[90%] max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Request Comp Off</h2>

        <label className="block text-sm font-medium text-gray-700">Start Date</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="border rounded px-3 py-2 w-full"
          maxDate={new Date()}
          placeholderText="Select start date"
        />

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

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isHalfDay}
            onChange={(e) => setIsHalfDay(e.target.checked)}
          />
          <label className="text-sm">Request Half Day</label>
        </div>

        <label className="block text-sm font-medium text-gray-700">Note</label>
        <textarea
          className="border rounded px-3 py-2 w-full"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Optional note..."
        />

        <div className="flex justify-end gap-3">
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
