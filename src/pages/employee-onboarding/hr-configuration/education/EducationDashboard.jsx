import { useNavigate } from "react-router-dom";

export default function EducationDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Education Configuration</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Education Levels" onClick={() => navigate("levels")} />
        <Card title="Education Documents" onClick={() => navigate("documents")} />
        <Card title="Country Education Mapping" onClick={() => navigate("mapping")} />
      </div>
    </div>
  );
}

function Card({ title, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white shadow rounded-xl p-6 hover:shadow-lg"
    >
      <h2 className="font-semibold">{title}</h2>
    </div>
  );
}
