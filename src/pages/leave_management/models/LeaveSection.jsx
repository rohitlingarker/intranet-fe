import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeaveDashboard from "../charts/LeaveDashboard";
import ProjectMembersOnLeaveDemo from "./ProjectMembersOnLeaveDemo";
import ProjectMembersOnLeave from "./ProjectMembersOnLeave";

export default function LeaveSection({ employeeId, leaveId }) {
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" or "projectMembers"
  console.log("Employee ID in LeaveSection:", employeeId);
    console.log("Leave ID in LeaveSection:", leaveId);

  return (
    <div className="w-full">
      {/* Toggle tabs with sliding underline */}
      <div className="relative flex space-x-6 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`pb-2 font-medium transition-colors ${
            activeTab === "dashboard"
              ? "text-indigo-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Leave Balance
        </button>
        <button
          onClick={() => setActiveTab("projectMembers")}
          className={`pb-2 font-medium transition-colors ${
            activeTab === "projectMembers"
              ? "text-indigo-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Team Members on Leave
        </button>

        {/* Sliding underline */}
        <motion.div
          layoutId="underline"
          className="absolute bottom-0 h-[2px] bg-indigo-600 rounded-full"
          initial={false}
          animate={{
            left: activeTab === "dashboard" ? "0%" : "calc(50% + 0.75rem)",
            width: activeTab === "dashboard" ? "120px" : "190px", // Adjust to match button widths
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </div>

      {/* Animated content */}
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
              {/* <ProjectMembersOnLeaveDemo employeeId={employeeId} /> */}
                <ProjectMembersOnLeave employeeId={employeeId} leaveId={leaveId} />
                {/* <ProjectMembersOnLeaveDemo /> */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
