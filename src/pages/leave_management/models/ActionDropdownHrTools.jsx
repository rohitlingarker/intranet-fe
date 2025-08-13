import React from "react";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { useState, useEffect } from "react";
 
const ActionDropdown = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = React.useState(false);
 
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
 
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
 
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);
 
  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical className="w-5 h-5 cursor-pointer" />
      </button>
 
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100"
            >
              <Trash className="w-4 h-4 mr-2" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default ActionDropdown;