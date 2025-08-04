import React from "react";

const Calendar = ({ selectedDate, setSelectedDate }) => {
  return (
    <input
      type="date"
      className="border p-2 rounded w-full"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
    />
  );
};

export default Calendar;