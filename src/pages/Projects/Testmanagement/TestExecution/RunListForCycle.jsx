// src/components/RunListForCycle.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import TestRunAccordion from "./TestRuns";

export default function RunListForCycle({ cycleId, onAddCases }) {
  const [runs, setRuns] = useState([]);

  const loadRuns = async () => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-execution/test-runs/cycles/${cycleId}`
      );
      setRuns(res.data || []);
    } catch (err) {
      console.error("Error loading runs:", err);
    }
  };

  useEffect(() => {
    if (cycleId) loadRuns();
  }, [cycleId]);

  return (
    <div className="space-y-4">
      {runs.map((run) => (
        <TestRunAccordion
          key={run.id}
          run={run}
          onAddCases={onAddCases}
        />
      ))}
    </div>
  );
}
