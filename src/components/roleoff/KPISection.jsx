import React from "react";
import { cn } from "@/lib/utils";

const KPISection = ({ items = [] }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-[#081534]">
                {item.value}
              </p>
              {item.helper ? (
                <p className="mt-1 text-xs text-gray-500">{item.helper}</p>
              ) : null}
            </div>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border",
                item.iconWrapperClassName || "border-gray-200 bg-gray-50 text-gray-700",
              )}
            >
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPISection;
