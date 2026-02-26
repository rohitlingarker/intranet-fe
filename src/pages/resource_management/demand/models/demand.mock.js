export const MOCK_DEMANDS = [
    {
        id: 1,
        projectName: "Frontend Architecture Refactor",
        client: "Stark Industries",
        role: "Senior React Developer",
        priority: "CRITICAL",
        slaDays: -2,
        lifecycleState: "APPROVED",
        intent: "NET_NEW",
        demandType: "Standard",
        duration: "6 Months",
        allocationPercent: 100,
        experienceRequired: "8+ Years",
        skills: ["React", "TypeScript", "Architectural Design"],
        priorityBreakdown: "Critical path for Q3 release.",
        approvals: [
            { role: "PM", name: "Tony Stark", status: "APPROVED", timestamp: "Feb 20, 2024", comments: "Budget approved and critical for Q3 timeline." },
            { role: "Delivery Manager", name: "Pepper Potts", status: "APPROVED", timestamp: "Feb 21, 2024", comments: "Resource plan looks solid. Proceeding with hiring." }
        ]
    },
    {
        id: 2,
        projectName: "Cloud Infra Scaling",
        client: "Wayne Enterprises",
        role: "DevOps Engineer",
        priority: "HIGH",
        slaDays: 3,
        lifecycleState: "REQUESTED",
        intent: "EMERGENCY",
        demandType: "Critical",
        duration: "3 Months",
        allocationPercent: 100,
        experienceRequired: "5+ Years",
        skills: ["AWS", "Terraform", "K8s"],
        priorityBreakdown: "Site stability at risk due to traffic surge. Immediate action required.",
        approvals: [
            { role: "PM", name: "Bruce Wayne", status: "PENDING", timestamp: null, comments: "" }
        ]
    },
    {
        id: 3,
        projectName: "Mobile Payment Integration",
        client: "LexCorp",
        role: "iOS Developer",
        priority: "MEDIUM",
        slaDays: 12,
        lifecycleState: "APPROVED",
        intent: "BACKFILL",
        demandType: "Replacement",
        duration: "4 Months",
        allocationPercent: 100,
        experienceRequired: "4+ Years",
        skills: ["Swift", "Combine", "Fintech"],
        priorityBreakdown: "Replacement for outgoing resource. Critical for maintaining release velocity.",
        approvals: [
            { role: "PM", name: "Lex Luthor", status: "APPROVED", timestamp: "Feb 15, 2024", comments: "Replacement necessary for ongoing maintenance." }
        ]
    },
    {
        id: 4,
        projectName: "Internal HR Portal",
        client: "Oscorp",
        role: "Fullstack Engineer",
        priority: "LOW",
        slaDays: 25,
        lifecycleState: "REJECTED",
        intent: "REPLACEMENT",
        demandType: "Standard",
        duration: "6 Months",
        allocationPercent: 50,
        experienceRequired: "3+ Years",
        skills: ["Node.js", "Postgres", "Vue"],
        priorityBreakdown: "Project scope reduced; hiring put on hold. Strategy changed to internal shift.",
        approvals: [
            { role: "PM", name: "Norman Osborn", status: "REJECTED", timestamp: "Feb 22, 2024", comments: "Budget cut due to project scope reduction." }
        ]
    }
];

export const KPI_DATA = [
    { label: "Active Demands", count: 24, color: "bg-indigo-50 text-indigo-600" },
    { label: "Pending", count: 8, color: "bg-amber-50 text-amber-600" },
    { label: "Approved", count: 12, color: "bg-emerald-50 text-emerald-600" },
    { label: "SLA At Risk", count: 3, color: "bg-orange-50 text-orange-600" },
    { label: "SLA Breached", count: 2, color: "bg-rose-50 text-rose-600" },
    { label: "Emergency", count: 1, color: "bg-red-50 text-red-600" }
];
