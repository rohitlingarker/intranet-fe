import React, { useState } from "react";

const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative flex items-center cursor-default"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 top-full mt-2 w-64 p-3 text-xs text-white bg-gray-800 rounded-lg shadow-lg whitespace-pre-line"
        >
          {content}
        </div>
        
      )}
    </div>
  );
};

export default Tooltip;
