"use client";

import React from "react";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "test-design", label: "Test Design" },
  { key: "execution", label: "Execution" },
  { key: "reports", label: "Reports" },
];

export default function TopTabs({ selectedTab, onTabChange }) {
  return (
    <div className="flex border-b border-slate-300 space-x-6">
      {tabs.map((tab) => {
        const isActive = selectedTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={
              "py-2 text-sm font-medium transition-all " +
              (isActive
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700")
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
