
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

export function AvailabilityCalendar({ filteredResources, onDayClick }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [viewMode, setViewMode] = useState("aggregate")
  const [selectedResource, setSelectedResource] = useState(
    filteredResources[0]?.id || ""
  )

  const calendarDays = useMemo(() => generateCalendarDays(year, month), [year, month])
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-semibold text-card-foreground min-w-[140px] text-center">
            {MONTH_NAMES[month]} {year}
          </h2>
          <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v)}>
            <TabsList className="h-8">
              <TabsTrigger value="aggregate" className="text-xs h-7 gap-1.5 px-2.5">
                <Layers className="h-3.5 w-3.5" />
                Team
              </TabsTrigger>
              <TabsTrigger value="individual" className="text-xs h-7 gap-1.5 px-2.5">
                <User className="h-3.5 w-3.5" />
                Individual
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {viewMode === "individual" && (
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="h-8 w-[180px] text-xs">
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

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-status-available" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-status-partial" />
              Partial
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-status-allocated" />
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

              if (viewMode === "aggregate") {
                const agg = getAggregateStatus(day, filteredIds)
                const total = agg.available + agg.partial + agg.allocated

                return (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "aspect-square rounded-md border p-1 flex flex-col items-center justify-center gap-0.5 transition-all hover:shadow-sm",
                          isWeekend && "opacity-50",
                          isToday && "ring-2 ring-primary ring-offset-1",
                          getStatusColorLight(agg.dominant)
                        )}
                        onClick={() => onDayClick(day.date, agg.dominant)}
                      >
                        <span className={cn(
                          "text-xs font-medium",
                          isToday ? "text-primary font-bold" : "text-card-foreground"
                        )}>
                          {day.dayOfMonth}
                        </span>
                        {total > 0 && (
                          <div className="flex gap-px">
                            {agg.available > 0 && (
                              <div className="h-1 rounded-full bg-status-available" style={{ width: `${Math.max(4, (agg.available / total) * 20)}px` }} />
                            )}
                            {agg.partial > 0 && (
                              <div className="h-1 rounded-full bg-status-partial" style={{ width: `${Math.max(4, (agg.partial / total) * 20)}px` }} />
                            )}
                            {agg.allocated > 0 && (
                              <div className="h-1 rounded-full bg-status-allocated" style={{ width: `${Math.max(4, (agg.allocated / total) * 20)}px` }} />
                            )}
                          </div>
                        )}
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
              const resData = day.resources.find((r) => r.resourceId === selectedResource)
              const status = resData?.status || "available"
              const allocation = resData?.allocation || 0

              return (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "aspect-square rounded-md border p-1 flex flex-col items-center justify-center gap-0.5 transition-all hover:shadow-sm",
                        isWeekend && "opacity-50",
                        isToday && "ring-2 ring-primary ring-offset-1",
                        getStatusColorLight(status)
                      )}
                      onClick={() => onDayClick(day.date, status)}
                    >
                      <span className={cn(
                        "text-xs font-medium",
                        isToday ? "text-primary font-bold" : "text-card-foreground"
                      )}>
                        {day.dayOfMonth}
                      </span>
                      <span className="text-[10px] tabular-nums font-medium text-muted-foreground">
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
