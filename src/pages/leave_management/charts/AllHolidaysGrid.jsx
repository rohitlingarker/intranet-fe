import React, { useEffect } from "react";

export default function AllHolidaysGrid({ holidays, onClose }) {
  const today = new Date();

  // 🧠 Close on Esc key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // 📅 Sort holidays from earliest to latest
  const sortedHolidays = [...holidays].sort(
    (a, b) => new Date(a.holidayDate) - new Date(b.holidayDate)
  );

  // 🖱️ Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target.id === "holidayOverlay") onClose();
  };

  return (
    <div
      id="holidayOverlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto p-6"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 relative animate-fadeIn mt-10">
        {/* ❌ Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          ✕
        </button>

        {/* 🏷️ Header */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          All Holidays
        </h2>

        {/* 🗓️ Grid of holidays */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {sortedHolidays.map((holiday) => {
            const holidayDate = new Date(holiday.holidayDate);
            const isPast =
              holidayDate < today &&
              holidayDate.toDateString() !== today.toDateString();
            const isToday = holidayDate.toDateString() === today.toDateString();

            return (
              <div
                key={holiday.id}
                className={`relative bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md p-4 transition-transform hover:scale-[1.02] ${
                  isPast ? "opacity-70" : ""
                }`}
              >
                {/* Gray overlay for past holidays */}
                {isPast && (
                  <div className="absolute inset-0 bg-gray-200/60 rounded-xl z-10 pointer-events-none"></div>
                )}

                <div className="relative z-20">
                  <p className="text-gray-800 font-semibold text-lg">
                    {holiday.holidayName}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                      isToday
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {holidayDate.toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  {holiday.holidayDescription && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                      {holiday.holidayDescription}
                    </p>
                  )}

                  {isToday && (
                    <p className="mt-3 text-green-600 font-medium">
                      🎉 Enjoy your holiday today!
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
