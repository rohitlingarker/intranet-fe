"use client";

import { useLocation, useNavigate } from "react-router-dom";

type NavItem = {
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { label: "HR View", path: "/employee-onboarding" },
  { label: "Admin View", path: "/employee-onboarding/admin/approval-dashboard" },
  { label: "Create Offer", path: "/employee-onboarding/create" },
  { label: "Bulk Upload", path: "/employee-onboarding/bulk-upload" },
  { label: "HR Configuration", path: "/employee-onboarding/hr-configuration" },
];

export default function OnboardingNavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="border-b border-gray-200 mt-4">
      <div className="flex gap-10 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              className="relative cursor-pointer py-3 text-sm font-medium"
            >
              <span
                className={
                  isActive
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }
              >
                {item.label}
              </span>

              {/* Triangle Indicator (same as Attendance/Leave UI) */}
              {isActive && (
                <span
                  className="absolute left-1/2 -bottom-1 h-0 w-0 
                  -translate-x-1/2 
                  border-l-8 border-r-8 border-t-8
                  border-l-transparent border-r-transparent border-t-green-500"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
