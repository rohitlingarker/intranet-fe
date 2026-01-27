import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientBasicSLA from "./ClientBasicSLA";
import ClientBasicCompliance from "./ClientBasicCompliance";
import ClientEscalationContact from "./ClientEscalationContact";
// import ClientAssets from "./ClientAssets";

export default function ClientSection({ clientId }) {
  const [activeTab, setActiveTab] = useState("sla");

  return (
    <div className="w-full mb-8"> {/* Added margin-bottom for spacing */}
      {/* Tab container */}
      <div className="flex items-center justify-between border-b border-gray-200 mb-6">
        {/* LEFT: Tabs */}
        <div className="flex space-x-6">
          {["sla", "compliance", "escalation"].map((tab) => {
             // Helper for readable labels
             const labels = {
               sla: "SLA",
               compliance: "Compliance",
               escalation: "Escalation Contact",
             };
             
             return (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className="relative pb-3 font-medium transition-colors focus:outline-none"
               >
                 <span
                   className={
                     activeTab === tab
                       ? "text-indigo-600 font-semibold"
                       : "text-gray-500 hover:text-gray-800"
                   }
                 >
                   {labels[tab]}
                 </span>
                 {activeTab === tab && (
                   <motion.div
                     className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-indigo-600"
                     layoutId="underline"
                     transition={{ type: "spring", stiffness: 300, damping: 25 }}
                   />
                 )}
               </button>
             );
          })}
        </div>
      </div>

      {/* Content Container - REMOVED fixed height and absolute positioning */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {activeTab === "sla" && (
            <motion.div
              key="sla"
              initial={{ opacity: 0, y: 10 }} // Changed to Y axis for natural flow
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ClientBasicSLA clientId={clientId} />
            </motion.div>
          )}

          {activeTab === "compliance" && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ClientBasicCompliance clientId={clientId} />
            </motion.div>
          )}

          {activeTab === "escalation" && (
            <motion.div
              key="escalation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ClientEscalationContact clientId={clientId} />
            </motion.div>
          )}

          {/* {activeTab === "assets" && (
            <motion.div
              key="assets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ClientAssets clientId={clientId} />
            </motion.div>
          )} */}
        </AnimatePresence>
      </div>
    </div>
  );
}