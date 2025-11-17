// LeavePolicyViewer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LeaveTypeCard = ({ leaveData }) => {
  if (!leaveData) return null;

  const { title, desc, createdAt } = leaveData;
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleSection = (index) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const renderContent = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return <p>No policy content found.</p>;

    return blocks.map((block, index) => {
      switch (block.type) {
        case "heading":
          const HeadingTag = `h${block.level || 6}`;
          const headingText = block.children.map((c) => c.text).join("");

          return (
            <div key={index} className="my-3 border-b border-gray-200">
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex justify-between items-center text-left py-1 px-4 bg-blue-50 hover:bg-blue-100 rounded-md"
              >
                <HeadingTag className="text-blue-800 font-semibold text-sm">
                  {headingText}
                </HeadingTag>
                <motion.span
                  animate={{ rotate: activeIndex === index ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-blue-600 font-bold text-xs"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {activeIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="pl-6 mt-3 pb-3 text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-md"
                  >
                    {renderNestedContent(blocks.slice(index + 1))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );

        default:
          return null;
      }
    });
  };

  const renderNestedContent = (content) => {
    return content.map((block, idx) => {
      if (block.type === "heading") return null; // stop at next heading
      if (block.type === "paragraph") {
        const text = block.children.map((child) => child.text).join("");
        return (
          <p key={idx} className="mb-3 text-gray-700">
            {text}
          </p>
        );
      }
      if (block.type === "list") {
        return (
          <ul
            key={idx}
            className="list-disc list-inside mb-3 ml-3 text-gray-700 space-y-1"
          >
            {block.children.map((item, j) => (
              <li key={j}>
                {item.children.map((child) => child.text).join("")}
              </li>
            ))}
          </ul>
        );
      }
      return null;
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      {renderContent(desc)}
      <p className="text-xs text-gray-500 mt-4">
        Created on: {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
      </p>
    </div>
  );
};

export default function LeavePolicyViewer() {
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = `https://celebrated-renewal-07a16fae8e.strapiapp.com/api/leave-policies`;

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(BASE_URL);
        const policies = response.data.data || [];
        setLeavePolicies(policies);
        if (policies.length > 0) setSelectedPolicyId(policies[0].id);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch leave policies");
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  if (loading)
    return <p className="text-center mt-6 text-gray-500">Loading leave policies...</p>;
  if (error)
    return <p className="text-center mt-6 text-red-500">{error}</p>;

  const selectedPolicy = leavePolicies.find((p) => p.id === selectedPolicyId);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Tabs + Back button row */}
      <div className="flex justify-between items-center mb-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3">
          {leavePolicies.map((policy) => {
            const isActive = policy.id === selectedPolicyId;
            return (
              <motion.div
                key={policy.id}
                onClick={() => setSelectedPolicyId(policy.id)}
                layout
                whileHover={{ scale: 1.05 }}
                className={`relative px-3 py-1.5 font-medium cursor-pointer rounded-md transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {policy.title}
                {isActive && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-800 rounded-t"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-700 font-medium hover:text-blue-900 transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </motion.button>
      </div>

      {/* Selected Policy */}
      {selectedPolicy && <LeaveTypeCard leaveData={selectedPolicy} />}
    </div>
  );
}
