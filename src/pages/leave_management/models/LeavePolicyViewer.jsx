// LeavePolicyViewer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LeaveTypeCard = ({ leaveData }) => {
  if (!leaveData) return null;

  const { Leave, Description, Date: effectiveDate } = leaveData;
  const [openSections, setOpenSections] = useState({});
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleSection = (index) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const renderContent = (description) =>
    description?.map((block, index) => {
      if (block.type !== "heading") return null;
      const HeadingTag = `h${block.level}`;

      return (
        <div key={index} className="my-3 border-b border-gray-200">
          <button
            onClick={() =>
              setActiveIndex((prev) => (prev === index ? null : index))
            }
            className="w-full flex justify-between items-center text-left py-1 px-4 bg-blue-50 hover:bg-blue-100 rounded-md"
          >
            <HeadingTag className="text-blue-800 font-semibold text-sm">
              {block.children.map((child) => child.text).join("")}
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
                className="pl-6 mt-3 pb-3 text-gray-500 text-xs leading-relaxed bg-gray-50 rounded-md"
              >
                {description.slice(index + 1).map((nextBlock, i) => {
                  if (nextBlock.type === "heading") return null;
                  if (nextBlock.type === "paragraph")
                    return (
                      <p key={i} className="mb-4 font-bold text-gray-600">
                        {nextBlock.children.map((child) => child.text).join("")}
                      </p>
                    );
                  if (nextBlock.type === "list")
                    return (
                      <ul key={i} className="list-disc list-inside mb-4 ml-2 w-[96%]">
                        {nextBlock.children.map((item, j) => (
                          <li key={j}>
                            {item.children.map((child) => child.text).join("")}
                          </li>
                        ))}
                      </ul>
                    );
                  return null;
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{Leave}</h2>
      <div>{renderContent(Description)}</div>
      <p className="text-xs text-gray-500 mt-4">
        Effective Date:{" "}
        {effectiveDate ? new Date(effectiveDate).toLocaleDateString() : "N/A"}
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

  const BASE_URL = "http://localhost:1337/api/leave-policies";

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(BASE_URL);
        const policies = response.data.data || [];
        const formattedPolicies = policies.map((p) => p.attributes || p);
        setLeavePolicies(formattedPolicies);
        if (formattedPolicies.length > 0)
          setSelectedPolicyId(formattedPolicies[0].id);
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
    return (
      <p className="text-center mt-6 text-gray-500">
        Loading leave policies...
      </p>
    );
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

  const selectedPolicy = leavePolicies.find((p) => p.id === selectedPolicyId);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* 🔹 Tabs + Back button row */}
      <div className="flex justify-between items-center mb-6">
        {/* Tabs */}
        <div className="flex space-x-2">
          {leavePolicies.map((policy) => {
            const isActive = policy.id === selectedPolicyId;
            const title = policy.Leave || "Untitled";

            return (
              <motion.div
                key={policy.id}
                onClick={() => setSelectedPolicyId(policy.id)}
                layout
                whileHover={{ scale: 1.02 }}
                className={`relative px-2 py-1 font-medium cursor-pointer transition-colors duration-300 ${
                  isActive
                    ? "text-blue-800"
                    : "text-gray-800 hover:text-blue-600"
                }`}
              >
                {title}
                {isActive && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 bottom-0 w-full h-1 bg-blue-800 rounded-t"
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
          onClick={() => navigate(-1)} // go back to previous page
          className="flex items-center text-blue-700 font-medium hover:text-blue-900 transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </motion.button>
      </div>

      {/* Selected Policy Content */}
      {selectedPolicy && <LeaveTypeCard leaveData={selectedPolicy} />}
    </div>
  );
}
