import React from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  textColor = "text-slate-800",
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className={`mt-2 text-2xl font-bold ${textColor}`}>
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
