import { useState, useMemo, useCallback } from "react"
import { RESOURCES, getKPIData } from "../services/availabilityService"

export const defaultFilters = {
  role: "All Roles",
  location: "All Locations",
  experienceRange: [0, 15],
  allocationRange: [0, 100],
  project: "All Projects",
  employmentType: "All Types",
}

export function useAvailability() {
  const [filters, setFilters] = useState(defaultFilters)
  const [statusFilter, setStatusFilter] = useState(null)
  const [filterPanelCollapsed, setFilterPanelCollapsed] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [activeView, setActiveView] = useState("calendar")

  // Stage 1: Filter by sidebar criteria (Role, Location, etc.)
  const sidebarFilteredResources = useMemo(() => {
    return RESOURCES.filter((r) => {
      if (filters.role !== "All Roles" && r.role !== filters.role) return false
      if (filters.location !== "All Locations" && r.location !== filters.location) return false
      if (r.experience < filters.experienceRange[0] || r.experience > filters.experienceRange[1]) return false
      if (r.currentAllocation < filters.allocationRange[0] || r.currentAllocation > filters.allocationRange[1]) return false
      if (filters.project !== "All Projects" && r.currentProject !== filters.project) return false
      if (filters.employmentType !== "All Types" && r.employmentType !== filters.employmentType) return false
      return true
    })
  }, [filters])

  // Update KPIs based on Sidebar Filters (so they reflect the current context)
  const kpiData = useMemo(() => getKPIData(sidebarFilteredResources), [sidebarFilteredResources])

  // Stage 2: Apply Status Filter (from KPI clicks)
  const filteredResources = useMemo(() => {
    if (!statusFilter) return sidebarFilteredResources
    return sidebarFilteredResources.filter((r) => r.status === statusFilter)
  }, [sidebarFilteredResources, statusFilter])

  const handleResourceClick = useCallback((resource) => {
    setSelectedResource(resource)
    setDetailOpen(true)
  }, [])

  const handleDayClick = useCallback((_date, status) => {
    setStatusFilter((prev) => (prev === status ? null : status))
  }, [])

  const handleKPIFilterClick = useCallback((status) => {
    setStatusFilter(status)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
    setStatusFilter(null)
  }, [])

  return {
    filters,
    setFilters,
    resetFilters,
    statusFilter,
    setStatusFilter,
    filterPanelCollapsed,
    setFilterPanelCollapsed,
    toggleFilterPanel: () => setFilterPanelCollapsed((prev) => !prev),
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
  }
}
