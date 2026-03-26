import React from "react";
import { AlertTriangle, Eye } from "lucide-react";
import { CATEGORY_OPTIONS } from "../constants/benchConstants";
import { getAgingTone } from "../models/benchModel";

const categoryStyles = {
  Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Training: "border-blue-200 bg-blue-50 text-blue-700",
  Shadow: "border-violet-200 bg-violet-50 text-violet-700",
  "Not Available": "border-slate-200 bg-slate-100 text-slate-700",
};

const renderPill = (text, className) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${className}`}>
    {text}
  </span>
);

const BenchTable = ({
  rows,
  selectedRows,
  activeRowId,
  emptyState,
  onToggleAll,
  onToggleRow,
  onView,
  onCategoryChange,
}) => {
  const allSelected = rows.length > 0 && rows.every((row) => selectedRows.includes(row.id));
  const anySelected = rows.some((row) => selectedRows.includes(row.id));

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="bg-slate-50 hover:bg-slate-50 border-b border-slate-100">
              <th className="w-12 px-5 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(node) => {
                    if (node) node.indeterminate = !allSelected && anySelected;
                  }}
                  onChange={(event) => onToggleAll(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Consultant Details</th>
              <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Core Expertise</th>
              <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Availability</th>
              <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Aging</th>
              <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Exposure</th>
              <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center text-[13px] font-medium text-slate-400 italic">
                  {emptyState}
                </td>
              </tr>
            ) : null}

            {rows.map((row) => {
              const agingTone = getAgingTone(row.agingDays);

              return (
                <tr
                  key={row.id}
                  onClick={() => onView(row)}
                  className={`group cursor-pointer transition-all hover:bg-indigo-50/30 ${activeRowId === row.id ? "bg-indigo-50/50" : ""}`}
                >
                  <td className="px-5 py-4 align-middle" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(event) => onToggleRow(row.id, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-slate-900 leading-tight tracking-tight">{row.name}</span>
                      <span className="text-[11px] font-medium text-slate-400 leading-normal">{row.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle min-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {row.topSkills.length === 0 ? (
                        <span className="text-[10px] text-slate-300 italic">No expertise logged</span>
                      ) : (
                        row.topSkills.map((skill) => (
                          <span
                            key={`${row.id}-${skill.name}`}
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              skill.stale
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-slate-50 text-slate-600 border-slate-100"
                            }`}
                          >
                            {skill.name}
                          </span>
                        ))
                      )}
                    </div>
                    {(row.warnings.missingSkills || row.missingSkills.length > 0) && (
                      <div className="mt-1.5 flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <AlertTriangle className="h-3 w-3 text-rose-500 mt-0.5" />
                        <span className="text-[9px] font-bold text-rose-600 uppercase">Skill Gaps Detected</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 align-middle" onClick={(event) => event.stopPropagation()}>
                    <div className="flex flex-col gap-1.5">
                      <div>
                        {renderPill(row.category, `${categoryStyles[row.category] || "border-slate-200 bg-slate-50 text-slate-600"} !px-2 !py-0.5 text-[9px] uppercase tracking-tighter`)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-[13px] font-bold ${row.availability < 50 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {row.availability}%
                      </span>
                      <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${row.availability >= 75 ? 'bg-emerald-500' : row.availability >= 25 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${row.availability}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    {renderPill(agingTone.label, `${agingTone.className} !px-2 !py-0.5 text-[9px] uppercase tracking-tighter`)}
                  </td>
                  <td className="px-4 py-4 align-middle text-right">
                    <div className="flex flex-col">
                      <span className={`text-[12px] font-bold ${row.warnings.highCost ? "text-rose-700" : "text-slate-900"}`}>
                        {row.costPerDay === null ? "—" : `₹${row.costPerDay.toLocaleString()}`}
                      </span>
                      {row.warnings.missingCost ? (
                        <span className="text-[9px] font-bold text-amber-600 uppercase">Cost Missing</span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">
                          Exp: {row.costExposure === null ? "-" : row.costExposure.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-center" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onView(row)}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 shadow-sm"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      VIEW
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BenchTable;
