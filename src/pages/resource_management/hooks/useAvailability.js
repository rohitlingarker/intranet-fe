import { useState, useMemo, useCallback, useEffect } from "react"
import { RESOURCES, getKPIData, computeStatus } from "../services/availabilityService"
import { getAvailabilityTimeline } from "../services/workforceService"

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

  // Date State for Calendar
  const [currentDate, setCurrentDate] = useState(new Date());

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filteredResources, setFilteredResources] = useState([]);

  // Mock KPI data for now or fetch from API if available (simulating existing behavior)
  const kpiData = useMemo(() => getKPIData(RESOURCES), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Calculate date range for the selected month
      // We want to fetch data for the entire month currently in view
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const payload = {
        page: page - 1, // API uses 0-indexed pages
        size: 20,
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
      };

      // Merge status filter into filters for the API if needed, or handle separately
      const currentFilters = { ...filters, status: statusFilter };

      const response = await getAvailabilityTimeline(currentFilters, payload);

      if (response && response.data) {
        const mappedData = response.data.map(r => ({
          ...r,
          id: r.resourceId,
          status: computeStatus(r.currentAllocation || 0),
          currentProject: Array.isArray(r.currentProject) ? r.currentProject.join(", ") : r.currentProject,
        }));
        setFilteredResources(mappedData);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }
    } catch (error) {
      console.error("Failed to fetch timeline data", error);
    } finally {
      setLoading(false);
    }
  }, [filters, statusFilter, page, currentDate]);

  // Effect to fetch data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // We need to use useEffect directly, but I can't easily change the imports at the top with this tool if I only replace the body.
  // I will use a separate tool call to fix imports first or do a full file replacement.
  // Let's assume I can't change top imports easily in this chunk.
  // Wait, I can just use `useEffect` from the existing import on line 1?
  // Line 1: import { useState, useMemo, useCallback } from "react"
  // I need to add `useEffect` to the imports.

  const handleResourceClick = useCallback((resource) => {
    setSelectedResource(resource)
    setDetailOpen(true)
  }, [])

  const handleDayClick = useCallback((_date, status) => {
    setStatusFilter((prev) => (prev === status ? null : status))
    setPage(1); // Reset to first page on filter change
  }, [])

  const handleKPIFilterClick = useCallback((status) => {
    setStatusFilter(status)
    setPage(1);
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
    setStatusFilter(null)
    setPage(1);
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
    // Pagination exports
    page,
    setPage,
    totalPages,
    totalElements,
    loading,
    currentDate,
    setCurrentDate
  }
}
