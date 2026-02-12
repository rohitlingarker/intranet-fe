
import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Layers, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { generateCalendarDays } from "../services/availabilityService"

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getStatusColor(status) {
  switch (status) {
    case "available": return "bg-status-available"
    case "partial": return "bg-status-partial"
    case "allocated": return "bg-status-allocated"
  }
}

function getStatusColorLight(status) {
  switch (status) {
    case "available": return "bg-status-available/15 border-status-available/30"
    case "partial": return "bg-status-partial/15 border-status-partial/30"
    case "allocated": return "bg-status-allocated/15 border-status-allocated/30"
  }
}

function getAggregateStatus(day, resourceIds) {
  const filtered = day.resources.filter((r) => resourceIds.has(r.resourceId))
  const available = filtered.filter((r) => r.status === "available").length
  const partial = filtered.filter((r) => r.status === "partial").length
  const allocated = filtered.filter((r) => r.status === "allocated").length

  let dominant = "available"
  if (allocated >= partial && allocated >= available) dominant = "allocated"
  else if (partial >= available) dominant = "partial"

  return { available, partial, allocated, dominant }
}

export function AvailabilityCalendar({ filteredResources, onDayClick, selectedResourceId, onSelectResource }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [viewMode, setViewMode] = useState("aggregate")
  // Initialize internal state with prop if available, or default to first resource
  const [internalSelectedResource, setInternalSelectedResource] = useState(
    selectedResourceId || filteredResources[0]?.id || ""
  )
  const [selectedDate, setSelectedDate] = useState(null)

  // Sync internal state with prop changes
  useMemo(() => {
    if (selectedResourceId) {
      setInternalSelectedResource(selectedResourceId)
    }
  }, [selectedResourceId])

  const handleResourceSelect = (value) => {
    setInternalSelectedResource(value)
    if (onSelectResource) {
      // Find the full resource object if needed, but the ID is usually enough for the parent to set state
      const numId = filteredResources.find(r => r.id === value)
      if (numId) onSelectResource(numId)
    }
  }

  const handleDayClickInternal = (date, status) => {
    setSelectedDate(date)
    if (onDayClick) onDayClick(date, status)
  }

  // Pass filteredResources to the generator so the calendar reflects the sidebar filters
  const calendarDays = useMemo(() => generateCalendarDays(year, month, filteredResources), [year, month, filteredResources])
  const filteredIds = useMemo(
    () => new Set(filteredResources.map((r) => r.id)),
    [filteredResources]
  )

  const firstDayOffset = calendarDays[0]?.dayOfWeek || 0

  function navigateMonth(direction) {
    const newDate = new Date(year, month + direction, 1)
    setYear(newDate.getFullYear())
    setMonth(newDate.getMonth())
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b p-4">
        {/* Left: Month Navigation */}
        <div className="flex items-center gap-4 min-w-[280px]">
          <Button variant="outline" size="icon" className="h-9 w-9 bg-white rounded-lg border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          </Button>
          <h2 className="text-lg font-bold text-slate-900 min-w-[140px] text-center font-serif tracking-tight">
            {MONTH_NAMES[month]} {year}
          </h2>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-white rounded-lg border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4 text-slate-700" />
          </Button>
        </div>

        {/* Right: View Toggles, Resource Selector (Reserved Space), and Legend */}
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v)} className="shrink-0">
            <TabsList className="h-9 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="aggregate" className="text-xs h-7 gap-1.5 px-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Layers className="h-3.5 w-3.5" />
                Team
              </TabsTrigger>
              <TabsTrigger value="individual" className="text-xs h-7 gap-1.5 px-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <User className="h-3.5 w-3.5" />
                Individual
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Reserved space for Resource Selector dropdown */}
          <div className="w-[200px] h-9 shrink-0 flex items-center">
            {viewMode === "individual" && (
              <Select value={internalSelectedResource} onValueChange={handleResourceSelect}>
                <SelectTrigger className="w-full h-9 text-xs rounded-lg border-2 border-primary/20 bg-background focus:ring-0 focus:border-primary transition-colors animate-in fade-in zoom-in duration-200">
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {filteredResources.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="text-xs">
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0 border-l pl-4">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-2.5 w-2.5 rounded-full bg-status-available" />
              Available
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-2.5 w-2.5 rounded-full bg-status-partial" />
              Partial
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-2.5 w-2.5 rounded-full bg-status-allocated" />
              Allocated
            </span>
          </div>
        </div>
      </div>

      <TooltipProvider delayDuration={100}>
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1.5">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {calendarDays.map((day) => {
              const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6
              const isToday =
                day.dayOfMonth === now.getDate() &&
                month === now.getMonth() &&
                year === now.getFullYear()
              const isSelected = selectedDate === day.date

              if (viewMode === "aggregate") {
                const agg = getAggregateStatus(day, filteredIds)
                const total = agg.available + agg.partial + agg.allocated

                return (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "aspect-square rounded-2xl border p-1.5 flex flex-col items-center justify-between transition-all hover:shadow-md group",
                          isWeekend ? "bg-slate-50/50 border-slate-100 opacity-60" : "bg-rose-50/50 border-rose-100/50",
                          isSelected ? "ring-2 ring-blue-500 ring-offset-1 z-10 bg-white" : ""
                        )}
                        onClick={() => handleDayClickInternal(day.date, agg.dominant)}
                      >
                        <span className={cn(
                          "text-xs font-semibold pt-1",
                          isToday ? "text-blue-600 font-bold" : "text-slate-600"
                        )}>
                          {day.dayOfMonth}
                        </span>

                        <div className="flex gap-1.5 items-center pb-2">
                          {/* Available (Green) */}
                          <div className="flex items-center gap-0.5">
                            <div className={cn("h-1 w-1 rounded-full shadow-sm", agg.available > 0 ? "bg-[#22c55e]" : "bg-slate-200")} />
                            <div className={cn("h-1 w-3 rounded-full shadow-sm", agg.available > 0 ? "bg-[#22c55e]" : "bg-slate-100")} />
                          </div>
                          {/* Partial (Yellow) */}
                          <div className="flex items-center gap-0.5">
                            <div className={cn("h-1 w-1 rounded-full shadow-sm", agg.partial > 0 ? "bg-[#eab308]" : "bg-slate-200")} />
                            <div className={cn("h-1 w-3 rounded-full shadow-sm", agg.partial > 0 ? "bg-[#eab308]" : "bg-slate-100")} />
                          </div>
                          {/* Allocated (Red) */}
                          <div className="flex items-center gap-0.5">
                            <div className={cn("h-1 w-1 rounded-full shadow-sm", agg.allocated > 0 ? "bg-[#ef4444]" : "bg-slate-200")} />
                            <div className={cn("h-1 w-3 rounded-full shadow-sm", agg.allocated > 0 ? "bg-[#ef4444]" : "bg-slate-100")} />
                          </div>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-semibold mb-1">{day.date}</p>
                      <p className="text-status-available">Available: {agg.available}</p>
                      <p className="text-status-partial">Partial: {agg.partial}</p>
                      <p className="text-status-allocated">Allocated: {agg.allocated}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              // Individual view
              const resData = day.resources.find((r) => r.resourceId === internalSelectedResource)
              const status = resData?.status || "available"
              const allocation = resData?.allocation || 0

              return (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "aspect-square rounded-2xl border p-1.5 flex flex-col items-center justify-between transition-all hover:shadow-md",
                        isWeekend ? "bg-slate-50/50 border-slate-100 opacity-60" : "bg-rose-50/50 border-rose-100/50",
                        isSelected ? "ring-2 ring-blue-500 ring-offset-1 z-10 bg-white" : ""
                      )}
                      onClick={() => handleDayClickInternal(day.date, status)}
                    >
                      <span className={cn(
                        "text-xs font-semibold pt-1",
                        isToday ? "text-blue-600 font-bold" : "text-slate-600"
                      )}>
                        {day.dayOfMonth}
                      </span>
                      <span className="text-[10px] tabular-nums font-bold text-slate-500 pb-2">
                        {allocation}%
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-semibold mb-1">{day.date}</p>
                    <p>Allocation: {allocation}%</p>
                    <p>Project: {resData?.project || "-"}</p>
                    <p>Role: {resData?.role || "-"}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}
