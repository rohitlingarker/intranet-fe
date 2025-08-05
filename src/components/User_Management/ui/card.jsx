// src/components/ui/card.jsx
import React from "react";

export const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
