import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import axios from "axios"; // Added import

const BASE_URL = import.meta.env.VITE_BASE_URL; // Added BASE_URL

// Style for holidays, mimicking your Calendar's red-100/red-700
const holidayStyleRed = { backgroundColor: "#fee2e2", color: "#b91c1c" };

const DateRangePicker = ({
  label,
  onChange,
  defaultDate,
  disabledDays,
  defaultMonth,
  align = "left",
}) => {
  const [selected, setSelected] = useState(defaultDate);
  const [ holidaysDays, setHolidaysDays] = useState([]); // This is now used for styling
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/holidays/by-location`, {
        params: { state: "All", country: "India" },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Holidays fetched:", res.data);
      const holidayDates = res.data.map((holiday) => {
        const [y, m, d] = holiday.holidayDate.split("-").map(Number);
        return new Date(y, (m ?? 1) - 1, d ?? 1);
      });
      setHolidaysDays(holidayDates);
    } catch (err) {
      toast.error("Could not load company holidays");
    }
  };

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

  // Fetch holidays just once on mount
  useEffect(() => {
    fetchHolidays();
  }, []);

  // changes selected date if defaultDate prop changes

  useEffect(() => {
    setSelected(defaultDate);
  }, [defaultDate]);

  // Calculate year range for the dropdown
  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 2; // e.g. 2023
  const toYear = currentYear + 3; // e.g. 2028 (5 year span)  

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
            className={`absolute z-20 mt-2 bg-white border rounded-lg shadow-lg p-2 ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              defaultMonth={defaultMonth}
              disabled={disabledDays}
              // --- UI CHANGES START ---
              captionLayout="dropdown-buttons"
              // fromYear={fromYear}
              toYear={toYear}
              modifiers={{ holiday: holidaysDays }}
              modifiersStyles={{ holiday: holidayStyleRed }}
              modifiersClassNames={{
                selected: "bg-indigo-600 text-white rounded-md",
                today: "font-bold text-indigo-600",
                disabled: "opacity-50 line-through", // Style for disabled days
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;