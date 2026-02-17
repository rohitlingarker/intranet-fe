import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Layers, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ----- Constants -----
const TRACK_HEIGHT = 36;
const ROW_PADDING = 13;

// ----- Helper Functions -----

/**
 * Parses a date string (YYYY-MM-DD) or Date object into a local Date object at 00:00:00.
 * This avoids the common bug where YYYY-MM-DD is parsed as UTC midnight.
 */
function parseDate(d) {
  if (!d) {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
  }
  if (d instanceof Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }
  if (typeof d === "string" && d.includes("-")) {
    const parts = d.split("-");
    if (parts.length === 3) {
      return new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2]),
        0,
        0,
        0,
        0,
      );
    }
  }
  const date = new Date(d);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

function addDays(date, days) {
  const d = parseDate(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a, b) {
  const d1 = parseDate(a);
  const d2 = parseDate(b);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthYear(d) {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getBarColor(allocation, tentative) {
  if (tentative) return "bg-slate-200 border-slate-300 border-dashed";
  if (allocation > 100) return "bg-red-500 border-red-600";
  if (allocation > 70) return "bg-rose-400 border-rose-500";
  if (allocation > 20) return "bg-amber-400 border-amber-500";
  return "bg-emerald-500 border-emerald-600";
}

function getBarHoverColor(allocation, tentative) {
  if (tentative) return "hover:bg-slate-300";
  if (allocation > 100) return "hover:bg-red-600";
  if (allocation > 70) return "hover:bg-rose-500";
  if (allocation > 20) return "hover:bg-amber-500";
  return "hover:bg-emerald-600";
}

function getZoomConfig(zoom) {
  switch (zoom) {
    case "week":
      return {
        dayWidth: 32,
        totalDaysBefore: 14,
        totalDaysAfter: 42,
        tickInterval: 7,
      };
    case "month":
      return {
        dayWidth: 8,
        totalDaysBefore: 30,
        totalDaysAfter: 120,
        tickInterval: 30,
      };
    case "quarter":
      return {
        dayWidth: 3.2,
        totalDaysBefore: 60,
        totalDaysAfter: 180,
        tickInterval: 30,
      };
  }
}

function groupByRole(resources) {
  const map = new Map();
  for (const r of resources) {
    const existing = map.get(r.role) || [];
    existing.push(r);
    map.set(r.role, existing);
  }
  return map;
}

// ----- Sub-components -----

function TimelineHeader({ zoom, ticks, todayOffset, totalDays, dayWidth }) {
  return (
    <div
      className="relative h-10 border-b bg-muted/30 z-10"
      style={{ width: `${totalDays * dayWidth}px` }}
    >
      {ticks.map((tick, i) => (
        <div
          key={i}
          className="absolute top-0 h-full flex items-center border-l border-border/20"
          style={{ left: `${tick.offset}px` }}
        >
          <span className="text-[10px] font-sans text-muted-foreground pl-1.5 whitespace-nowrap font-semibold">
            {tick.label}
          </span>
        </div>
      ))}
      {todayOffset >= 0 && todayOffset <= totalDays * dayWidth && (
        <div
          className="absolute top-0 h-full w-px bg-primary z-20"
          style={{ left: `${todayOffset}px` }}
        >
          <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 rounded-b leading-tight py-0.5 shadow-sm">
            Today
          </div>
        </div>
      )}
    </div>
  );
}

function AllocationBar({
  block,
  startDate,
  dayWidth,
  resource,
  onResourceClick,
  style,
}) {
  const blockStart = parseDate(block.startDate);
  const blockEnd = parseDate(block.endDate);
  const offsetDays = daysBetween(startDate, blockStart);
  const durationDays = daysBetween(blockStart, blockEnd);

  const left = offsetDays * dayWidth;
  const width = Math.max(durationDays * dayWidth, 4);
  const barHeight = TRACK_HEIGHT - 6;

  const isAvailability = block.isAvailability || block.allocation === 0;

  return (
    <div
      style={{
        position: "absolute",
        left: `${left}px`,
        width: `${width}px`,
        height: `${barHeight}px`,
        ...style,
      }}
      className="z-20 group hover:z-[100]"
    >
      <button
        type="button"
        className={cn(
          "w-full h-full rounded shadow-sm border transition-colors flex items-center px-3 overflow-hidden",
          getBarColor(block.allocation, block.tentative),
          getBarHoverColor(block.allocation, block.tentative),
          isAvailability && "cursor-default",
        )}
        onClick={() => !isAvailability && onResourceClick(resource)}
      >
        {width > 60 && (
          <span
            className={cn(
              "text-[11px] font-medium truncate block leading-none",
              block.tentative ? "text-slate-600" : "text-white",
            )}
          >
            {isAvailability
              ? "Available (100%)"
              : `${block.project} (${block.allocation}%)`}
          </span>
        )}
      </button>

      <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 z-[9999] pointer-events-none">
        <div className="bg-white p-3 shadow-2xl border border-slate-200 rounded-lg min-w-[220px]">
          <div className="space-y-2">
            <p className="text-xs font-heading font-bold text-slate-900 border-b pb-1.5">
              {isAvailability ? "Availability Info" : block.project}
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <span className="text-slate-500 text-[10px]">
                {isAvailability ? "Availability" : "Allocation"}
              </span>
              <span className="font-semibold text-slate-900 text-[10px] text-right">
                {isAvailability ? "100%" : `${block.allocation}%`}
              </span>
              <span className="text-slate-500 text-[10px]">Period</span>
              <span className="font-semibold text-slate-900 text-[10px] text-right">
                {block.startDate} to {block.endDate}
              </span>
            </div>
            {block.tentative && (
              <div className="mt-1 flex items-center gap-1.5 pt-1 border-t">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-[10px] font-bold text-amber-600 uppercase">
                  Tentative
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceRow({
  resource,
  startDate,
  endDate,
  dayWidth,
  todayOffset,
  onResourceClick,
  rowHeight,
  ticks,
  weeklyTicks,
  realToday,
}) {
  const totalDays = daysBetween(startDate, endDate);

  const blocksWithTracks = useMemo(() => {
    const visibleProjects = (resource.allocationTimeline || []).filter((b) => {
      const bStart = parseDate(b.startDate);
      const bEnd = parseDate(b.endDate);
      return bEnd >= startDate && bStart <= endDate;
    });

    const projectBlocks = visibleProjects.map((block, index) => ({
      ...block,
      trackIndex: index,
    }));

    // Find the track index of the project that ends the latest among visible ones
    let latestTrackIndex = 0;
    if (projectBlocks.length > 0) {
      let maxEndDate = parseDate(projectBlocks[0].endDate);
      projectBlocks.forEach((pb) => {
        const d = parseDate(pb.endDate);
        if (d > maxEndDate) {
          maxEndDate = d;
          latestTrackIndex = pb.trackIndex;
        }
      });
    }

    // Handle availability bar
    const timelineEndDate = endDate;
    const today = realToday || parseDate(new Date());
    let availStart = null;

    if (
      !resource.allocationTimeline ||
      resource.allocationTimeline.length === 0
    ) {
      availStart = today;
    } else {
      // Find the latest end date among ALL projects to determine when availability actually starts
      const globalLatestEnd = resource.allocationTimeline.reduce(
        (latest, b) => {
          const d = parseDate(b.endDate);
          return d > latest ? d : latest;
        },
        parseDate(resource.allocationTimeline[0].endDate),
      );

      const availableFrom = resource.availableFrom
        ? parseDate(resource.availableFrom)
        : today;
      availStart =
        globalLatestEnd > availableFrom ? globalLatestEnd : availableFrom;
    }

    const result = [...projectBlocks];

    if (availStart && availStart < timelineEndDate) {
      // Clip start date to visible window
      const actualStart = availStart < startDate ? startDate : availStart;

      if (actualStart < timelineEndDate) {
        result.push({
          project: "Available (100%)",
          startDate: actualStart.toISOString().split("T")[0],
          endDate: timelineEndDate.toISOString().split("T")[0],
          allocation: 0,
          isAvailability: true,
          trackIndex: latestTrackIndex, // Place on the same track as the latest ending project
        });
      }
    }

    return result;
  }, [
    resource.allocationTimeline,
    resource.availableFrom,
    startDate,
    endDate,
    realToday,
  ]);

  return (
    <div
      className="relative border-b border-border/30 hover:bg-slate-50/30 transition-colors hover:z-50"
      style={{ height: `${rowHeight}px`, width: `${totalDays * dayWidth}px` }}
    >
      {/* Background Grid - Combine major and minor ticks */}
      {(weeklyTicks || ticks).map((tick, i) => (
        <div
          key={i}
          className={cn(
            "absolute top-0 h-full border-l",
            tick.isMonth ? "border-border/20" : "border-border/10",
          )}
          style={{ left: `${tick.offset}px` }}
        />
      ))}
      {todayOffset >= 0 && todayOffset <= totalDays * dayWidth && (
        <div
          className="absolute top-0 h-full w-px bg-primary/20 z-10"
          style={{ left: `${todayOffset}px` }}
        />
      )}
      {blocksWithTracks.map((block, i) => (
        <AllocationBar
          key={`${block.project}-${i}`}
          block={block}
          startDate={startDate}
          dayWidth={dayWidth}
          resource={resource}
          onResourceClick={onResourceClick}
          style={{
            top: `${block.trackIndex * TRACK_HEIGHT + ROW_PADDING / 2}px`,
          }}
        />
      ))}
    </div>
  );
}

function RoleAggregateRow({
  role,
  resources,
  startDate,
  endDate,
  dayWidth,
  todayOffset,
  rowHeight,
  onResourceClick,
  ticks,
  weeklyTicks,
}) {
  const totalDays = daysBetween(startDate, endDate);

  const projectBlocks = useMemo(() => {
    const projects = new Map();
    resources.forEach((res) => {
      (res.allocationTimeline || []).forEach((block) => {
        const bStart = parseDate(block.startDate);
        const bEnd = parseDate(block.endDate);
        if (bEnd >= startDate && bStart <= endDate) {
          const key = block.project;
          if (!projects.has(key)) {
            projects.set(key, {
              project: block.project,
              startDate: block.startDate,
              endDate: block.endDate,
              allocation: block.allocation,
              tentative: block.tentative,
              resources: [res.name],
            });
          } else {
            const existing = projects.get(key);
            if (parseDate(block.startDate) < parseDate(existing.startDate))
              existing.startDate = block.startDate;
            if (parseDate(block.endDate) > parseDate(existing.endDate))
              existing.endDate = block.endDate;
            if (!existing.resources.includes(res.name))
              existing.resources.push(res.name);
            existing.allocation = Math.max(
              existing.allocation,
              block.allocation,
            );
            existing.tentative = existing.tentative && block.tentative;
          }
        }
      });
    });
    return Array.from(projects.values());
  }, [resources, startDate, endDate]);

  return (
    <div
      className="relative border-b border-border/30 hover:bg-slate-50/20 transition-colors hover:z-50"
      style={{ height: `${rowHeight}px`, width: `${totalDays * dayWidth}px` }}
    >
      {(weeklyTicks || ticks).map((tick, i) => (
        <div
          key={i}
          className={cn(
            "absolute top-0 h-full border-l",
            tick.isMonth ? "border-border/20" : "border-border/10",
          )}
          style={{ left: `${tick.offset}px` }}
        />
      ))}
      {todayOffset >= 0 && todayOffset <= totalDays * dayWidth && (
        <div
          className="absolute top-0 h-full w-px bg-primary/20 z-10"
          style={{ left: `${todayOffset}px` }}
        />
      )}
      {projectBlocks.map((block, i) => {
        const blockStart = new Date(block.startDate);
        const blockEnd = new Date(block.endDate);
        const offsetDaysVal = daysBetween(startDate, blockStart);
        const durationDaysVal = daysBetween(blockStart, blockEnd);
        const left = offsetDaysVal * dayWidth;
        const width = Math.max(durationDaysVal * dayWidth, 4);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${left}px`,
              width: `${width}px`,
              top: `${i * TRACK_HEIGHT + ROW_PADDING / 2.5}px`,
              height: `${TRACK_HEIGHT - 6}px`,
            }}
            className="z-20 group hover:z-[100]"
          >
            <button
              type="button"
              className={cn(
                "w-full h-full rounded shadow-sm border transition-colors flex items-center px-3 overflow-hidden",
                getBarColor(block.allocation, block.tentative),
                getBarHoverColor(block.allocation, block.tentative),
              )}
            >
              {width > 60 && (
                <span
                  className={cn(
                    "text-[11px] font-medium truncate block leading-none",
                    block.tentative ? "text-slate-600" : "text-white",
                  )}
                >
                  {block.project}
                </span>
              )}
            </button>

            <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 z-[9999] pointer-events-none">
              <div className="bg-white p-3 shadow-2xl border border-slate-200 rounded-lg min-w-[240px]">
                <div className="space-y-2">
                  <p className="text-xs font-heading font-bold text-slate-900 border-b pb-1.5">
                    {block.project}
                  </p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <span className="text-slate-500 text-[10px]">
                      Team Size
                    </span>
                    <span className="font-semibold text-slate-900 text-[10px] text-right">
                      {block.resources.length} people
                    </span>
                    <span className="text-slate-500 text-[10px]">Period</span>
                    <span className="font-semibold text-slate-900 text-[10px] text-right">
                      {block.startDate} to {block.endDate}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t">
                    <p className="text-[9px] text-slate-400 uppercase font-black mb-1">
                      Assigned Personnel
                    </p>
                    <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                      {block.resources.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm flex flex-col h-full bg-slate-50 animate-pulse">
      <div className="h-14 border-b p-3 bg-white flex items-center justify-between">
        <div className="h-8 w-40 bg-slate-100 rounded" />
        <div className="h-8 w-60 bg-slate-100 rounded" />
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="w-[180px] lg:w-[240px] border-r bg-white p-4 space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-100 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-3/4 bg-slate-100 rounded" />
                <div className="h-2 w-1/2 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-white relative">
          <div className="h-10 border-b bg-slate-50 flex items-center px-4">
            <div className="h-3 w-3/4 bg-slate-100 rounded" />
          </div>
          <div className="p-4 space-y-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-full bg-slate-50 rounded relative">
                <div className="absolute top-1 left-4 h-6 w-1/3 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AvailabilityTimeline({
  filteredResources,
  onResourceClick,
  currentDate,
  loading,
  filters,
  setFilters,
}) {
  if (loading) return <TimelineSkeleton />;
  const [zoom, setZoom] = useState("month");
  const [viewMode, setViewMode] = useState("resource");
  const scrollRef = useRef(null);
  const scrolledRef = useRef(false);

  // Use actual current date
  const realToday = parseDate(new Date());

  const baseDate = useMemo(() => parseDate(currentDate), [currentDate]);

  const config = getZoomConfig(zoom);

  const startDate = useMemo(() => {
    let d = addDays(baseDate, -config.totalDaysBefore);
    if (zoom === "week") {
      const day = d.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
      const diff = day === 0 ? 6 : day - 1; // Snap to Monday (if Sunday, go back 6 days; otherwise, go back day-1 days)
      d.setDate(d.getDate() - diff);
    } else {
      d.setDate(1); // Snap to 1st of month
    }
    return d;
  }, [baseDate, config.totalDaysBefore, zoom]);

  const endDate = useMemo(
    () => addDays(baseDate, config.totalDaysAfter),
    [baseDate, config.totalDaysAfter],
  );
  const totalDays = daysBetween(startDate, endDate);

  const todayOffset = useMemo(() => {
    const days = daysBetween(startDate, realToday);
    return days * config.dayWidth;
  }, [startDate, realToday, config.dayWidth]);

  const ticks = useMemo(() => {
    const result = [];
    if (zoom === "week") {
      for (let i = 0; i <= totalDays; i += 7) {
        const d = addDays(startDate, i);
        result.push({
          label: formatDate(d),
          offset: i * config.dayWidth,
        });
      }
    } else {
      // month or quarter
      let curr = new Date(startDate);
      curr.setDate(1);
      // If startDate is after the 1st of the month, move to the next month's 1st
      if (curr < startDate) curr.setMonth(curr.getMonth() + 1);

      while (curr <= endDate) {
        const i = daysBetween(startDate, curr);
        result.push({
          label: formatMonthYear(curr),
          offset: i * config.dayWidth,
          isMonth: true,
        });
        curr.setMonth(curr.getMonth() + 1);
      }
    }
    return result;
  }, [startDate, endDate, zoom, config.dayWidth, totalDays]);

  const weeklyTicks = useMemo(() => {
    if (zoom === "week") return null; // Already handled by primary ticks
    const result = [];
    let curr = new Date(startDate);
    // Snap to first Monday
    const day = curr.getDay();
    const diff = day === 0 ? 6 : day - 1;
    curr.setDate(curr.getDate() - diff);
    if (curr < startDate) curr.setDate(curr.getDate() + 7);

    while (curr <= endDate) {
      result.push({
        offset: daysBetween(startDate, curr) * config.dayWidth,
        isMonth: false,
      });
      curr.setDate(curr.getDate() + 7);
    }
    return result;
  }, [startDate, endDate, zoom, config.dayWidth]);

  const roleGroups = useMemo(
    () => groupByRole(filteredResources),
    [filteredResources],
  );

  const resourceRowHeights = useMemo(() => {
    const heights = new Map();
    filteredResources.forEach((resource) => {
      const visibleBlocksCount = (resource.allocationTimeline || []).filter(
        (b) => {
          const bStart = parseDate(b.startDate);
          const bEnd = parseDate(b.endDate);
          return bEnd >= startDate && bStart <= endDate;
        },
      ).length;

      // The availability bar now shares a track with the latest project.
      // So the number of tracks is just the number of visible blocks (minimum 1).
      const numTracks = Math.max(1, visibleBlocksCount);
      heights.set(resource.id, numTracks * TRACK_HEIGHT + ROW_PADDING);
    });
    return heights;
  }, [filteredResources, startDate, endDate]);

  const roleRowHeights = useMemo(() => {
    const heights = new Map();
    roleGroups.forEach((resources, role) => {
      const projects = new Set();
      resources.forEach((res) => {
        (res.allocationTimeline || []).forEach((b) => {
          const bStart = new Date(b.startDate);
          const bEnd = new Date(b.endDate);
          if (bEnd >= startDate && bStart <= endDate) {
            projects.add(b.project);
          }
        });
      });
      const numTracks = Math.max(1, projects.size);
      heights.set(role, numTracks * TRACK_HEIGHT + ROW_PADDING);
    });
    return heights;
  }, [roleGroups, startDate, endDate]);

  const scrollToToday = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft =
        todayOffset - scrollRef.current.clientWidth / 3;
    }
  }, [todayOffset]);

  useEffect(() => {
    if (scrollRef.current && currentDate) {
      // Small delay to ensure layout is ready
      const timer = setTimeout(() => {
        const targetOffset = daysBetween(startDate, baseDate) * config.dayWidth;
        scrollRef.current.scrollLeft =
          targetOffset - scrollRef.current.clientWidth / 3;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [baseDate, startDate, config.dayWidth]);

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm flex flex-col h-full bg-slate-50">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b p-3 bg-white relative z-50">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v)}>
            <TabsList className="h-8 bg-muted/50 p-1">
              <TabsTrigger
                value="resource"
                className="text-[10px] h-6 gap-1.5 px-2 sm:px-3 rounded-sm"
              >
                <User className="h-3 w-3" />
                <span className="hidden xs:inline">Resource</span>
                <span className="xs:hidden">Resources</span>
              </TabsTrigger>
              <TabsTrigger
                value="role"
                className="text-[10px] h-6 gap-1.5 px-2 sm:px-3 rounded-sm"
              >
                <Layers className="h-3 w-3" />
                Role
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {viewMode === "resource" && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              className="h-7 px-2 sm:px-3 text-[10px] font-medium border rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all w-40 sm:w-52"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }))
              }
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Top Row → Zoom + Today */}
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3">
            <div className="flex items-center rounded-md border bg-muted/50 p-0.5">
              {["week", "month", "quarter"].map((z) => (
                <button
                  key={z}
                  type="button"
                  className={cn(
                    "px-2 sm:px-3 py-1 text-[10px] font-semibold transition-all capitalize rounded-sm",
                    zoom === z
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => {
                    setZoom(z);
                    scrolledRef.current = false;
                  }}
                >
                  {z}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="px-2 sm:px-3 py-1 text-[10px] font-semibold transition-all rounded-sm border-white bg-blue-600 hover:bg-blue-700 text-white"
              onClick={scrollToToday}
            >
              Today
            </button>
          </div>

          {/* Bottom Row → Status Legend */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <div className="h-2 w-3 sm:w-4 rounded-sm bg-emerald-500 shrink-0" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <div className="h-2 w-3 sm:w-4 rounded-sm bg-amber-400 shrink-0" />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <div className="h-2 w-3 sm:w-4 rounded-sm bg-rose-400 shrink-0" />
              <span>Allocated</span>
            </div>
          </div>
        </div>
      </div>

      <TooltipProvider delayDuration={100}>
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Sidebar */}
          <div className="shrink-0 border-r bg-white z-40 w-[120px] sm:w-[180px] lg:w-[240px] flex flex-col shadow-sm">
            <div className="h-10 border-b bg-muted/40 flex items-center px-2 sm:px-4 shrink-0">
              <span className="text-[8px] sm:text-[10px] font-heading font-bold text-muted-foreground uppercase tracking-wider truncate">
                {viewMode === "resource" ? "Resource" : "Role Category"}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {viewMode === "resource"
                ? filteredResources.map((resource) => {
                    const dynamicRowHeight =
                      resourceRowHeights.get(resource.id) || 48;
                    return (
                      <button
                        key={resource.id}
                        type="button"
                        className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 border-b border-slate-100 hover:bg-muted/50 transition-colors shrink-0"
                        style={{ height: `${dynamicRowHeight}px` }}
                        onClick={() => onResourceClick(resource)}
                      >
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                          <AvatarFallback className="text-[8px] sm:text-[10px] font-medium bg-primary/10 text-primary">
                            {resource.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 text-left">
                          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                            <p className="text-[10px] sm:text-xs font-heading font-bold text-foreground truncate min-w-0 flex-1">
                              {resource.name}
                            </p>
                            {resource.noticeInfo?.isNoticePeriod && (
                              <span className="text-[7px] sm:text-[9px] font-bold text-red-500 whitespace-nowrap px-0.5 sm:px-1 py-0.5 bg-red-50 rounded shrink-0 hidden xs:inline-block">
                                On Notice
                              </span>
                            )}
                          </div>
                          <p className="text-[8px] sm:text-[10px] text-muted-foreground truncate">
                            {resource.role}
                          </p>
                        </div>
                      </button>
                    );
                  })
                : [...roleGroups.entries()].map(([role, resources]) => {
                    const dynamicRowHeight = roleRowHeights.get(role) || 48;
                    return (
                      <div
                        key={role}
                        className="flex flex-col justify-center px-4 border-b border-slate-100"
                        style={{ height: `${dynamicRowHeight}px` }}
                      >
                        <p className="text-sm font-heading font-bold text-slate-800 truncate">
                          {role}
                        </p>
                        <p className="text-[11px] font-sans font-medium text-slate-400">
                          {resources.length}{" "}
                          {resources.length === 1 ? "person" : "people"}
                        </p>
                      </div>
                    );
                  })}
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto bg-white relative z-20"
          >
            <div style={{ width: `${totalDays * config.dayWidth}px` }}>
              <TimelineHeader
                zoom={zoom}
                ticks={ticks}
                todayOffset={todayOffset}
                totalDays={totalDays}
                dayWidth={config.dayWidth}
              />

              {viewMode === "resource"
                ? filteredResources.map((resource) => (
                    <ResourceRow
                      key={resource.id}
                      resource={resource}
                      startDate={startDate}
                      endDate={endDate}
                      dayWidth={config.dayWidth}
                      todayOffset={todayOffset}
                      onResourceClick={onResourceClick}
                      rowHeight={resourceRowHeights.get(resource.id) || 48}
                      ticks={ticks}
                      weeklyTicks={weeklyTicks}
                      realToday={realToday}
                    />
                  ))
                : [...roleGroups.entries()].map(([role, resources]) => (
                    <RoleAggregateRow
                      key={role}
                      role={role}
                      resources={resources}
                      startDate={startDate}
                      endDate={endDate}
                      dayWidth={config.dayWidth}
                      todayOffset={todayOffset}
                      rowHeight={roleRowHeights.get(role) || 48}
                      onResourceClick={onResourceClick}
                      ticks={ticks}
                      weeklyTicks={weeklyTicks}
                    />
                  ))}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
