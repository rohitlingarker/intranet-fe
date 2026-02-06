import { useState, useRef, useEffect } from "react"
import { Filter, X, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
// import { defaultFilters } from "../../hooks/useAvailability" // Circular dependency risk if imported from hook file which imports service
// Re-defining defaultFilters locally or importing from a safe place is better, but since we export it from here usually...
// ensuring we don't break existing exports.
// checking previous file content, defaultFilters was imported from hooks.
import { defaultFilters } from "../../hooks/useAvailability"

export { defaultFilters }

const ROLES = [
  "All Roles",
  "Senior Frontend Engineer", "Backend Engineer", "DevOps Engineer",
  "Full Stack Developer", "QA Lead", "Data Engineer", "UX Designer",
  "Technical Lead", "Cloud Architect", "Mobile Developer",
  "Product Designer", "ML Engineer", "Security Engineer", "SRE",
  "Staff Engineer", "Platform Engineer",
]

const LOCATIONS = [
  "All Locations",
  "Bangalore", "New York", "London", "Toronto", "Singapore",
  "Berlin", "San Francisco", "Tokyo", "Sydney", "Hyderabad",
]

const PROJECTS = [
  "All Projects",
  "Project Atlas", "Project Beacon", "Project Catalyst",
  "Project Delta", "Project Echo", "Project Forge",
  "Project Genesis", "Project Horizon", "Project Ion",
]

const EMPLOYMENT_TYPES = ["All Types", "Billable", "Bench", "Shadow"]

function hasActiveFilters(filters) {
  return (
    filters.role !== "All Roles" ||
    filters.location !== "All Locations" ||
    filters.experienceRange[0] !== 0 ||
    filters.experienceRange[1] !== 15 ||
    filters.allocationRange[0] !== 0 ||
    filters.allocationRange[1] !== 100 ||
    filters.project !== "All Projects" ||
    filters.employmentType !== "All Types"
  )
}

function SearchableDropdown({ label, value, options, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef(null)

  // Sync search with external value changes
  useEffect(() => {
    setSearch(value)
  }, [value])

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        // Revert search to selected value if closed without selection
        setSearch(value)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [value])

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (option) => {
    onChange(option)
    setSearch(option)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            if (search === placeholder) setSearch("") // Optional clear on focus behavior
          }}
          className="h-8 text-xs pr-8"
          placeholder={placeholder}
        />
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {filteredOptions.length > 0 ? (
            <div className="p-1">
              {filteredOptions.map((option) => (
                <div
                  key={option}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-xs outline-none hover:bg-accent hover:text-accent-foreground",
                    value === option && "bg-accent/50 text-accent-foreground font-medium"
                  )}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                  {value === option && (
                    <Check className="ml-auto h-3 w-3 opacity-100" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2 px-2 text-xs text-muted-foreground text-center">
              No results found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function FilterPanel({ filters, onFiltersChange, onReset, collapsed, onToggleCollapse }) {
  const activeCount = [
    filters.role !== "All Roles",
    filters.location !== "All Locations",
    filters.experienceRange[0] !== 0 || filters.experienceRange[1] !== 15,
    filters.allocationRange[0] !== 0 || filters.allocationRange[1] !== 100,
    filters.project !== "All Projects",
    filters.employmentType !== "All Types",
  ].filter(Boolean).length

  if (collapsed) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleCollapse}
        className="flex items-center gap-2 bg-transparent"
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <Badge className="bg-primary text-primary-foreground text-xs h-5 px-1.5">
            {activeCount}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <div className="w-64 shrink-0 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-card-foreground">Filters</h3>
          {activeCount > 0 && (
            <Badge className="bg-primary text-primary-foreground text-xs h-5 px-1.5">
              {activeCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasActiveFilters(filters) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={onReset}
            >
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleCollapse}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SearchableDropdown
          label="Role / Skill"
          value={filters.role}
          options={ROLES}
          placeholder="All Roles"
          onChange={(value) => onFiltersChange({ ...filters, role: value })}
        />

        <SearchableDropdown
          label="Location"
          value={filters.location}
          options={LOCATIONS}
          placeholder="All Locations"
          onChange={(value) => onFiltersChange({ ...filters, location: value })}
        />

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Experience: {filters.experienceRange[0]}-{filters.experienceRange[1]} yrs
          </label>
          <Slider
            value={filters.experienceRange}
            min={0}
            max={15}
            step={1}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, experienceRange: value })
            }
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Allocation: {filters.allocationRange[0]}-{filters.allocationRange[1]}%
          </label>
          <Slider
            value={filters.allocationRange}
            min={0}
            max={100}
            step={5}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, allocationRange: value })
            }
            className="mt-2"
          />
        </div>

        <SearchableDropdown
          label="Project / Account"
          value={filters.project}
          options={PROJECTS}
          placeholder="All Projects"
          onChange={(value) => onFiltersChange({ ...filters, project: value })}
        />

        <SearchableDropdown
          label="Employment Type"
          value={filters.employmentType}
          options={EMPLOYMENT_TYPES}
          placeholder="All Types"
          onChange={(value) => onFiltersChange({ ...filters, employmentType: value })}
        />
      </div>
    </div>
  )
}
