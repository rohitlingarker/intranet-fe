import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// LeaveTypeCard Component
const LeaveTypeCard = ({ leaveData }) => {
  if (!leaveData || !leaveData.Description) return null;

  const renderContent = (description) =>
    description.map((block, index) => {
      switch (block.type) {
        case "heading":
          const HeadingTag = `h${block.level}`;
          return (
            <HeadingTag key={index} className="text-blue-600 font-semibold my-2">
              {block.children.map((child) => child.text).join("")}
            </HeadingTag>
          );
        case "paragraph":
          return (
            <p key={index} className="text-gray-700 mb-2">
              {block.children.map((child) => child.text).join("")}
            </p>
          );
        case "list":
          return (
            <ul key={index} className="list-disc list-inside mb-2">
              {block.children.map((item, i) => (
                <li key={i} className="text-gray-700 mb-1">
                  {item.children.map((child) => child.text).join("")}
                </li>
              ))}
            </ul>
          );
        default:
          return null;
      }
    });

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{leaveData.Leave}</h2>
      <div>{renderContent(leaveData.Description)}</div>
      <p className="text-sm text-gray-500 mt-4">
        Effective Date: {new Date(leaveData.Date).toLocaleDateString()}
      </p>
    </div>
  );
};

// Main Component with animated underline tabs
export default function LeavePolicyViewer() {
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [activePolicyId, setActivePolicyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = "http://localhost:1337/api/leave-policies";

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(BASE_URL);
        setLeavePolicies(response.data.data);
        if (response.data.data.length > 0) {
          setActivePolicyId(response.data.data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch leave policies");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading leave policies...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

  const activePolicy = leavePolicies.find((policy) => policy.id === activePolicyId);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200">
        {leavePolicies.map((policy) => {
          const isActive = policy.id === activePolicyId;
          return (
            <button
              key={policy.id}
              onClick={() => setActivePolicyId(policy.id)}
              className="relative pb-2 font-medium transition-colors focus:outline-none"
            >
              <span className={isActive ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"}>
                {policy.Leave}
              </span>

              {/* Animated underline using layoutId */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600"
                  layoutId="underline"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Animated Content */}
      <div className="mt-4 relative min-h-[200px]">
        <AnimatePresence mode="wait">
          {activePolicy && (
            <motion.div
              key={activePolicy.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <LeaveTypeCard leaveData={activePolicy} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
