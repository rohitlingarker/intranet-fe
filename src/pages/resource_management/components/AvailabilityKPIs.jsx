import { Users, UserCheck, UserMinus, Clock, TrendingUp, AlertTriangle, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"

function KPICard({ label, value, icon, color, active, onClick, suffix }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center gap-3 rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md",
        active ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50",
        onClick && "cursor-pointer"
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", color || "bg-secondary text-secondary-foreground")}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold text-card-foreground tabular-nums tracking-tight">
          {value}{suffix}
        </p>
      </div>
    </button>
  )
}

export function KPIBar({ data, activeFilter, onFilterClick }) {
  return (
    <div className="flex flex-wrap gap-3">
      <KPICard
        label="Total Resources"
        value={data.totalResources || 0}
        icon={<Users className="h-5 w-5" />}
        color="bg-primary/10 text-primary"
        active={activeFilter === null}
        onClick={() => onFilterClick(null)}
      />
      <KPICard
        label="Fully Available"
        value={data.fullyAvailable || 0}
        icon={<UserCheck className="h-5 w-5" />}
        color="bg-status-available/10 text-status-available"
        active={activeFilter === "available"}
        onClick={() => onFilterClick(activeFilter === "available" ? null : "available")}
      />
      <KPICard
        label="Partially Available"
        value={data.partiallyAvailable || 0}
        icon={<UserMinus className="h-5 w-5" />}
        color="bg-status-partial/10 text-status-partial"
        active={activeFilter === "partial"}
        onClick={() => onFilterClick(activeFilter === "partial" ? null : "partial")}
      />
      <KPICard
        label="Fully Allocated"
        value={data.fullyAllocated || 0}
        icon={<Users className="h-5 w-5" />}
        color="bg-status-allocated/10 text-status-allocated"
        active={activeFilter === "allocated"}
        onClick={() => onFilterClick(activeFilter === "allocated" ? null : "allocated")}
      />
      <KPICard
        label="Available (30d)"
        value={data.upcomingAvailability || 0}
        icon={<Clock className="h-5 w-5" />}
        color="bg-primary/10 text-primary"
      />
      <KPICard
        label="Bench Capacity"
        value={data.benchCapacity || 0}
        suffix="%"
        icon={<Gauge className="h-5 w-5" />}
        color="bg-primary/10 text-primary"
      />
      <KPICard
        label="Over-allocated"
        value={data.overAllocated || 0}
        icon={<AlertTriangle className="h-5 w-5" />}
        color="bg-destructive/10 text-destructive"
      />
      <KPICard
        label="Utilization"
        value={data.utilization || 0}
        suffix="%"
        icon={<TrendingUp className="h-5 w-5" />}
        color="bg-primary/10 text-primary"
      />
    </div>
  )
}
