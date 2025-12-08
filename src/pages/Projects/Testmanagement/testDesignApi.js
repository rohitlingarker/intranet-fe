

const API_BASE = "http://localhost:8080/api/test-design";

export const getScenariosByStory = async (storyId) => {
  const res = await fetch(`${API_BASE}/scenarios/test-stories/${storyId}`);
  return res.json();
};

export const createScenario = async (payload) => {
  const res = await fetch(`${API_BASE}/scenarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
};

export const getCasesByScenario = async (scenarioId) => {
  const res = await fetch(`${API_BASE}/cases/scenario/${scenarioId}`);
  return res.json();
};

export const getStepsByCase = async (caseId) => {
  const res = await fetch(`${API_BASE}/steps/case/${caseId}`);
  return res.json();
};
