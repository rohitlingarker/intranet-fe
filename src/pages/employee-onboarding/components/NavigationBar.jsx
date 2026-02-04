"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export default function OnboardingNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const permissions = user?.permissions || [];
  const canViewAdminView = permissions.includes("VIEW_ADMIN_PAGE");

  const navItems = [
    { label: "HR View", path: "/employee-onboarding" },

    ...(canViewAdminView
      ? [
          {
            label: "Admin View",
            path: "/employee-onboarding/admin/approval-dashboard",
          },
        ]
      : []),

    { label: "Create Offer", path: "/employee-onboarding/create" },
    { label: "Bulk Upload", path: "/employee-onboarding/bulk-upload" },
    {
      label: "HR Configuration",
      path: "/employee-onboarding/hr-configuration",
    },
    { label: "HR Verification", path: "/employee-onboarding/hr" },
  ];

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

              {/* Active triangle indicator */}
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