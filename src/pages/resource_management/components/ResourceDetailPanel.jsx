import { MapPin, Briefcase, Calendar, Star, ArrowRight, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

function StatusDot({ status }) {
  const colors = {
    available: "bg-status-available",
    partial: "bg-status-partial",
    allocated: "bg-status-allocated",
  }
  return <span className={cn("h-2 w-2 rounded-full", colors[status])} />
}

function TimelineBar({ resource }) {
  const blocks = resource.allocationTimeline
  if (blocks.length === 0) return null

  const earliest = new Date(blocks[0].startDate).getTime()
  const latest = Math.max(...blocks.map((b) => new Date(b.endDate).getTime()))
  const totalSpan = latest - earliest || 1
  const today = Date.now()

  return (
    <div className="relative">
      <div className="relative h-8 rounded bg-muted overflow-hidden">
        {blocks.map((block, i) => {
          const start = new Date(block.startDate).getTime()
          const end = new Date(block.endDate).getTime()
          const leftPct = ((start - earliest) / totalSpan) * 100
          const widthPct = ((end - start) / totalSpan) * 100

          let color = "bg-status-available/60"
          if (block.allocation > 100) color = "bg-destructive/60"
          else if (block.allocation > 70) color = "bg-status-allocated/60"
          else if (block.allocation > 20) color = "bg-status-partial/60"

          return (
            <div
              key={`${block.project}-${i}`}
              className={cn(
                "absolute top-0 h-full rounded-sm",
                block.tentative ? "bg-muted-foreground/20 border border-dashed border-muted-foreground/40" : color
              )}
              style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%` }}
              title={`${block.project}: ${block.allocation}%${block.tentative ? " (Tentative)" : ""} (${block.startDate} - ${block.endDate})`}
            />
          )
        })}
        {today >= earliest && today <= latest && (
          <div
            className="absolute top-0 h-full w-px bg-primary z-10"
            style={{ left: `${((today - earliest) / totalSpan) * 100}%` }}
          />
        )}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">{blocks[0].startDate}</span>
        <span className="text-[10px] text-muted-foreground font-medium text-primary">Today</span>
        <span className="text-[10px] text-muted-foreground">{blocks[blocks.length - 1].endDate}</span>
      </div>
    </div>
  )
}

function UtilizationChart({ data }) {
  const max = Math.max(...data, 100)
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
  const recentMonths = data.slice(-6)
  const recentLabels = months.slice(-6)

  return (
    <div>
      <div className="flex items-end gap-1 h-16">
        {recentMonths.map((val, i) => {
          let color = "bg-status-available"
          if (val > 80) color = "bg-status-allocated"
          else if (val > 50) color = "bg-status-partial"

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full relative flex items-end justify-center" style={{ height: "48px" }}>
                <div
                  className={cn("w-full rounded-t-sm transition-all", color)}
                  style={{ height: `${(val / max) * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1 mt-1">
        {recentLabels.map((label, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillMatch({ skills }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => {
        const matchScore = Math.floor((skill.charCodeAt(0) % 3))
        const colors = [
          "bg-status-available/15 text-status-available border-status-available/30",
          "bg-status-partial/15 text-status-partial border-status-partial/30",
          "bg-secondary text-secondary-foreground border-secondary",
        ]
        return (
          <Badge key={skill} variant="outline" className={cn("text-[10px] font-normal", colors[matchScore])}>
            {skill}
          </Badge>
        )
      })}
    </div>
  )
}

export function ResourceDetailPanel({ resource, open, onOpenChange }) {
  if (!resource) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:max-w-[400px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border">
              <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                {resource.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-base">{resource.name}</SheetTitle>
              <SheetDescription className="text-xs flex items-center gap-1">
                <StatusDot status={resource.status} />
                {resource.role}
              </SheetDescription>
            </div>
            <button
              className="ml-auto h-7 w-7 flex items-center justify-center rounded-md border shadow-sm bg-background hover:bg-muted"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-5 pb-6">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {resource.location}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              {resource.experience} years exp
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Avail: {new Date(resource.availableFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5" />
              {resource.employmentType}
            </div>
          </div>

          {/* Allocation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">Current Allocation</span>
              <span className="text-xs font-bold tabular-nums text-foreground">{resource.currentAllocation}%</span>
            </div>
            <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  resource.currentAllocation > 70 ? "bg-status-allocated" :
                    resource.currentAllocation > 20 ? "bg-status-partial" : "bg-status-available"
                )}
                style={{ width: `${resource.currentAllocation}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">Project: {resource.currentProject}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                Next: {resource.nextAssignment} <ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-3">Allocation Timeline</h4>
            <TimelineBar resource={resource} />
            <div className="mt-2 flex flex-col gap-1">
              {resource.allocationTimeline.map((block, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className={cn("text-muted-foreground", block.tentative && "italic")}>
                    {block.project}{block.tentative ? " (T)" : ""}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{block.allocation}%</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Skill Match */}
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2">Skill Match</h4>
            <SkillMatch skills={resource.skills} />
          </div>

          <Separator />

          {/* Utilization Trend */}
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-3">Utilization Trend (6 months)</h4>
            <UtilizationChart data={resource.utilizationHistory} />
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1 h-9 text-xs">
              Create Demand
            </Button>
            <Button variant="outline" className="flex-1 h-9 text-xs bg-transparent">
              Reserve Resource
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
