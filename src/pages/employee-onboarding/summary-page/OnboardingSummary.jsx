import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

const COLORS = ["#22C55E", "#F59E0B", "#EF4444"];

const data = {
  kpis: {
    totalCandidates: 120,
    offersSent: 60,
    offersAccepted: 50,
    offersRejected: 10,
    inProgress: 35,
    completed: 70,
    avgOnboardingTime: "6 Days",
    dropOffRate: "8%"
  },

  funnel: [
    { stage: "Applied", count: 120 },
    { stage: "Docs Submitted", count: 100 },
    { stage: "Verified", count: 85 },
    { stage: "Offer Sent", count: 60 },
    { stage: "Accepted", count: 50 },
    { stage: "Joined", count: 45 },
    { stage: "Completed", count: 40 }
  ],

  documents: [
    { name: "Verified", value: 80 },
    { name: "Pending", value: 25 },
    { name: "Rejected", value: 15 }
  ],

  department: [
    { dept: "Engineering", completed: 25 },
    { dept: "HR", completed: 8 },
    { dept: "Sales", completed: 15 }
  ],

  monthlyTrend: {
    2024: [
      { month: "Jan", onboarded: 15 },
      { month: "Feb", onboarded: 20 },
      { month: "Mar", onboarded: 25 },
      { month: "Apr", onboarded: 22 },
      { month: "May", onboarded: 30 },
      { month: "Jun", onboarded: 35 },
      { month: "Jul", onboarded: 33 },
      { month: "Aug", onboarded: 40 },
      { month: "Sep", onboarded: 38 },
      { month: "Oct", onboarded: 45 },
      { month: "Nov", onboarded: 42 },
      { month: "Dec", onboarded: 50 }
    ],
    2025: [
      { month: "Jan", onboarded: 18 },
      { month: "Feb", onboarded: 24 },
      { month: "Mar", onboarded: 30 },
      { month: "Apr", onboarded: 28 },
      { month: "May", onboarded: 35 },
      { month: "Jun", onboarded: 40 },
      { month: "Jul", onboarded: 38 },
      { month: "Aug", onboarded: 45 },
      { month: "Sep", onboarded: 42 },
      { month: "Oct", onboarded: 50 },
      { month: "Nov", onboarded: 47 },
      { month: "Dec", onboarded: 55 }
    ]
  },

  sla: [
    { metric: "Doc Verification", value: "2 Days" },
    { metric: "Offer Acceptance", value: "1.5 Days" },
    { metric: "Emp ID Generation", value: "1 Day" },
    { metric: "Total Onboarding", value: "6 Days" }
  ]
};

const KPI = ({ title, value }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
    <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
    <h2 className="text-xl font-semibold text-slate-800 mt-1">{value}</h2>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
    <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
      {title}
    </h3>
    {children}
  </div>
);

export default function EnterpriseHRSummaryDashboard() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const previousYear = selectedYear === "2025" ? "2024" : "2025";

  const combinedData = useMemo(() => {
    return data.monthlyTrend[selectedYear].map((item, index) => {
      const prev = data.monthlyTrend[previousYear][index];
      return {
        month: item.month,
        current: item.onboarded,
        previous: prev.onboarded,
        growth:
          ((item.onboarded - prev.onboarded) / prev.onboarded) * 100
      };
    });
  }, [selectedYear, previousYear]);

  return (
    <div className="min-h-screen bg-slate-100 p-6 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          HR Onboarding Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Operational & management overview
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI title="Total Candidates" value={data.kpis.totalCandidates} />
        <KPI title="Offers Sent" value={data.kpis.offersSent} />
        <KPI title="Offers Accepted" value={data.kpis.offersAccepted} />
        <KPI title="Offers Rejected" value={data.kpis.offersRejected} />
        <KPI title="In Progress" value={data.kpis.inProgress} />
        <KPI title="Completed" value={data.kpis.completed} />
        <KPI title="Avg Onboarding Time" value={data.kpis.avgOnboardingTime} />
        <KPI title="Drop-Off Rate" value={data.kpis.dropOffRate} />
      </div>

      {/* Funnel */}
      <Section title="Onboarding Funnel">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.funnel}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* Documents + Department */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Document Verification">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.documents} dataKey="value" outerRadius={90}>
                {data.documents.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Department Completion">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.department}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Monthly Trend */}
      <Section title="Monthly Trend">

        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            {["2024", "2025"].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1 text-xs border ${
                  selectedYear === year
                    ? "bg-slate-800 text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={combinedData}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 p-3 text-xs shadow-sm">
                      <div className="font-semibold mb-1">{d.month}</div>
                      <div>{selectedYear}: {d.current}</div>
                      <div>{previousYear}: {d.previous}</div>
                      <div className={d.growth >= 0 ? "text-green-600" : "text-red-600"}>
                        {d.growth >= 0 ? "+" : ""}
                        {d.growth.toFixed(1)}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />

            <Area
              type="monotone"
              dataKey="previous"
              stroke="#9CA3AF"
              fill="#E5E7EB"
              strokeWidth={2}
              animationDuration={800}
            />

            <Area
              type="monotone"
              dataKey="current"
              stroke="#111827"
              fill="#D1D5DB"
              strokeWidth={2}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      {/* SLA */}
      <div className="grid md:grid-cols-4 gap-4">
        {data.sla.map((item, index) => (
          <KPI key={index} title={item.metric} value={item.value} />
        ))}
      </div>
      {/* Advanced Metrics */}
<Section title="Advanced Metrics">
  <div className="grid md:grid-cols-3 gap-4 text-sm">

    <div className="p-3 border border-slate-200 rounded bg-slate-50">
      <p className="text-slate-500 text-xs">Cost per Hire</p>
      <p className="font-semibold text-slate-800 mt-1">₹45,000</p>
    </div>

    <div className="p-3 border border-slate-200 rounded bg-slate-50">
      <p className="text-slate-500 text-xs">Top Recruitment Source</p>
      <p className="font-semibold text-slate-800 mt-1">LinkedIn (40%)</p>
    </div>

    <div className="p-3 border border-slate-200 rounded bg-slate-50">
      <p className="text-slate-500 text-xs">Gender Diversity</p>
      <p className="font-semibold text-slate-800 mt-1">38% Female</p>
    </div>

    <div className="p-3 border border-slate-200 rounded bg-slate-50">
      <p className="text-slate-500 text-xs">Location Focus</p>
      <p className="font-semibold text-slate-800 mt-1">Hyderabad – 60%</p>
    </div>

    <div className="p-3 border border-slate-200 rounded bg-slate-50">
      <p className="text-slate-500 text-xs">Probation Completion</p>
      <p className="font-semibold text-slate-800 mt-1">92%</p>
    </div>

    <div className="p-3 border border-slate-200 rounded bg-slate-50">
      <p className="text-slate-500 text-xs">Conversion Rate</p>
      <p className="font-semibold text-slate-800 mt-1">65%</p>
    </div>

  </div>
</Section>
{/* Pending Actions */}
<Section title="Pending Actions">
  <div className="space-y-3 text-sm">

    <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition">
      <span className="text-slate-700">
        12 candidates pending document verification
      </span>
      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
        Action Required
      </span>
    </div>

    <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition">
      <span className="text-slate-700">
        5 offers waiting for manager approval
      </span>
      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
        Pending
      </span>
    </div>

    <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition">
      <span className="text-slate-700">
        8 candidates pending background verification
      </span>
      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
        In Progress
      </span>
    </div>

    <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition">
      <span className="text-slate-700">
        3 candidates joining tomorrow
      </span>
      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
        Upcoming
      </span>
    </div>

  </div>
</Section>
{/* Alerts */}
<Section title="Alerts & Risks">
  <div className="space-y-3 text-sm">

    <div className="flex items-center p-3 border-l-4 border-red-500 bg-red-50 rounded">
      <span className="text-red-700">
        Offer accepted but not joined in 7 days
      </span>
    </div>

    <div className="flex items-center p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
      <span className="text-yellow-700">
        Documents rejected more than 2 times
      </span>
    </div>

    <div className="flex items-center p-3 border-l-4 border-green-500 bg-green-50 rounded">
      <span className="text-green-700">
        Background verification within SLA
      </span>
    </div>

  </div>
</Section>

    </div>
  );
}