// src/pages/TestDesign/ScenarioDetails.jsx

import { useEffect, useState } from "react";
import { getCasesByScenario, getStepsByCase } from "../testDesignApi";
import CaseCard from "./CaseCard";

export default function ScenarioDetails({ scenarioId }) {
  const [cases, setCases] = useState([]);
  const [steps, setSteps] = useState({});

  useEffect(() => {
    async function loadCases() {
      const data = await getCasesByScenario(scenarioId);
      setCases(data);
    }
    loadCases();
  }, [scenarioId]);

  const loadSteps = async (caseId) => {
    const res = await getStepsByCase(caseId);
    setSteps((prev) => ({ ...prev, [caseId]: res }));
  };

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4">Scenario Details</h2>

      {cases.map((c) => (
        <CaseCard 
          key={c.id}
          caseItem={c}
          steps={steps[c.id] || []}
          loadSteps={() => loadSteps(c.id)}
        />
      ))}
    </div>
  );
}
