import React from "react";
import { ChevronLeft, ChevronRight, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RoleOffFilterPanel = ({
  collapsed,
  onToggle,
  filters,
  onChange,
  onReset,
  mode,
}) => {
  return (
    <div
      className={cn(
        "w-full shrink-0 rounded-lg border border-gray-200 bg-white shadow-sm transition-all lg:sticky lg:top-6",
        collapsed ? "lg:w-[72px]" : "lg:w-[280px]",
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        {!collapsed ? (
          <div>
            <p className="text-sm font-bold text-[#081534]">Filters</p>
            <p className="text-xs text-gray-500">Refine the role-off queue</p>
          </div>
        ) : (
          <Filter className="h-4 w-4 text-gray-500" />
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed ? (
        <div className="space-y-4 p-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
              Impact
            </label>
            <select
              value={filters.impact}
              onChange={(event) => onChange("impact", event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Impact Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {mode !== "pm" ? (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(event) => onChange("status", event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          ) : null}

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
              Reason
            </label>
            <select
              value={filters.reason}
              onChange={(event) => onChange("reason", event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Reasons</option>
              <option value="Project Completion">Project Completion</option>
              <option value="Client Ramp Down">Client Ramp Down</option>
              <option value="Performance Issue">Performance Issue</option>
              <option value="Budget Realignment">Budget Realignment</option>
              <option value="Critical Dependency">Critical Dependency</option>
              <option value="Emergency Transition">Emergency Transition</option>
            </select>
          </div>

          <Button
            variant="outline"
            onClick={onReset}
            className="h-10 w-full border-gray-300 bg-white text-sm"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 p-3">
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            title="Reset filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleOffFilterPanel;
