// src/pages/Projects/Testmanagement/TestDesign/panels/StepsPanel.jsx
import React from "react";

export default function StepsPanel({ step }) {
  if (!step) return null;
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h3 className="font-semibold mb-2">Step</h3>
      <div className="text-sm text-slate-700 mb-1"><strong>Action</strong>: {step.action}</div>
      <div className="text-sm text-slate-600"><strong>Expected</strong>: {step.expected}</div>
    </div>
  );
}
