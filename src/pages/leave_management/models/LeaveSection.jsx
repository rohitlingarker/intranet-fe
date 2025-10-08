import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeaveDashboard from "../charts/LeaveDashboard";
import ProjectMembersOnLeave from "./ProjectMembersOnLeave";

export default function LeaveSection({ employeeId, leaveId }) {
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" or "projectMembers"

  return (
    <div className="w-full">
      {/* Tab container */}
      <div className="flex space-x-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("dashboard")}
          // ✨ CHANGE: Added 'relative' positioning
          className="relative pb-2 font-medium transition-colors focus:outline-none"
        >
          {/* Change text color based on active state */}
          <span
            className={
              activeTab === "dashboard"
                ? "text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }
          >
            Leave Balance
          </span>

          {/* ✨ CHANGE: Conditional underline with layoutId */}
          {activeTab === "dashboard" && (
            <motion.div
              className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-indigo-600"
              layoutId="underline"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("projectMembers")}
          // ✨ CHANGE: Added 'relative' positioning
          className="relative pb-2 font-medium transition-colors focus:outline-none"
        >
          {/* Change text color based on active state */}
          <span
            className={
              activeTab === "projectMembers"
                ? "text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }
          >
            Team Members on Leave
          </span>
          
          {/* ✨ CHANGE: Conditional underline with layoutId */}
          {activeTab === "projectMembers" && (
            <motion.div
              className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-indigo-600"
              layoutId="underline"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
        </button>
      </div>

      {/* Animated content (no changes here) */}
      <div className="mt-4 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute w-full"
            >
              <LeaveDashboard employeeId={employeeId} />
            </motion.div>
          )}

          {activeTab === "projectMembers" && (
            <motion.div
              key="projectMembers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute w-full"
            >
              <ProjectMembersOnLeave employeeId={employeeId} leaveId={leaveId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}