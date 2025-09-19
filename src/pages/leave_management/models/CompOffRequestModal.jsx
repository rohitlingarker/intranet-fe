import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNotification } from "../../../contexts/NotificationContext";

const CompOffRequestModal = ({ onSubmit, onClose, loading }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [note, setNote] = useState("");
  const { showNotification} = useNotification();

  // Calculate duration
  const calculateDays = () => {
    if (!startDate) return 0;
    if (isHalfDay) return 0.5;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    // start.setHours(0, 0, 0, 0);
    // end.setHours(0, 0, 0, 0);
    const diffTime = end - start;
    if (diffTime < 0) return 1;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async () => {
    if (!startDate) {
      showNotification("Please select a start date", "error");
      return;
    }

    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const year = d.getFullYear();
      // getMonth() is 0-indexed, so we add 1
      const month = String(d.getMonth() + 1).padStart(2, "0"); 
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const payload = {
      dates: {
        start: formatDate(startDate),
        end: formatDate(endDate || startDate),
        isHalf: isHalfDay,
      },
      note,
      numberOfDays: calculateDays(),
    };

    // This will trigger parent's async function
    const isSuccess = await onSubmit(payload);

    if (isSuccess) {
      onClose();
    }
  }; 

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
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

        {/* Half day toggle */}
        <div className="flex items-center space-x-3 mt-2">
          <span className="text-sm font-medium text-gray-700">Request Half Day</span>
          <button
            type="button"
            role="switch"
            aria-checked={isHalfDay}
            onClick={() => setIsHalfDay(!isHalfDay)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
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

        {/* Days */}
        {startDate && (
          <div className="text-sm text-gray-600">
            <strong>Days:</strong> {calculateDays()}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm text-white ${
              loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompOffRequestModal;