// utils.js

// import { LEAVE_HOURS } from './constants';

/**
 * Checks if a date falls within a week's range (inclusive)
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} startStr - Start date in YYYY-MM-DD format
 * @param {string} endStr - End date in YYYY-MM-DD format
 * @returns {boolean}
 */
export const isDateInWeek = (dateStr, startStr, endStr) => {
    const date = new Date(dateStr);
    const start = new Date(startStr);
    const end = new Date(endStr);
    return date >= start && date <= end;
};

/**
 * Groups an array by a specified key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object}
 */
export const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
        return result;
    }, {});
};

/**
 * Calculates the adjusted daily total, applying the 8-hour rule for leave/holiday entries
 * @param {Array} entries - Array of timesheet entries for a day
 * @returns {number}
 */
export const getDailyTotal = (entries) => {
    let total = 0;
    entries.forEach(entry => {
        if (entry.type === 'Leave') {
            total += LEAVE_HOURS;
        } else if (entry.type !== 'Weekend') {
            total += entry.hours;
        }
    });
    return total;
};

/**
 * Format date to readable string
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string}
 */
export const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
};

export const convertUTCtoLocalTime = (utcString) => {
  if (!utcString) return "";

  // Treat backend time as UTC
  const date = new Date(utcString + "Z");

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // change to true if you want 12-hour format
  });
};
