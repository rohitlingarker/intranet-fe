import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const DateRangePicker = ({ label, onChange, defaultDate, disabledDays, defaultMonth, align = "left" }) => {
  const [selected, setSelected] = useState(defaultDate);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleSelect = (date) => {
    setSelected(date);
    if (onChange) onChange(date);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelected(defaultDate);
  }, [defaultDate]);

  return (
    <div className="flex flex-col space-y-2 w-full" ref={ref}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2 border rounded-lg shadow-sm bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span>
            {selected ? format(selected, "MMM d, yyyy") : "Pick a date"}
          </span>
          <CalendarIcon className="w-5 h-5 text-gray-500" />
        </button>

        {open && (
          <div
            className={`absolute z-20 mt-2 bg-gray-100 border rounded-lg shadow-lg p-2 ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              defaultMonth={defaultMonth}
              disabled={disabledDays}
              modifiersClassNames={{
                selected: "bg-indigo-600 text-white rounded-md",
                today: "font-bold text-indigo-600",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;