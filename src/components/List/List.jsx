import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const ExpandableList = ({
  title,
  children,
  defaultExpanded = false,
  count = 0,
  headerRight = null,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div className="w-full rounded-md shadow-sm border border-gray-200 bg-white mb-3 transition-all">
      <button
        onClick={toggleExpanded}
        className="flex items-center justify-between w-full px-4 py-3 text-left focus:outline-none hover:bg-gray-100 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown size={18} className="text-gray-600" />
          ) : (
            <ChevronRight size={18} className="text-gray-600" />
          )}
          <span className="text-gray-800 font-semibold text-sm sm:text-base">
            {title}
          </span>
          {count > 0 && (
            <span className="ml-1 bg-pink-100 text-pink-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {headerRight && <div className="text-sm text-gray-500">{headerRight}</div>}
      </button>

      <div
        className={`transition-all overflow-hidden ${
          expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-2">
          {children && React.Children.count(children) > 0 ? (
            <ul className="space-y-2">{children}</ul>
          ) : (
            <p className="text-sm text-gray-400 italic">No items found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpandableList;
