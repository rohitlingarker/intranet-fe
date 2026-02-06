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
  if (tentative) return "bg-muted-foreground/20 border border-dashed border-muted-foreground/40"
  if (allocation > 100) return "bg-destructive/70"
  if (allocation > 70) return "bg-status-allocated/70"
  if (allocation > 20) return "bg-status-partial/70"
  return "bg-status-available/70"
}

function getBarHoverColor(allocation, tentative) {
  if (tentative) return "hover:bg-muted-foreground/30"
  if (allocation > 100) return "hover:bg-destructive/90"
  if (allocation > 70) return "hover:bg-status-allocated/90"
  if (allocation > 20) return "hover:bg-status-partial/90"
  return "hover:bg-status-available/90"
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
    <div className="relative h-8 border-b bg-muted/30" style={{ width: `${totalDays * dayWidth}px` }}>
      {ticks.map((tick, i) => (
        <div
          key={i}
          className="absolute top-0 h-full flex items-center border-l border-border/50"
          style={{ left: `${tick.offset}px` }}
        >
          <span className="text-[10px] text-muted-foreground pl-1.5 whitespace-nowrap font-medium">
            {tick.label}
          </span>
        </div>
      ))}
      {/* Today marker in header */}
      <div
        className="absolute top-0 h-full w-0.5 bg-primary z-20"
        style={{ left: `${todayOffset}px` }}
      >
        <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-1 rounded-b leading-tight py-0.5">
          Today
        </div>
      </div>
    </div>
  )
}

function AllocationBar({ block, startDate, dayWidth, rowHeight, resource, onResourceClick }) {
  const blockStart = new Date(block.startDate)
  const blockEnd = new Date(block.endDate)
  const offsetDays = daysBetween(startDate, blockStart)
  const durationDays = daysBetween(blockStart, blockEnd)

  const left = offsetDays * dayWidth
  const width = Math.max(durationDays * dayWidth, 4)
  const barHeight = rowHeight - 12

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "absolute rounded-sm cursor-pointer transition-all",
            getBarColor(block.allocation, block.tentative),
            getBarHoverColor(block.allocation, block.tentative),
          )}
          style={{
            left: `${left}px`,
            width: `${width}px`,
            top: `${6}px`,
            height: `${barHeight}px`,
          }}
          onClick={() => onResourceClick(resource)}
        >
          {width > 60 && (
            <span className={cn(
              "text-[9px] font-medium px-1.5 truncate block leading-none",
              block.tentative ? "text-muted-foreground" : "text-card",
              block.allocation > 100 && !block.tentative && "text-destructive-foreground"
            )}
              style={{ lineHeight: `${barHeight}px` }}
            >
              {block.project} ({block.allocation}%)
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs max-w-[220px]">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{block.project}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Allocation</span>
            <span className="font-medium tabular-nums">{block.allocation}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Period</span>
            <span className="tabular-nums">{block.startDate} to {block.endDate}</span>
          </div>
          {block.tentative && (
            <Badge variant="outline" className="text-[10px] w-fit mt-0.5 border-dashed text-muted-foreground">
              Tentative
            </Badge>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function ResourceRow({ resource, startDate, endDate, dayWidth, todayOffset, rowHeight, onResourceClick }) {
  const totalDays = daysBetween(startDate, endDate)

  const visibleBlocks = resource.allocationTimeline.filter((b) => {
    const bStart = new Date(b.startDate)
    const bEnd = new Date(b.endDate)
    return bEnd >= startDate && bStart <= endDate
  })

  return (
    <div
      className="relative border-b border-border/40"
      style={{ height: `${rowHeight}px`, width: `${totalDays * dayWidth}px` }}
    >
      {Array.from({ length: Math.floor(totalDays / 7) + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full border-l border-border/20"
          style={{ left: `${i * 7 * dayWidth}px` }}
        />
      ))}
      <div
        className="absolute top-0 h-full w-px bg-primary/30 z-10"
        style={{ left: `${todayOffset}px` }}
      />
      {visibleBlocks.map((block, i) => (
        <AllocationBar
          key={`${block.project}-${i}`}
          block={block}
          startDate={startDate}
          dayWidth={dayWidth}
          rowHeight={rowHeight}
          resource={resource}
          onResourceClick={onResourceClick}
        />
      ))}
    </div>
  )
}

function RoleAggregateRow({ role, resources, startDate, endDate, dayWidth, todayOffset, rowHeight, onResourceClick }) {
  const totalDays = daysBetween(startDate, endDate)
  const barHeight = Math.max(Math.floor((rowHeight - 8) / resources.length), 6)

  return (
    <div
      className="relative border-b border-border/40"
      style={{ height: `${rowHeight}px`, width: `${totalDays * dayWidth}px` }}
    >
      {Array.from({ length: Math.floor(totalDays / 7) + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full border-l border-border/20"
          style={{ left: `${i * 7 * dayWidth}px` }}
        />
      ))}
      <div
        className="absolute top-0 h-full w-px bg-primary/30 z-10"
        style={{ left: `${todayOffset}px` }}
      />
      {resources.map((resource, rIdx) => {
        const visibleBlocks = resource.allocationTimeline.filter((b) => {
          const bStart = new Date(b.startDate)
          const bEnd = new Date(b.endDate)
          return bEnd >= startDate && bStart <= endDate
        })
        return visibleBlocks.map((block, bIdx) => {
          const blockStart = new Date(block.startDate)
          const blockEnd = new Date(block.endDate)
          const offsetDaysVal = daysBetween(startDate, blockStart)
          const durationDaysVal = daysBetween(blockStart, blockEnd)
          const left = offsetDaysVal * dayWidth
          const width = Math.max(durationDaysVal * dayWidth, 4)

          return (
            <Tooltip key={`${resource.id}-${bIdx}`}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "absolute rounded-sm cursor-pointer transition-all",
                    getBarColor(block.allocation, block.tentative),
                    getBarHoverColor(block.allocation, block.tentative),
                  )}
                  style={{
                    left: `${left}px`,
                    width: `${width}px`,
                    top: `${4 + rIdx * (barHeight + 1)}px`,
                    height: `${barHeight}px`,
                  }}
                  onClick={() => onResourceClick(resource)}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-semibold">{resource.name}</p>
                <p>{block.project} - {block.allocation}%</p>
                <p className="text-muted-foreground">{block.startDate} to {block.endDate}</p>
              </TooltipContent>
            </Tooltip>
          )
        })
      })}
    </div>
  )
}

// ----- Main Timeline Component -----

export function AvailabilityTimeline({ filteredResources, onResourceClick }) {
  const [zoom, setZoom] = useState("month")
  const [viewMode, setViewMode] = useState("resource")
  const scrollRef = useRef(null)

  const config = getZoomConfig(zoom)
  const today = useMemo(() => new Date(), [])
  const startDate = useMemo(() => addDays(today, -config.totalDaysBefore), [today, config.totalDaysBefore])
  const endDate = useMemo(() => addDays(today, config.totalDaysAfter), [today, config.totalDaysAfter])
  const totalDays = daysBetween(startDate, endDate)
  const todayOffset = config.totalDaysBefore * config.dayWidth

  const roleGroups = useMemo(() => groupByRole(filteredResources), [filteredResources])
  const rowHeight = viewMode === "role"
    ? Math.max(48, Math.min(80, 20 + [...roleGroups.values()].reduce((max, g) => Math.max(max, g.length), 0) * 10))
    : 40

  const scrollToToday = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = todayOffset - scrollRef.current.clientWidth / 3
    }
  }, [todayOffset])

  const scrolledRef = useRef(false)
  if (!scrolledRef.current && scrollRef.current) {
    scrollRef.current.scrollLeft = todayOffset - scrollRef.current.clientWidth / 3
    scrolledRef.current = true
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-card-foreground">Timeline</h3>
          <span className="text-xs text-muted-foreground">{filteredResources.length} resources</span>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v)}>
            <TabsList className="h-8">
              <TabsTrigger value="resource" className="text-xs h-7 gap-1.5 px-2.5">
                <User className="h-3.5 w-3.5" />
                Resource
              </TabsTrigger>
              <TabsTrigger value="role" className="text-xs h-7 gap-1.5 px-2.5">
                <Layers className="h-3.5 w-3.5" />
                Role
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center rounded-md border bg-card">
            {["week", "month", "quarter"].map((z) => (
              <button
                key={z}
                type="button"
                className={cn(
                  "px-2.5 py-1 text-xs font-medium transition-colors capitalize",
                  zoom === z
                    ? "bg-primary text-primary-foreground"
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
            className="h-7 text-xs bg-transparent"
            onClick={scrollToToday}
          >
            Today
          </Button>

          <div className="hidden lg:flex items-center gap-3 text-[10px] text-muted-foreground border-l pl-3">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-6 rounded-sm bg-status-available/70" />
              Available
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-6 rounded-sm bg-status-partial/70" />
              Partial
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-6 rounded-sm bg-status-allocated/70" />
              Allocated
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-6 rounded-sm bg-destructive/70" />
              Over
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-6 rounded-sm border border-dashed border-muted-foreground/40 bg-muted-foreground/20" />
              Tentative
            </span>
          </div>
        </div>
      </div>

      <TooltipProvider delayDuration={100}>
        <div className="flex">
          {/* Sticky left column */}
          <div className="shrink-0 border-r bg-card z-10 w-[220px]">
            <div className="h-8 border-b bg-muted/30 flex items-center px-3">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {viewMode === "resource" ? "Resource" : "Role"}
              </span>
            </div>
            {viewMode === "resource" ? (
              filteredResources.map((resource) => (
                <button
                  key={resource.id}
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 border-b border-border/40 hover:bg-muted/40 cursor-pointer transition-colors"
                  style={{ height: `${rowHeight}px` }}
                  onClick={() => onResourceClick(resource)}
                >
                  <Avatar className="h-6 w-6 border shrink-0">
                    <AvatarFallback className="text-[9px] font-medium bg-primary/10 text-primary">
                      {resource.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-medium text-card-foreground truncate">{resource.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{resource.role}</p>
                  </div>
                </button>
              ))
            ) : (
              [...roleGroups.entries()].map(([role, resources]) => (
                <div
                  key={role}
                  className="flex items-center gap-2.5 px-3 border-b border-border/40"
                  style={{ height: `${rowHeight}px` }}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-card-foreground truncate">{role}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {resources.length} {resources.length === 1 ? "person" : "people"}
                    </p>
                  </div>
                </div>
              ))
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
            className="flex-1 overflow-x-auto overflow-y-hidden"
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
                    rowHeight={rowHeight}
                    onResourceClick={onResourceClick}
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
                    rowHeight={rowHeight}
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
