import React, { useState, useEffect, useRef } from "react";
import { Search, Filter } from "lucide-react";

const FilterBar = ({ filters, onUpdate, totalResults }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const activeFilterCount = [
    filters.region,
    filters.type,
    filters.priority,
    filters.status,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  const resetAll = () => {
    onUpdate({
      search: "",
      region: "",
      type: "",
      priority: "",
      status: "",
      startDate: "",
      endDate: "",
    });
  };

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative bg-white border-b p-4">
      <div className="flex gap-3 items-center">
        {/* SEARCH */}
        {/* SEARCH */}
<div className="relative w-[220px] sm:w-[260px] md:w-[300px]">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
  <input
    value={filters.search}
    onChange={(e) => onUpdate({ search: e.target.value })}
    placeholder="Search by client name..."
    className="w-full pl-10 pr-4 py-2 rounded-xl border bg-gray-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
  />
</div>


        {/* FILTER BUTTON */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-500 transition ${
              open || activeFilterCount
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-black-200"
            }`}
          >
            <Filter className="w-4 h-4 " />
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white text-indigo-600 font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* POPUP */}
          {open && (
            <div className="absolute
  right-0
  bottom-full
  mb-3
  w-[360px]
  max-h-[70vh]
  overflow-y-auto
  bg-white
  border
  rounded-2xl
  shadow-xl
  z-50
">

              <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Client Filters
                </span>
                <button
                  onClick={resetAll}
                  className="text-xs font-bold text-indigo-600"
                >
                  Reset All
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-2 gap-y-2">
                  {/* Region */}
                  <select
                    value={filters.region}
                    onChange={(e) => onUpdate({ region: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Regions</option>
                    <option value="APAC">APAC</option>
                    <option value="EMEA">EMEA</option>
                    <option value="India">India</option>
                  </select>

                  {/* Type */}
                  <select
                    value={filters.type}
                    onChange={(e) => onUpdate({ type: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Startup">Startup</option>
                    <option value="SMB">SMB</option>
                  </select>

                  {/* Priority */}
                  <select
                    value={filters.priority}
                    onChange={(e) => onUpdate({ priority: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  {/* Status */}
                  <select
                    value={filters.status}
                    onChange={(e) => onUpdate({ status: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* DATE RANGE */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => onUpdate({ startDate: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => onUpdate({ endDate: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Filtered: <b>{totalResults}</b> clients
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Found <b>{totalResults}</b> matching clients
      </div>
    </div>
  );
};

export default FilterBar;
