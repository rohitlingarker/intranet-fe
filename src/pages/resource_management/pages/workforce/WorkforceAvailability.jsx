import { useState, useMemo, useCallback } from "react"
import { DashboardHeader } from "../../components/DashboardHeader"
import { KPIBar } from "../../components/AvailabilityKPIs"
import { FilterPanel } from "../../components/filters/AvailabilityFilters"
import { AvailabilityCalendar } from "../../components/AvailabilityCalendar"
import { AvailabilityTimeline } from "../../components/AvailabilityTimeline"
import { ResourceTable } from "../../components/ResourceTable"
import { ResourceDetailPanel } from "../../components/ResourceDetailPanel"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Table2, GanttChart } from "lucide-react"
import { RESOURCES, getKPIData } from "../../services/availabilityService"

import { useAvailability } from "../../hooks/useAvailability"

export default function WorkforceAvailability() {
  const {
    filters,
    setFilters,
    resetFilters,
    statusFilter,
    setStatusFilter,
    filterPanelCollapsed,
    setFilterPanelCollapsed,
    selectedResource,
    detailOpen,
    setDetailOpen,
    activeView,
    setActiveView,
    kpiData,
    filteredResources,
    handleResourceClick,
    handleDayClick,
    handleKPIFilterClick,
  } = useAvailability()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="p-6">
        {/* KPI Summary Bar */}
        <div className="mb-6">
          <KPIBar
            data={kpiData}
            activeFilter={statusFilter}
            onFilterClick={handleKPIFilterClick}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex gap-6 items-start">
          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
            collapsed={filterPanelCollapsed}
            onToggleCollapse={() => setFilterPanelCollapsed(!filterPanelCollapsed)}
          />

          {/* Primary Content */}
          <div className="flex-1 min-w-0 bg-card rounded-lg border shadow-sm">
            <Tabs value={activeView} onValueChange={setActiveView} className="h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-semibold text-card-foreground">Timeline</h3>
                    <span className="text-xs text-muted-foreground">{filteredResources.length} resources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TabsList className="h-8 bg-muted/50">
                      <TabsTrigger value="calendar" className="text-xs h-6 px-2">Calendar</TabsTrigger>
                      <TabsTrigger value="timeline" className="text-xs h-6 px-2">Timeline</TabsTrigger>
                      <TabsTrigger value="table" className="text-xs h-6 px-2">Table</TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {statusFilter && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-t mt-4 -mx-4 mb-[-16px]">
                    <span className="text-xs text-muted-foreground">Filtering by:</span>
                    <Badge variant="secondary" className="text-xs font-normal gap-1 pr-1">
                      {statusFilter}
                      <button
                        onClick={() => setStatusFilter(null)}
                        className="hover:bg-muted rounded-full p-0.5"
                      >
                        <span className="sr-only">Remove</span>
                        <span className="text-muted-foreground">×</span>
                      </button>
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-4">
                <TabsContent value="calendar" className="mt-0">
                  <div className="flex flex-col gap-5">
                    <AvailabilityCalendar
                      filteredResources={filteredResources}
                      onDayClick={handleDayClick}
                    />
                    <ResourceTable
                      resources={filteredResources}
                      onResourceClick={handleResourceClick}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-0">
                  <div className="flex flex-col gap-5">
                    <AvailabilityTimeline
                      filteredResources={filteredResources}
                      onResourceClick={handleResourceClick}
                    />
                    <ResourceTable
                      resources={filteredResources}
                      onResourceClick={handleResourceClick}
                    />
                  </div>
                </TabsContent>
 
                <TabsContent value="table" className="mt-0">
                  <ResourceTable
                    resources={filteredResources}
                    onResourceClick={handleResourceClick}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Resource Detail Side Panel */}
      <ResourceDetailPanel
        resource={selectedResource}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
