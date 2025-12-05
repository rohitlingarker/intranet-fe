// src/pages/TestDesign/CaseCard.jsx

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CaseCard({ caseItem, steps, loadSteps }) {
  const [open, setOpen] = useState(false);

  const toggle = async () => {
    setOpen(!open);
    if (!open) loadSteps();
  };

  return (
    <div className="border rounded p-4 mb-3">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={toggle}
      >
        <h3 className="font-medium">{caseItem.title}</h3>
        {open ? <ChevronUp /> : <ChevronDown />}
      </div>

      {open && (
        <div className="mt-3 pl-4 text-sm text-gray-700">
          {steps.length === 0 ? (
            <p>No steps found.</p>
          ) : (
            steps.map((s) => (
              <div key={s.id} className="mb-2">
                <div className="font-medium">{s.action}</div>
                <div className="text-gray-500">{s.expected}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
