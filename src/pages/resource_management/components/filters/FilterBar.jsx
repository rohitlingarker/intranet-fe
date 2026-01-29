import React, { useState, useEffect, useRef, useMemo, Fragment } from "react";
import { Search, Filter, X, Check } from "lucide-react";
import { Combobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import ct from "countries-and-timezones";

const CountryCombobox = ({ value, onChange, options }) => {
  const [query, setQuery] = useState("");
  const filtered = query === "" ? options : options.filter(o => 
    o.toLowerCase().replace(/\s+/g, "").includes(query.toLowerCase().replace(/\s+/g, ""))
  );

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <Combobox.Input
          className="w-full border rounded-md py-1 px-2 pr-6 text-[11px] outline-none focus:border-indigo-500 bg-white"
          displayValue={(o) => o || ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search country..."
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-1">
          <ChevronUpDownIcon className="h-3.5 w-3.5 text-gray-400" />
        </Combobox.Button>
        <Transition as={Fragment} afterLeave={() => setQuery("")}>
          <Combobox.Options className="absolute mt-1 max-h-40 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 z-[70] text-[11px]">
            <Combobox.Option 
              value="" 
              className={({ active }) => `px-2 py-1.5 cursor-pointer flex justify-between items-center ${active ? "bg-slate-50 text-indigo-600" : "text-gray-400"}`}
            >
              All Countries {!value && <Check className="w-3 h-3" />}
            </Combobox.Option>
            {filtered.map((o) => (
              <Combobox.Option key={o} value={o} className={({ active, selected }) => `px-2 py-1.5 cursor-pointer flex justify-between items-center ${active ? "bg-indigo-600 text-white" : "text-gray-900"} ${selected ? "font-bold" : ""}`}>
                {o} {value === o && <Check className={`w-3 h-3 ${active ? "text-white" : "text-indigo-600"}`} />}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};

const FilterBar = ({ filters, onUpdate, totalResults }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: false, right: false });
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const [draft, setDraft] = useState({ ...filters });
  const countries = useMemo(() => Object.values(ct.getAllCountries()).map(c => c.name).sort(), []);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: (window.innerHeight - rect.bottom) < 350,
        right: (window.innerWidth - rect.left) < 320
      });
    }
  }, [open]);

  useEffect(() => setDraft({ ...filters }), [filters]);

  const handleDateChange = (field, value) => {
    setDraft(prev => {
      const next = { ...prev, [field]: value };
      if (field === "startDate" && !prev.endDate) {
        next.endDate = value;
      } else if (field === "endDate" && !prev.startDate) {
        next.startDate = value;
      }
      return next;
    });
  };

  const resetAndClose = () => {
    const empty = { search: "", region: "", type: "", priority: "", status: "", startDate: "", endDate: "" };
    setDraft(empty);
    onUpdate(empty);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center gap-2 p-2 bg-white border-b font-sans">
      {/* Search Input */}
      {/* Search Input - Scaled Up */}
      <div className="relative w-80 group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
        <input
          value={filters.search}
          onChange={(e) => onUpdate({ ...filters, search: e.target.value })}
          placeholder="Search client names..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all placeholder:text-gray-400"
        />
      </div>

      <div ref={containerRef} className="relative flex items-center gap-3">
        {/* Filter Toggle Button - Matches "Create New Client" styling */}
        <button 
          ref={buttonRef}
          onClick={() => setOpen(!open)} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 active:scale-[0.98] shadow-sm
            ${open 
              ? "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/20" 
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
        >
          <Filter className={`w-4 h-4 ${open ? "text-white" : "text-gray-500"}`} /> 
          Filters
        </button>

        {/* Task 2: Result Counter UX */}
        {!open && totalResults !== undefined && (
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight bg-slate-50 px-2 py-1 rounded border border-slate-100">
            {totalResults} matches
          </span>
        )}

        {/* Dropdown Menu */}
        {open && (
          <div className={`absolute z-20 w-72 bg-white border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150
            ${coords.top ? "bottom-full mb-2" : "top-full mt-4"}
            ${coords.right ? "right-0" : "left-0"}`}
          >
            <div className="flex justify-between items-center px-3 py-2 bg-slate-50 border-b">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Filters</span>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>

            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-0.5">Country</label>
                  <CountryCombobox options={countries} value={draft.region} onChange={(v) => setDraft({ ...draft, region: v })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-0.5">Type</label>
                  <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className="w-full border rounded-md py-1 px-1 text-[11px] outline-none bg-white hover:border-gray-400 cursor-pointer transition-colors">
                    <option value="">All Types</option>
                    {["STRATEGIC", "STANDARD", "SUPPORT", "INTERNAL"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-0.5">Priority</label>
                  <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} className="w-full border rounded-md py-1 px-1 text-[11px] outline-none bg-white hover:border-gray-400 cursor-pointer transition-colors">
                    <option value="">All</option>
                    {["HIGH", "MEDIUM", "LOW"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-0.5">Status</label>
                  <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="w-full border rounded-md py-1 px-1 text-[11px] outline-none bg-white hover:border-gray-400 cursor-pointer transition-colors">
                    <option value="">All Status</option>
                    {["ACTIVE", "INACTIVE", "ON_HOLD"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">From</label>
                  <input 
                    type="date" 
                    max={draft.endDate || undefined} 
                    value={draft.startDate} 
                    onChange={(e) => handleDateChange("startDate", e.target.value)} 
                    className="w-full border rounded-md py-1 px-1 text-[10px] outline-none focus:border-indigo-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">To</label>
                  <input 
                    type="date" 
                    min={draft.startDate || undefined} 
                    value={draft.endDate} 
                    onChange={(e) => handleDateChange("endDate", e.target.value)} 
                    className="w-full border rounded-md py-1 px-1 text-[10px] outline-none focus:border-indigo-500" 
                  />
                </div>
              </div>
            </div>

            <div className="p-2 border-t bg-slate-50 flex gap-2">
              <button onClick={resetAndClose} className="flex-1 bg-white text-slate-500 border border-slate-200 py-1.5 rounded-lg text-[11px] font-bold hover:text-red-500 hover:border-red-100 transition-all active:scale-[0.98]">
                Reset
              </button>
              <button onClick={() => { onUpdate(draft); setOpen(false); }} className="flex-[2] bg-indigo-600 text-white py-1.5 rounded-lg text-[11px] font-bold shadow-sm hover:bg-indigo-700 transition-all active:scale-[0.98]">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;