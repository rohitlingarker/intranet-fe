import {
  CATEGORY_OPTIONS,
  DEMAND_PROFILES,
  EXCLUDE_SHADOW_FROM_BENCH,
} from "../constants/benchConstants";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const calculateAgingDays = (lastAllocationDate) => {
  const date = toDate(lastAllocationDate);
  if (!date) return 0;
  const diff = Math.floor((Date.now() - date.getTime()) / DAY_IN_MS);
  return diff > 0 ? diff : 0;
};

export const getAgingTone = (agingDays) => {
  if (agingDays <= 15) {
    return {
      label: `${agingDays} days`,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }
  if (agingDays <= 30) {
    return {
      label: `${agingDays} days`,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  return {
    label: `${agingDays} days`,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  };
};

export const isSkillStale = (lastUsed) => {
  const date = toDate(lastUsed);
  if (!date) return false;
  return calculateAgingDays(lastUsed) > 365;
};

export const buildSkillSummary = (resource) => {
  if (!Array.isArray(resource.skills) || resource.skills.length === 0) return [];

  return resource.skills.slice(0, 3).map((skill) => ({
    name: skill,
    proficiency: resource.proficiency?.[skill] || "Beginner",
    stale: isSkillStale(resource.skillLastUsed?.[skill]),
  }));
};

export const deriveCategory = (resource) => {
  const availability = Number(resource.availability || 0);
  const skillCount = Array.isArray(resource.skills) ? resource.skills.length : 0;
  const staleSkillCount = Array.isArray(resource.skills)
    ? resource.skills.filter((skill) => isSkillStale(resource.skillLastUsed?.[skill])).length
    : 0;
  const relevance = Number(resource.skillRelevance || 0);

  if (availability <= 20) return "Not Available";
  if (relevance >= 70 && skillCount >= 2 && staleSkillCount < skillCount) return "Ready";
  if (relevance >= 45 && availability >= 45) return "Shadow";
  if (skillCount === 0 || staleSkillCount === skillCount) return "Training";
  return "Training";
};

export const isBenchEligible = (resource) => {
  if (Number(resource.allocation || 0) !== 0) return false;
  if (String(resource.status || "").toLowerCase() === "inactive") return false;
  if (resource.noticePeriod) return false;
  if (EXCLUDE_SHADOW_FROM_BENCH && resource.shadow) return false;
  if (resource.poolType) return false;
  return true;
};

export const isPoolResource = (resource) => {
  if (!resource.poolType) return false;
  if (String(resource.status || "").toLowerCase() === "inactive") return false;
  return Number(resource.allocation || 0) === 0;
};

export const normalizeBenchResource = (resource) => {
  const agingDays = calculateAgingDays(resource.lastAllocationDate);
  const category = CATEGORY_OPTIONS.includes(resource.category)
    ? resource.category
    : deriveCategory(resource);
  const topSkills = buildSkillSummary(resource);
  const costPerDay = Number.isFinite(Number(resource.costPerDay))
    ? Number(resource.costPerDay)
    : null;

  return {
    ...resource,
    category,
    agingDays,
    topSkills,
    missingSkills: Array.isArray(resource.missingSkills) ? resource.missingSkills : [],
    warnings: {
      missingSkills: topSkills.length === 0,
      missingCost: costPerDay === null,
      longAging: agingDays > 30,
      highCost: costPerDay !== null && costPerDay > 3000,
    },
    costPerDay,
    costExposure: costPerDay !== null ? costPerDay * agingDays : null,
  };
};

export const sanitizeResources = (resources) => {
  const seen = new Set();
  return resources.reduce((acc, item) => {
    if (!item?.id || seen.has(item.id)) return acc;
    seen.add(item.id);
    acc.push(normalizeBenchResource(item));
    return acc;
  }, []);
};

export const filterResources = (resources, search, filters, activeTab) => {
  const query = String(search || "").trim().toLowerCase();
  return resources.filter((resource) => {
    const visible = activeTab === "bench" ? isBenchEligible(resource) : isPoolResource(resource);
    if (!visible) return false;

    const searchTarget = [resource.name, resource.role, resource.location, ...(resource.skills || [])]
      .join(" ")
      .toLowerCase();
    if (query && !searchTarget.includes(query)) return false;
    if (filters.category && resource.category !== filters.category) return false;
    if (filters.location && resource.location !== filters.location) return false;

    if (filters.availability) {
      const availability = Number(resource.availability || 0);
      if (filters.availability === "0-25" && !(availability <= 25)) return false;
      if (filters.availability === "26-50" && !(availability >= 26 && availability <= 50)) return false;
      if (filters.availability === "51-75" && !(availability >= 51 && availability <= 75)) return false;
      if (filters.availability === "76-100" && !(availability >= 76)) return false;
    }

    if (filters.experience) {
      const experience = Number(resource.experience || 0);
      if (filters.experience === "0-3" && !(experience <= 3)) return false;
      if (filters.experience === "4-7" && !(experience >= 4 && experience <= 7)) return false;
      if (filters.experience === "8-12" && !(experience >= 8 && experience <= 12)) return false;
      if (filters.experience === "13+" && !(experience >= 13)) return false;
    }

    if (filters.aging) {
      const agingDays = Number(resource.agingDays || 0);
      if (filters.aging === "0-15" && !(agingDays <= 15)) return false;
      if (filters.aging === "16-30" && !(agingDays >= 16 && agingDays <= 30)) return false;
      if (filters.aging === "31+" && !(agingDays >= 31)) return false;
    }

    if (filters.cost) {
      const cost = Number(resource.costPerDay || 0);
      if (filters.cost === "0-1500" && !(cost <= 1500)) return false;
      if (filters.cost === "1501-3000" && !(cost >= 1501 && cost <= 3000)) return false;
      if (filters.cost === "3001+" && !(cost >= 3001)) return false;
    }

    return true;
  });
};

export const getUniqueValues = (resources, key) =>
  Array.from(new Set(resources.map((item) => item[key]).filter(Boolean))).sort();

export const updateCategory = (resource, nextCategory) =>
  CATEGORY_OPTIONS.includes(nextCategory) ? { ...resource, category: nextCategory } : resource;

export const computeDemandMatches = (resource) => {
  const skillSet = new Set((resource.skills || []).map((skill) => skill.toLowerCase()));
  return DEMAND_PROFILES.map((demand) => {
    const overlap = demand.requiredSkills.filter((skill) => skillSet.has(skill.toLowerCase()));
    return {
      ...demand,
      overlap,
      score: Math.round((overlap.length / demand.requiredSkills.length) * 100),
    };
  }).sort((left, right) => right.score - left.score);
};

export const toCsv = (resources) => {
  const header = [
    "Resource",
    "Role",
    "Category",
    "Availability",
    "AgingDays",
    "CostPerDay",
    "CostExposure",
    "Location",
    "Experience",
    "PoolType",
    "Skills",
  ];
  const rows = resources.map((resource) => [
    resource.name,
    resource.role,
    resource.category,
    resource.availability,
    resource.agingDays,
    resource.costPerDay ?? "Cost unavailable",
    resource.costExposure ?? "Cost unavailable",
    resource.location,
    resource.experience,
    resource.poolType || "",
    (resource.skills || []).join(" | "),
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
};

export const getBenchMetrics = (resources) => {
  const bench = resources.filter(isBenchEligible);
  const pool = resources.filter(isPoolResource);
  const highRisk = bench.filter((item) => item.warnings.highCost || item.warnings.longAging);
  const ready = bench.filter((item) => item.category === "Ready");

  return [
    {
      label: "Bench Resources",
      value: bench.length,
      helper: "Auto-detected from zero allocation",
      iconClassName: "border-blue-100 bg-blue-50 text-blue-700",
    },
    {
      label: "Ready Now",
      value: ready.length,
      helper: "High relevance and immediate availability",
      iconClassName: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
    {
      label: "Internal Pool",
      value: pool.length,
      helper: "Excluded from available bench supply",
      iconClassName: "border-indigo-100 bg-indigo-50 text-indigo-700",
    },
    {
      label: "Cost / Risk Watch",
      value: highRisk.length,
      helper: "High daily cost or aging above 30 days",
      iconClassName: "border-rose-100 bg-rose-50 text-rose-700",
    },
  ];
};
