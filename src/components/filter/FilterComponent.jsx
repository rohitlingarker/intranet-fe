import React, { useState } from "react";
import Calendar from "./Calendar";
import Dropdown from "./Dropdown";
import Time from "./Time";
import Search from "./Search";

const FilterComponent = ({ data, dropdownOptions, children }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((item) => {
    const dateMatch = selectedDate ? item.date === selectedDate : true;
    const timeMatch = selectedTime ? item.time === selectedTime : true;
    const optionMatch = selectedOption ? item.status === selectedOption : true;
    const searchMatch = searchTerm
      ? Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;

    return dateMatch && timeMatch && optionMatch && searchMatch;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        <Time selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
        <Dropdown
          options={dropdownOptions}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      <div className="pt-4">
        {children(filteredData)}
      </div>
    </div>
  );
};

export default FilterComponent;