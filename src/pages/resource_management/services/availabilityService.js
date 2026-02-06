import { RESOURCES, computeStatus } from "../models/availabilityModel"

export { RESOURCES }

export function getKPIData(resources = RESOURCES) {
  const total = resources.length
  const fullyAvailable = resources.filter((r) => r.status === "available").length
  const partiallyAvailable = resources.filter((r) => r.status === "partial").length
  const fullyAllocated = resources.filter((r) => r.status === "allocated").length
  const overAllocated = resources.filter((r) => r.currentAllocation > 100).length

  const upcomingAvailability = resources.filter((r) => {
    const availDate = new Date(r.availableFrom)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return availDate <= thirtyDaysFromNow
  }).length

  const avgUtil = total > 0 ? Math.round(
    resources.reduce((sum, r) => sum + Math.min(r.currentAllocation, 100), 0) / total
  ) : 0

  const benchCapacity = total > 0 ? Math.round((fullyAvailable / total) * 100) : 0

  return {
    totalResources: total,
    fullyAvailable,
    partiallyAvailable,
    fullyAllocated,
    upcomingAvailability,
    utilization: avgUtil,
    benchCapacity,
    overAllocated,
  }
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function generateCalendarDays(year, month) {
  const days = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()
    const dateStr = date.toISOString().split("T")[0]

    const resourceAllocations = RESOURCES.map((r) => {
      // Compute real allocation from timeline blocks for this date
      let totalAlloc = 0
      let activeProject = r.currentProject
      for (const block of r.allocationTimeline) {
        if (dateStr >= block.startDate && dateStr <= block.endDate && !block.tentative) {
          totalAlloc += block.allocation
          activeProject = block.project
        }
      }
      // Fall back to currentAllocation if no active blocks found
      if (totalAlloc === 0) {
        const seed = r.id.charCodeAt(4) * 31 + day * 7 + month * 13
        totalAlloc = Math.min(
          100,
          Math.max(0, r.currentAllocation + Math.floor(seededRandom(seed) * 20) - 10)
        )
      }

      const status = computeStatus(Math.min(totalAlloc, 100))
      return {
        resourceId: r.id,
        allocation: totalAlloc,
        project: activeProject,
        role: r.role,
        status,
      }
    })

    days.push({
      date: dateStr,
      dayOfMonth: day,
      dayOfWeek,
      resources: resourceAllocations,
    })
  }

  return days
}
