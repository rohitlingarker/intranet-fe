import React from "react";
import { Eye, Ban, ArrowRightCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Pending Approval": "border-amber-200 bg-amber-50 text-amber-700",
  Approved: "border-blue-200 bg-blue-50 text-blue-700",
  Rejected: "border-rose-200 bg-rose-50 text-rose-700",
  Cancelled: "border-slate-200 bg-slate-100 text-slate-700",
};

const IMPACT_STYLES = {
  Low: "border-teal-200 bg-teal-50 text-teal-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-rose-200 bg-rose-50 text-rose-700",
};

const renderBadge = (label, map) => (
  <Badge className={cn("text-[11px] font-semibold", map[label] || "border-gray-200 bg-gray-50 text-gray-700")}>
    {label}
  </Badge>
);

const RoleOffTable = ({
  mode,
  rows,
  selectedRows = [],
  activeRowId,
  onToggleRow,
  onToggleAll,
  onAction,
  onRowClick,
}) => {
  const allSelected = rows.length > 0 && rows.every((row) => selectedRows.includes(row.id));
  const anySelected = rows.some((row) => selectedRows.includes(row.id));

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {mode === "pm" ? (
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
              ) : null}
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                Resource
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                Project
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                Role / Skill
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                Impact
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                {mode === "pm" ? "Allocation" : "Status"}
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                {mode === "pm" ? "End Date" : "Effective Date"}
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={mode === "pm" ? 8 : 7}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  No records match the current filters.
                </td>
              </tr>
            ) : null}

            {rows.map((row) => {
              const isHigh = row.impact === "High";
              const isSelected = selectedRows.includes(row.id);

              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "align-top cursor-pointer transition-colors",
                    isHigh && "bg-rose-50/40",
                    isSelected && "bg-blue-50/40",
                    activeRowId === row.id && "bg-slate-100",
                    "hover:bg-slate-50",
                  )}
                >
                  {mode === "pm" ? (
                    <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(event) => onToggleRow(row.id, event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  ) : null}
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      {isHigh ? (
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                      ) : null}
                      <div>
                        <p className="font-semibold text-[#081534]">{row.resource}</p>
                        <p className="text-xs text-gray-500">{row.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-800">{row.project}</p>
                    <p className="text-xs text-gray-500">{row.client}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-800">{row.role}</p>
                    <p className="text-xs text-gray-500">{row.skill}</p>
                  </td>
                  <td className="px-4 py-4">{renderBadge(row.impact, IMPACT_STYLES)}</td>
                  <td className="px-4 py-4">
                    {mode === "pm" ? (
                      <p className="font-medium text-gray-800">{row.allocationPercent}%</p>
                    ) : (
                      renderBadge(row.status, STATUS_STYLES)
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {mode === "pm" ? row.endDate : row.effectiveDate}
                  </td>
                  <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      {mode === "pm" ? (
                        <Button
                          variant="outline"
                          className="h-8 border-gray-300 bg-white px-3 text-xs"
                          onClick={() => onAction("roleoff", row)}
                        >
                          <ArrowRightCircle className="mr-1 h-3.5 w-3.5" />
                          Role-Off
                        </Button>
                      ) : null}

                      {mode === "rm" ? (
                        <>
                          <Button
                            variant="outline"
                            className="h-8 border-gray-300 bg-white px-3 text-xs"
                            onClick={() => onAction("view", row)}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            className="h-8 border-gray-300 bg-white px-3 text-xs text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                            onClick={() => onAction("cancel", row)}
                            disabled={row.status !== "Pending Approval"}
                          >
                            <Ban className="mr-1 h-3.5 w-3.5" />
                            Cancel
                          </Button>
                        </>
                      ) : null}

                      {mode === "dm" ? (
                        <>
                          <Button
                            className="h-8 bg-[#081534] px-3 text-xs hover:bg-[#10214f]"
                            onClick={() =>
                              onAction("approve", row)
                            }
                          >
                            {row.impact === "High" ? "Review" : "Approve"}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-8 border-gray-300 bg-white px-3 text-xs text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                            onClick={() => onAction("reject", row)}
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                    </div>
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

export default RoleOffTable;
