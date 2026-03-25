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
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(node) => {
                    if (node) node.indeterminate = !allSelected && anySelected;
                  }}
                  onChange={(event) => onToggleAll(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Resource</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Role / Skill</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Availability %</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Aging</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Cost</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
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
                  className={`cursor-pointer align-top transition-colors hover:bg-slate-50 ${activeRowId === row.id ? "bg-slate-100" : ""}`}
                >
                  <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(event) => onToggleRow(row.id, event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-[#081534]">{row.name}</p>
                    <p className="text-xs text-gray-500">{row.role}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-800">{row.role}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {row.topSkills.length === 0 ? (
                        renderPill("No skills available", "border-amber-200 bg-amber-50 text-amber-700")
                      ) : (
                        row.topSkills.map((skill) => (
                          <span
                            key={`${row.id}-${skill.name}`}
                            className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] ${
                              skill.stale
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-slate-200 bg-slate-50 text-slate-700"
                            }`}
                          >
                            {skill.name} | {skill.proficiency}
                          </span>
                        ))
                      )}
                    </div>
                    {(row.warnings.missingSkills || row.missingSkills.length > 0) ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {row.warnings.missingSkills ? renderPill("Skill data missing", "border-rose-200 bg-rose-50 text-rose-700") : null}
                        {row.missingSkills.slice(0, 2).map((skill) =>
                          renderPill(`Gap: ${skill}`, "border-blue-200 bg-blue-50 text-blue-700"),
                        )}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                    <select
                      value={row.category}
                      onChange={(event) => onCategoryChange(row.id, event.target.value)}
                      className="h-9 min-w-[140px] rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    >
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <div className="mt-2">
                      {renderPill(row.category, categoryStyles[row.category] || "border-gray-200 bg-gray-50 text-gray-700")}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-800">{row.availability}%</p>
                  </td>
                  <td className="px-4 py-4">
                    {renderPill(agingTone.label, agingTone.className)}
                  </td>
                  <td className="px-4 py-4">
                    <p className={`font-medium ${row.warnings.highCost ? "text-rose-700" : "text-gray-800"}`}>
                      {row.costPerDay === null ? "Cost unavailable" : `${row.costPerDay.toLocaleString()} / day`}
                    </p>
                    {row.warnings.missingCost ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Missing cost
                      </span>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Exposure: {row.costExposure === null ? "-" : row.costExposure.toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onView(row)}
                      className="inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-[#081534]"
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      View
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
