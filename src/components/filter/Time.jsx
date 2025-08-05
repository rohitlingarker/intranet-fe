import React from "react";

const Time = ({ selectedTime, setSelectedTime }) => {
  return (
    <input
      type="time"
      className="border p-2 rounded w-full"
      value={selectedTime}
      onChange={(e) => setSelectedTime(e.target.value)}
    />
  );
};

export default Time;