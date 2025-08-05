import React from "react";

const Dropdown = ({ options, selectedOption, setSelectedOption }) => {
  return (
    <select
      className="border p-2 rounded w-full"
      value={selectedOption}
      onChange={(e) => setSelectedOption(e.target.value)}
    >
      <option value="">Select an option</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;