"use client";

import { NavLink, useParams } from "react-router-dom";
import { LayoutGrid, FileText, PenTool, Play, BarChart3 } from "lucide-react";

export default function TopTabs({ selectedTab }) {
  const { projectId } = useParams();
   console.log("Project ID in TopTabs:", projectId);
  // ⭐ Default to overview
  const activeTab = selectedTab || "test-management/overview";

  const tabs = [
    {
      name: "Overview",
      path: `/projects/${projectId}?tab=test-management/overview`,
      tab: "test-management/overview",
      icon: <LayoutGrid size={16} />,
    },
    {
      name: "Test Plans",
      path: `/projects/${projectId}?tab=test-management/test-plans`,
      tab: "test-management/test-plans",
      icon: <FileText size={16} />,
    },
    {
      name: "Test Design",
      path: `/projects/${projectId}?tab=test-management/test-design`,
      tab: "test-management/test-design",
      icon: <PenTool size={16} />,
    },
    {
      name: "Test Execution",
      path: `/projects/${projectId}?tab=test-management/test-execution`,
      tab: "test-management/test-execution",
      icon: <Play size={16} />,
    },
    // {
    //   name: "Reports",
    //   path: `/projects/${projectId}?tab=test-management/reports`,
    //   tab: "test-management/reports",
    //   icon: <BarChart3 size={16} />,
    // },
  ];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="flex gap-6 px-6 py-3">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.path}
            end
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${
                activeTab === tab.tab
                  ? "bg-[#0A1128] text-white shadow-md"
                  : "text-gray-600 hover:text-[#0A1128]"
              }
            `}
          >
            {tab.icon}
            {tab.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
