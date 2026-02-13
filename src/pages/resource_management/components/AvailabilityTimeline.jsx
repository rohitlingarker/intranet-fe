import { useState, useMemo, useRef, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Layers, User } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ----- Constants -----
const TRACK_HEIGHT = 36
const ROW_PADDING = 13

// ----- Helper Functions -----

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatMonthYear(d) {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

function getBarColor(allocation, tentative) {
  if (tentative) return "bg-slate-200 border-slate-300 border-dashed"
  if (allocation > 100) return "bg-red-500 border-red-600" // Over
  if (allocation > 70) return "bg-rose-400 border-rose-500" // Allocated
  if (allocation > 20) return "bg-amber-400 border-amber-500" // Partial
  return "bg-emerald-500 border-emerald-600" // Available
}

function getBarHoverColor(allocation, tentative) {
  if (tentative) return "hover:bg-slate-300"
  if (allocation > 100) return "hover:bg-red-600"
  if (allocation > 70) return "hover:bg-rose-500"
  if (allocation > 20) return "hover:bg-amber-500"
  return "hover:bg-emerald-600"
}

function getZoomConfig(zoom) {
  switch (zoom) {
    case "week":
      return { dayWidth: 32, totalDaysBefore: 14, totalDaysAfter: 42, tickInterval: 7 }
    case "month":
      return { dayWidth: 8, totalDaysBefore: 30, totalDaysAfter: 120, tickInterval: 30 }
    case "quarter":
      return { dayWidth: 3.2, totalDaysBefore: 60, totalDaysAfter: 180, tickInterval: 30 }
  }
}

function groupByRole(resources) {
  const map = new Map()
  for (const r of resources) {
    const existing = map.get(r.role) || []
    existing.push(r)
    map.set(r.role, existing)
  }
  return map
}

// ----- Sub-components -----

function TimelineHeader({ zoom, startDate, endDate, dayWidth, tickInterval, todayOffset }) {
  const totalDays = daysBetween(startDate, endDate)
  const ticks = []

  for (let i = 0; i <= totalDays; i += tickInterval) {
    const d = addDays(startDate, i)
    ticks.push({
      label: zoom === "week" ? formatDate(d) : formatMonthYear(d),
      offset: i * dayWidth,
    })
  }

  return (
    <div className="relative h-10 border-b bg-muted/30" style={{ width: `${totalDays * dayWidth}px` }}>
      {ticks.map((tick, i) => (
        <div
          key={i}
          className="absolute top-0 h-full flex items-center border-l border-border/20"
          style={{ left: `${tick.offset}px` }}
        >
          <span className="text-[10px] text-muted-foreground pl-1.5 whitespace-nowrap font-medium">
            {tick.label}
          </span>
        </div>
      ))}
      <div
        className="absolute top-0 h-full w-0.5 bg-primary z-20"
        style={{ left: `${todayOffset}px` }}
      >
        <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 rounded-b leading-tight py-0.5 shadow-sm">
          Today
        </div>
      </div>
    </div>
  )
}

function AllocationBar({ block, startDate, dayWidth, resource, onResourceClick, style }) {
  const blockStart = new Date(block.startDate)
  const blockEnd = new Date(block.endDate)
  const offsetDays = daysBetween(startDate, blockStart)
  const durationDays = daysBetween(blockStart, blockEnd)

  const left = offsetDays * dayWidth
  const width = Math.max(durationDays * dayWidth, 4)
  const barHeight = TRACK_HEIGHT - 6

  return (
    <div
      style={{
        position: "absolute",
        left: `${left}px`,
        width: `${width}px`,
        height: `${barHeight}px`,
        ...style
      }}
      className="z-20 group"
    >
      <button
        type="button"
        className={cn(
          "w-full h-full rounded shadow-sm border transition-colors flex items-center px-3 overflow-hidden",
          getBarColor(block.allocation, block.tentative),
          getBarHoverColor(block.allocation, block.tentative),
        )}
        onClick={() => onResourceClick(resource)}
      >
        {width > 60 && (
          <span className={cn(
            "text-[11px] font-medium truncate block leading-none",
            block.tentative ? "text-slate-600" : "text-white",
          )}
          >
            {block.project} ({block.allocation}%)
          </span>
        )}
      </button>

      {/* Custom Tooltip Content */}
      <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 z-[9999] pointer-events-none">
        <div className="bg-white p-3 shadow-2xl border border-slate-200 rounded-lg min-w-[220px]">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-900 border-b pb-1.5">{block.project}</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <span className="text-slate-500 text-[10px]">Allocation</span>
              <span className="font-semibold text-slate-900 text-[10px] text-right">{block.allocation}%</span>

              <span className="text-slate-500 text-[10px]">Period</span>
              <span className="font-semibold text-slate-900 text-[10px] text-right">{block.startDate} to {block.endDate}</span>
            </div>
            {block.tentative && (
              <div className="mt-1 flex items-center gap-1.5 pt-1 border-t">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-[10px] font-bold text-amber-600 uppercase">Tentative</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ResourceRow({ resource, startDate, endDate, dayWidth, todayOffset, onResourceClick, rowHeight }) {
  const totalDays = daysBetween(startDate, endDate)

  const visibleBlocks = useMemo(() => {
    return (resource.allocationTimeline || []).filter((b) => {
      const bStart = new Date(b.startDate)
      const bEnd = new Date(b.endDate)
      return bEnd >= startDate && bStart <= endDate
    })
  }, [resource.allocationTimeline, startDate, endDate])

  const blocksWithTracks = useMemo(() => {
    return visibleBlocks.map((block, index) => ({ ...block, trackIndex: index }))
  }, [visibleBlocks])

  return (
    <div
      className="relative border-b border-border/30 hover:bg-slate-50/30 transition-colors"
      style={{ height: `${rowHeight}px`, width: `${totalDays * dayWidth}px` }}
    >
      {Array.from({ length: Math.floor(totalDays / 7) + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full border-l border-border/10"
          style={{ left: `${i * 7 * dayWidth}px` }}
        />
      ))}
      <div
        className="absolute top-0 h-full w-px bg-primary/20 z-10"
        style={{ left: `${todayOffset}px` }}
      />
      {blocksWithTracks.map((block, i) => (
        <AllocationBar
          key={`${block.project}-${i}`}
          block={block}
          startDate={startDate}
          dayWidth={dayWidth}
          resource={resource}
          onResourceClick={onResourceClick}
          style={{ top: `${block.trackIndex * TRACK_HEIGHT + (ROW_PADDING / 2)}px` }}
        />
      ))}
    </div>
  )
}

function RoleAggregateRow({ role, resources, startDate, endDate, dayWidth, todayOffset, rowHeight, onResourceClick }) {
  const totalDays = daysBetween(startDate, endDate)

  const projectBlocks = useMemo(() => {
    const projects = new Map()
    resources.forEach(res => {
      (res.allocationTimeline || []).forEach(block => {
        const bStart = new Date(block.startDate)
        const bEnd = new Date(block.endDate)
        if (bEnd >= startDate && bStart <= endDate) {
          const key = block.project
          if (!projects.has(key)) {
            projects.set(key, {
              project: block.project,
              startDate: block.startDate,
              endDate: block.endDate,
              allocation: block.allocation,
              tentative: block.tentative,
              resources: [res.name]
            })
          } else {
            const existing = projects.get(key)
            // Expand range if needed
            if (new Date(block.startDate) < new Date(existing.startDate)) existing.startDate = block.startDate
            if (new Date(block.endDate) > new Date(existing.endDate)) existing.endDate = block.endDate
            if (!existing.resources.includes(res.name)) existing.resources.push(res.name)
            existing.allocation = Math.max(existing.allocation, block.allocation)
            existing.tentative = existing.tentative && block.tentative
          }
        }
      })
    })
    return Array.from(projects.values())
  }, [resources, startDate, endDate])

  return (
    <div
      className="relative border-b border-border/30 hover:bg-slate-50/20 transition-colors"
      style={{ height: `${rowHeight}px`, width: `${totalDays * dayWidth}px` }}
    >
      {Array.from({ length: Math.floor(totalDays / 7) + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full border-l border-border/10"
          style={{ left: `${i * 7 * dayWidth}px` }}
        />
      ))}
      <div
        className="absolute top-0 h-full w-px bg-primary/20 z-10"
        style={{ left: `${todayOffset}px` }}
      />
      {projectBlocks.map((block, i) => {
        const blockStart = new Date(block.startDate)
        const blockEnd = new Date(block.endDate)
        const offsetDaysVal = daysBetween(startDate, blockStart)
        const durationDaysVal = daysBetween(blockStart, blockEnd)
        const left = offsetDaysVal * dayWidth
        const width = Math.max(durationDaysVal * dayWidth, 4)

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${left}px`,
              width: `${width}px`,
              top: `${i * TRACK_HEIGHT + (ROW_PADDING / 2.5)}px`,
              height: `${TRACK_HEIGHT - 6}px`,
            }}
            className="z-20 group"
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
                <span className={cn(
                  "text-[11px] font-medium truncate block leading-none",
                  block.tentative ? "text-slate-600" : "text-white",
                )}
                >
                  {block.project}
                </span>
              )}
            </button>

            {/* Custom Tooltip Content */}
            <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 z-[9999] pointer-events-none">
              <div className="bg-white p-3 shadow-2xl border border-slate-200 rounded-lg min-w-[240px]">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-900 border-b pb-1.5">{block.project}</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <span className="text-slate-500 text-[10px]">Team Size</span>
                    <span className="font-semibold text-slate-900 text-[10px] text-right">{block.resources.length} people</span>

                    <span className="text-slate-500 text-[10px]">Period</span>
                    <span className="font-semibold text-slate-900 text-[10px] text-right">{block.startDate} to {block.endDate}</span>
                  </div>
                  <div className="pt-1.5 border-t">
                    <p className="text-[9px] text-slate-400 uppercase font-black mb-1">Assigned Personnel</p>
                    <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">{block.resources.join(", ")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ----- Main Timeline Component -----

export function AvailabilityTimeline({ filteredResources, onResourceClick, currentDate }) {
  const [zoom, setZoom] = useState("month")
  const [viewMode, setViewMode] = useState("resource")
  const scrollRef = useRef(null)

  const config = getZoomConfig(zoom)
  const baseDate = currentDate || new Date()
  const startDate = useMemo(() => addDays(baseDate, -config.totalDaysBefore), [baseDate, config.totalDaysBefore])
  const endDate = useMemo(() => addDays(baseDate, config.totalDaysAfter), [baseDate, config.totalDaysAfter])
  const totalDays = daysBetween(startDate, endDate)
  const todayOffset = config.totalDaysBefore * config.dayWidth

  const roleGroups = useMemo(() => groupByRole(filteredResources), [filteredResources])

  const resourceRowHeights = useMemo(() => {
    const heights = new Map()
    filteredResources.forEach(resource => {
      const visibleBlocks = (resource.allocationTimeline || []).filter((b) => {
        const bStart = new Date(b.startDate)
        const bEnd = new Date(b.endDate)
        return bEnd >= startDate && bStart <= endDate
      })
      const numTracks = Math.max(1, visibleBlocks.length)
      heights.set(resource.id, (numTracks * TRACK_HEIGHT) + ROW_PADDING)
    })
    return heights
  }, [filteredResources, startDate, endDate])

  const roleRowHeights = useMemo(() => {
    const heights = new Map()
    roleGroups.forEach((resources, role) => {
      const projects = new Set()
      resources.forEach(res => {
        (res.allocationTimeline || []).forEach(b => {
          const bStart = new Date(b.startDate)
          const bEnd = new Date(b.endDate)
          if (bEnd >= startDate && bStart <= endDate) {
            projects.add(b.project)
          }
        })
      })
      const numTracks = Math.max(1, projects.size)
      heights.set(role, (numTracks * TRACK_HEIGHT) + ROW_PADDING)
    })
    return heights
  }, [roleGroups, startDate, endDate])

  const scrollToToday = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = todayOffset - scrollRef.current.clientWidth / 3
    }
  }, [todayOffset])

  const scrolledRef = useRef(false)

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-2 bg-muted/30">
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v)}>
            <TabsList className="h-8 bg-muted/50 p-1">
              <TabsTrigger value="resource" className="text-[10px] h-6 gap-1.5 px-2 rounded-sm">
                <User className="h-3 w-3" />
                Resource
              </TabsTrigger>
              <TabsTrigger value="role" className="text-[10px] h-6 gap-1.5 px-2 rounded-sm">
                <Layers className="h-3 w-3" />
                Role
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border bg-muted/50 p-0.5">
            {["week", "month", "quarter"].map((z) => (
              <button
                key={z}
                type="button"
                className={cn(
                  "px-3 py-1 text-[10px] font-semibold transition-all capitalize rounded-sm",
                  zoom === z
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  setZoom(z)
                  scrolledRef.current = false
                }}
              >
                {z}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-[10px] font-semibold bg-white"
            onClick={scrollToToday}
          >
            Today
          </Button>

          <div className="hidden lg:flex items-center gap-3 text-[10px] font-medium text-muted-foreground border-l pl-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-sm bg-emerald-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-sm bg-amber-400" />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-sm bg-rose-400" />
              <span>Allocated</span>
            </div>
          </div>
        </div>
      </div>

      <TooltipProvider delayDuration={100}>
        <div className="flex">
          {/* Sticky left column */}
          <div className="shrink-0 border-r bg-white z-10 w-[240px]">
            <div className="h-10 border-b bg-muted/40 flex items-center px-4">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {viewMode === "resource" ? "Resource" : "Role Category"}
              </span>
            </div>
            {viewMode === "resource" ? (
              filteredResources.map((resource) => {
                const dynamicRowHeight = resourceRowHeights.get(resource.id) || 48
                return (
                  <button
                    key={resource.id}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 border-b border-slate-100 hover:bg-muted/50 transition-colors"
                    style={{ height: `${dynamicRowHeight}px` }}
                    onClick={() => onResourceClick(resource)}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
                        {resource.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-semibold text-foreground truncate">{resource.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{resource.role}</p>
                    </div>
                  </button>
                )
              })
            ) : (
              [...roleGroups.entries()].map(([role, resources]) => {
                const dynamicRowHeight = roleRowHeights.get(role) || 48
                return (
                  <div
                    key={role}
                    className="flex flex-col justify-center px-4 border-b border-slate-100"
                    style={{ height: `${dynamicRowHeight}px` }}
                  >
                    <p className="text-sm font-bold text-slate-800 truncate">{role}</p>
                    <p className="text-[11px] font-medium text-slate-400">
                      {resources.length} {resources.length === 1 ? "person" : "people"}
                    </p>
                  </div>
                )
              })
            )}
          </div>

          {/* Scrollable timeline body */}
          <div
            ref={(el) => {
              if (el) {
                scrollRef.current = el
                if (!scrolledRef.current) {
                  el.scrollLeft = todayOffset - el.clientWidth / 3
                  scrolledRef.current = true
                }
              }
            }}
            className="flex-1 overflow-x-auto bg-white"
          >
            <div style={{ width: `${totalDays * config.dayWidth}px` }}>
              <TimelineHeader
                zoom={zoom}
                startDate={startDate}
                endDate={endDate}
                dayWidth={config.dayWidth}
                tickInterval={config.tickInterval}
                todayOffset={todayOffset}
              />

              {viewMode === "resource" ? (
                filteredResources.map((resource) => (
                  <ResourceRow
                    key={resource.id}
                    resource={resource}
                    startDate={startDate}
                    endDate={endDate}
                    dayWidth={config.dayWidth}
                    todayOffset={todayOffset}
                    onResourceClick={onResourceClick}
                    rowHeight={resourceRowHeights.get(resource.id) || 48}
                  />
                ))
              ) : (
                [...roleGroups.entries()].map(([role, resources]) => (
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
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}
