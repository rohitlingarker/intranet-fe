import { Resource } from '../models/availabilityModel';

const mockResources = [
    new Resource({
        id: '1',
        name: 'Aarav Sharma',
        role: 'Technical Lead',
        location: 'Bangalore',
        skills: ['Architecture', 'Java', 'Microservices', 'AWS', 'Kafka'],
        allocation: 100,
        availableDate: 'Mar 25, 2026',
        project: 'Project Atlas',
        initials: 'AS',
        timeline: [
            { startPct: 0, widthPct: 35, color: 'green', label: 'Project Beacon (20%)', pct: 20 },
            { startPct: 35, widthPct: 40, color: 'red', label: 'Project Atlas', pct: 80 },
            { startPct: 75, widthPct: 25, color: 'gray', label: 'Project Keystone' }
        ]
    }),
    new Resource({
        id: '2',
        name: 'Priya Chen',
        role: 'Senior Frontend Engineer',
        location: 'Singapore',
        skills: ['React', 'TypeScript', 'Redux'],
        allocation: 60,
        availableDate: 'Feb 15, 2026',
        project: 'Project Beacon',
        initials: 'PC',
        timeline: [
            { startPct: 0, widthPct: 45, color: 'yellow', label: 'Project Beacon', pct: 60 },
            { startPct: 60, widthPct: 40, color: 'gray', label: 'Project Nexus' }
        ]
    }),
    new Resource({
        id: '3',
        name: 'James Williams',
        role: 'Backend Engineer',
        location: 'New York',
        skills: ['Node.js', 'Python'],
        allocation: 0,
        availableDate: 'Today',
        project: 'Bench',
        initials: 'JW',
        timeline: [] // Empty = Available
    }),
    new Resource({
        id: '4',
        name: 'Liam Patel',
        role: 'Full Stack Developer',
        location: 'London',
        skills: ['React', 'Node.js'],
        allocation: 40,
        availableDate: 'Feb 11, 2026',
        project: 'Project Catalyst',
        initials: 'LP',
        timeline: [
            { startPct: 0, widthPct: 40, color: 'yellow', label: 'Project Catalyst', pct: 40 },
            { startPct: 42, widthPct: 58, color: 'gray', label: 'Project Lumen' }
        ]
    }),
    new Resource({
        id: '5',
        name: 'Emma Johnson',
        role: 'QA Lead',
        location: 'San Francisco',
        skills: ['Selenium', 'Cypress'],
        allocation: 80,
        availableDate: 'Mar 3, 2026',
        project: 'Project Atlas',
        initials: 'EJ',
        timeline: [
            { startPct: 0, widthPct: 60, color: 'red', label: 'Project Atlas', pct: 80 },
            { startPct: 65, widthPct: 35, color: 'gray', label: 'Project Prism' }
        ]
    }),
    new Resource({
        id: '6',
        name: 'Marcus Tanaka',
        role: 'Cloud Architect',
        location: 'Tokyo',
        skills: ['Azure', 'Kubernetes'],
        allocation: 50,
        availableDate: 'Feb 28, 2026',
        project: 'Internal R&D',
        initials: 'MT',
        timeline: [
            { startPct: 0, widthPct: 55, color: 'yellow', label: 'Internal R&D' }
        ]
    }),
     new Resource({
        id: '7',
        name: 'Yuki Kumar',
        role: 'Data Engineer',
        location: 'Mumbai',
        skills: ['Spark', 'Hadoop'],
        allocation: 100,
        availableDate: 'Apr 10, 2026',
        project: 'Project Ion',
        initials: 'YK',
        timeline: [
            { startPct: 0, widthPct: 80, color: 'red', label: 'Project Ion', pct: 100 },
             { startPct: 82, widthPct: 18, color: 'gray', label: 'Tentative' }
        ]
    }),
    new Resource({
        id: '8',
        name: 'Carlos Hassan',
        role: 'Mobile Developer',
        location: 'Toronto',
        skills: ['React Native', 'Swift'],
        allocation: 90,
        availableDate: 'Mar 13, 2026',
        project: 'Project Echo',
        initials: 'CH',
        timeline: [
            { startPct: 0, widthPct: 65, color: 'red', label: 'Project Echo', pct: 90 },
            { startPct: 70, widthPct: 30, color: 'gray', label: 'Project Orbit' }
        ]
    })
];

export const fetchResources = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockResources), 500);
    });
};

export const fetchKPIData = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve({
            total: 20,
            available: 4,
            partial: 6,
            allocated: 10,
            available30d: 13,
            bench: 20,
            overAllocated: 2,
            utilization: 63
        }), 500);
    });
};
// src/resource_management/services/availabilityService.js

const ROLES = ["Technical Lead", "Senior Frontend Engineer", "Backend Engineer", "Full Stack Developer", "QA Lead", "Cloud Architect", "Data Engineer", "UX Designer", "Mobile Developer", "ML Engineer"];
const LOCATIONS = ["Bangalore", "Berlin", "New York", "London", "San Francisco", "Tokyo", "Toronto", "Paris"];
const PROJECTS = ["Project Beacon", "Project Atlas", "Project Ion", "Project Echo", "Project Nexus", "Project Catalyst", "Project Horizon", "Bench"];

// Helper to generate dates relative to today
const getDate = (daysOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

export const fetchResourceData = () => {
  return [
    {
      id: "AS",
      name: "Aarav Sharma",
      role: "Technical Lead",
      location: "Bangalore",
      experience: 12,
      skills: ["Architecture", "Java", "Microservices", "AWS", "Kafka"],
      allocations: [
        { id: 1, project: "Project Beacon", start: getDate(-30), end: getDate(15), percentage: 20, type: "Billable" },
        { id: 2, project: "Project Atlas", start: getDate(-10), end: getDate(45), percentage: 80, type: "Billable" }
      ],
      utilizationTrend: [80, 85, 90, 100, 100, 100], // Last 6 months
      availableFrom: getDate(46),
      status: "Allocated" // Computed normally, but hardcoded for mock simplicity here
    },
    {
      id: "PC",
      name: "Priya Chen",
      role: "Senior Frontend Engineer",
      location: "Berlin",
      experience: 8,
      skills: ["React", "TypeScript", "Redux", "Figma", "Jest"],
      allocations: [
        { id: 3, project: "Project Beacon", start: getDate(-60), end: getDate(-5), percentage: 100, type: "Billable" },
        { id: 4, project: "Project Nexus", start: getDate(-5), end: getDate(90), percentage: 60, type: "Billable" }
      ],
      utilizationTrend: [100, 100, 100, 60, 60, 60],
      availableFrom: "Partially Available",
      status: "Partial"
    },
    {
      id: "JW",
      name: "James Williams",
      role: "Backend Engineer",
      location: "New York",
      experience: 5,
      skills: ["Node.js", "Python", "PostgreSQL", "Docker"],
      allocations: [], // Bench
      utilizationTrend: [100, 100, 50, 0, 0, 0],
      availableFrom: "Now",
      status: "Available"
    },
    {
      id: "LP",
      name: "Liam Patel",
      role: "Full Stack Developer",
      location: "London",
      experience: 6,
      skills: ["React", "Node.js", "MongoDB", "GraphQL"],
      allocations: [
        { id: 5, project: "Project Lumen", start: getDate(10), end: getDate(60), percentage: 100, type: "Tentative" }
      ],
      utilizationTrend: [80, 80, 0, 0, 0, 0],
      availableFrom: "Now",
      status: "Available" // Currently available until project starts
    },
    {
      id: "EJ",
      name: "Emma Johnson",
      role: "QA Lead",
      location: "San Francisco",
      experience: 9,
      skills: ["Selenium", "Cypress", "Jenkins", "Python"],
      allocations: [
        { id: 6, project: "Project Atlas", start: getDate(-20), end: getDate(40), percentage: 80, type: "Billable" },
        { id: 7, project: "Project Prism", start: getDate(41), end: getDate(100), percentage: 60, type: "Billable" }
      ],
      utilizationTrend: [70, 75, 80, 80, 80, 60],
      availableFrom: getDate(41),
      status: "Allocated"
    },
    {
      id: "MT",
      name: "Marcus Tanaka",
      role: "Cloud Architect",
      location: "Tokyo",
      experience: 15,
      skills: ["AWS", "Azure", "Terraform", "Kubernetes", "Security"],
      allocations: [
        { id: 8, project: "Project Horizon", start: getDate(-40), end: getDate(20), percentage: 50, type: "Billable" }
      ],
      utilizationTrend: [50, 50, 50, 50, 50, 50],
      availableFrom: "Partially Available",
      status: "Partial"
    },
    {
      id: "YK",
      name: "Yuki Kumar",
      role: "Data Engineer",
      location: "Toronto",
      experience: 4,
      skills: ["Python", "Spark", "Hadoop", "SQL", "Airflow"],
      allocations: [
        { id: 9, project: "Project Ion", start: getDate(-10), end: getDate(80), percentage: 100, type: "Billable" }
      ],
      utilizationTrend: [90, 95, 100, 100, 100, 100],
      availableFrom: getDate(81),
      status: "Allocated"
    },
    {
      id: "AG",
      name: "Ananya Garcia",
      role: "UX Designer",
      location: "Berlin",
      experience: 7,
      skills: ["Figma", "Research", "Prototyping", "Adobe XD"],
      allocations: [
        { id: 10, project: "Project Beacon", start: getDate(-15), end: getDate(15), percentage: 30, type: "Billable" }
      ],
      utilizationTrend: [40, 30, 30, 30, 30, 30],
      availableFrom: "Partially Available",
      status: "Partial"
    },
    {
      id: "CH",
      name: "Carlos Hassan",
      role: "Mobile Developer",
      location: "Toronto",
      experience: 6,
      skills: ["React Native", "Swift", "Kotlin", "Firebase"],
      allocations: [
        { id: 11, project: "Project Echo", start: getDate(-5), end: getDate(55), percentage: 90, type: "Billable" }
      ],
      utilizationTrend: [80, 90, 90, 90, 90, 90],
      availableFrom: getDate(56),
      status: "Allocated"
    },
     {
      id: "DN",
      name: "David Nakamura",
      role: "Technical Lead",
      location: "Tokyo",
      experience: 10,
      skills: ["Architecture", "Python", "Go", "GCP"],
      allocations: [
        { id: 12, project: "Project Horizon", start: getDate(-20), end: getDate(10), percentage: 70, type: "Billable" }
      ],
      utilizationTrend: [70, 70, 70, 70, 70, 70],
      availableFrom: "Partially Available",
      status: "Partial"
    },
    {
      id: "FS",
      name: "Fatima Smith",
      role: "ML Engineer",
      location: "London",
      experience: 3,
      skills: ["Python", "TensorFlow", "PyTorch", "Pandas"],
      allocations: [],
      utilizationTrend: [0, 0, 0, 0, 0, 0],
      availableFrom: "Now",
      status: "Available"
    },
    // Add more dummy data as needed to reach 20+
  ];
};

export const getRoles = () => ROLES;
export const getLocations = () => LOCATIONS;
export const getProjects = () => PROJECTS;