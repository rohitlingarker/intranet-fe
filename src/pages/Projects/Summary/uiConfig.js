// src/pages/Projects/Summary/uiConfig.js

// Animation variants reused across widgets
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: "easeOut" },
  },
};

export const DASHBOARD_COLORS = [
  "#4f46e5", "#7c3aed", "#0d9488", "#db2777",
  "#ea580c", "#2563eb", "#be185d", "#65a30d",
  "#0891b2", "#c026d3", "#d97706", "#4338ca",
];
