// src/resource_management/hooks/useAvailability.js
import { useState, useEffect, useMemo } from 'react';
import { fetchResourceData } from '../services/availabilityService';

export const useAvailability = () => {
  const [rawData, setRawData] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
    role: "All Roles",
    location: "All Locations",
    experience: 0, // Min experience
    allocationMax: 100, // Max allocation filter
    project: "All Projects",
    type: "All Types"
  });

  // Load Data
  useEffect(() => {
    const data = fetchResourceData();
    setRawData(data);
  }, []);

  // Compute Filtered Data
  const filteredResources = useMemo(() => {
    return rawData.filter(resource => {
      // Role Filter
      if (filters.role !== "All Roles" && resource.role !== filters.role) return false;
      
      // Location Filter
      if (filters.location !== "All Locations" && resource.location !== filters.location) return false;
      
      // Experience Filter (Simple greater than check)
      if (resource.experience < filters.experience) return false;

      // Calculate Total Current Allocation
      const totalAllocation = resource.allocations.reduce((sum, alloc) => {
        // Only count allocations active TODAY
        const now = new Date();
        const start = new Date(alloc.start);
        const end = new Date(alloc.end);
        return (start <= now && end >= now) ? sum + alloc.percentage : sum;
      }, 0);

      // Allocation Slider Filter (Show resources having <= this allocation)
      // This logic can vary based on requirement. Assuming "Up to X% allocated"
      // or we can interpret as "At least X%". Let's assume standard "Max Allocation" slider.
      // If slider is at 80%, we show people with 0-80% allocation.
      if (totalAllocation > filters.allocationMax) return false;

      // Project Filter
      if (filters.project !== "All Projects") {
        const hasProject = resource.allocations.some(a => a.project === filters.project);
        if (!hasProject) return false;
      }

      return true;
    });
  }, [rawData, filters]);

  // Compute KPIs based on FILTERED data
  const kpis = useMemo(() => {
    const total = filteredResources.length;
    let fullyAvailable = 0;
    let partiallyAvailable = 0;
    let fullyAllocated = 0;
    let overAllocated = 0;

    filteredResources.forEach(r => {
      const currentAlloc = r.allocations.reduce((sum, a) => {
         const now = new Date();
         const start = new Date(a.start);
         const end = new Date(a.end);
         return (start <= now && end >= now) ? sum + a.percentage : sum;
      }, 0);

      if (currentAlloc === 0) fullyAvailable++;
      else if (currentAlloc < 100) partiallyAvailable++;
      else if (currentAlloc === 100) fullyAllocated++;
      else overAllocated++;
    });

    return {
      total,
      fullyAvailable,
      partiallyAvailable,
      fullyAllocated,
      overAllocated,
      available30d: Math.floor(total * 0.6), // Mock logic for 30d forecast
      benchCapacity: total > 0 ? Math.round((fullyAvailable / total) * 100) + "%" : "0%",
      utilization: total > 0 ? Math.round(((fullyAllocated + partiallyAvailable) / total) * 100) + "%" : "0%"
    };
  }, [filteredResources]);

  // Handlers
  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setSelectedResource(null);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    resources: filteredResources,
    kpis,
    filters,
    updateFilter,
    selectedResource,
    isPanelOpen,
    handleResourceClick,
    closePanel
  };
};