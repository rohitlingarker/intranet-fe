import React from "react";
import { RotateCcw, X } from "lucide-react";

const labelClassName = "text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500";
const selectClassName = "mt-1.5 h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500";

const BenchFilters = ({
  open,
  draftFilters,
  filterOptions,
  onChange,
  onReset,
  onApply,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="w-[420px] rounded-lg border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-[#081534]">Filters</p>
          <p className="text-xs text-gray-500">Refine the visible bench supply</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClassName}>Category</label>
            <select value={draftFilters.category} onChange={(event) => onChange("category", event.target.value)} className={selectClassName}>
              <option value="">All Categories</option>
              {filterOptions.categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClassName}>Availability %</label>
            <select value={draftFilters.availability} onChange={(event) => onChange("availability", event.target.value)} className={selectClassName}>
              <option value="">All Ranges</option>
              <option value="0-25">0-25%</option>
              <option value="26-50">26-50%</option>
              <option value="51-75">51-75%</option>
              <option value="76-100">76-100%</option>
            </select>
          </div>

          <div>
            <label className={labelClassName}>Location</label>
            <select value={draftFilters.location} onChange={(event) => onChange("location", event.target.value)} className={selectClassName}>
              <option value="">All Locations</option>
              {filterOptions.locations.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClassName}>Experience</label>
            <select value={draftFilters.experience} onChange={(event) => onChange("experience", event.target.value)} className={selectClassName}>
              <option value="">All Bands</option>
              <option value="0-3">0-3 Years</option>
              <option value="4-7">4-7 Years</option>
              <option value="8-12">8-12 Years</option>
              <option value="13+">13+ Years</option>
            </select>
          </div>

          <div>
            <label className={labelClassName}>Aging</label>
            <select value={draftFilters.aging} onChange={(event) => onChange("aging", event.target.value)} className={selectClassName}>
              <option value="">All Ranges</option>
              <option value="0-15">0-15 days</option>
              <option value="16-30">16-30 days</option>
              <option value="31+">31+ days</option>
            </select>
          </div>

          <div>
            <label className={labelClassName}>Cost / Day</label>
            <select value={draftFilters.cost} onChange={(event) => onChange("cost", event.target.value)} className={selectClassName}>
              <option value="">All Ranges</option>
              <option value="0-1500">0-1500</option>
              <option value="1501-3000">1501-3000</option>
              <option value="3001+">3001+</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 transition-colors hover:border-gray-400"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-9 flex-1 rounded-md bg-[#081534] px-3 text-sm font-medium text-white transition-colors hover:bg-[#10214f]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default BenchFilters;

