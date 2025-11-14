"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  FiCheckSquare,
  FiBookmark,
  FiZap,
  FiLink,
  FiUser,
} from "react-icons/fi";
import { FaBug } from "react-icons/fa";
import { Card, Avatar, Typography, Spin } from "antd";
import { motion } from "framer-motion";
const { Title, Text, Link } = Typography;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: "easeOut" },
  },
};

const generateColors = (numColors) => {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = (i * 360) / Math.max(1, numColors);
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
};

/* --- DistributionBar: slim compact -- */
const DistributionBar = ({ percentage }) => {
  const percentLabel = `${Math.round(percentage)}%`;
  return (
    <div className="w-full bg-gray-200 rounded h-4" title={percentLabel}>
      <motion.div
        className="bg-gray-600 h-4 rounded flex items-center px-2 text-xs text-white font-semibold"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span>{percentLabel}</span>
      </motion.div>
    </div>
  );
};

/* --- Scope & Progress (compact) --- */
const ScopeAndProgress = ({ epics, stories, bugs, tasks }) => {
  const allWorkItems = [...stories, ...tasks, ...bugs];
  const totalItems = allWorkItems.length;
  const completedItems = allWorkItems.filter(
    (item) =>
      item.status &&
      typeof item.status.name === "string" &&
      item.status.name.toLowerCase() === "done"
  ).length;

  const progressPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const progressData = [
    { name: "Completed", value: progressPercentage },
    { name: "Remaining", value: 100 - progressPercentage },
  ];

  const statItems = [
  { 
    name: "Epics", 
    count: epics.length, 
    icon: <FiZap className="text-purple-500 text-xl" /> 
  },
  { 
    name: "User Stories", 
    count: stories.length, 
    icon: <FiBookmark className="text-green-500 text-xl" /> 
  },
  { 
    name: "Tasks", 
    count: tasks.length, 
    icon: <FiCheckSquare className="text-blue-500 text-xl" /> 
  },
  { 
    name: "Bugs", 
    count: bugs.length, 
    icon: <FaBug className="text-red-500 text-xl" /> 
  },
];


  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card
        title={<Title level={4} className="!mb-0 font-bold">Scope & Progress</Title>}
        className="shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        styles={{
        header:{ marginBottom: 0,borderBottom: "none", paddingBottom: 0 },
        body:{ padding: 20, paddingTop: 0 }
        }}
      >
        {/* compact grid: left stat column + right donut */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap- items-center">
          {/* Left: small stat tiles stacked */}
          <div className="grid grid-cols-4 gap-3">
  {statItems.map((item) => (
    <div 
      key={item.name} 
      className="bg-gray-50 rounded p-3 flex flex-col items-center justify-center"
    >
      <div className="text-2xl mb-1">{item.icon}</div>
      <Text 
        type="secondary" 
        className="text-xs uppercase tracking-wide font-semibold text-center"
      >
        {item.name}
      </Text>
      <Title 
        level={4} 
        className="!mb-0 !text-indigo-600 font-bold text-center"
      >
        {item.count}
      </Title>
    </div>
  ))}
</div>



          {/* Right: smaller donut + small label */}
          <div className="flex flex-col items-center justify-center">
            <Text strong className="mb-2 text-xs uppercase tracking-wide font-bold">Overall Progress</Text>
            <div className="w-36 h-36 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                  >
                    <Cell key="completed" fill="#4f46e5" />
                    <Cell key="remaining" fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.12, duration: 0.28 }}
                  className="text-center"
                >
                  <Title level={4} className="!mb-0 !text-indigo-600 font-bold">{progressPercentage}%</Title>
                  <Text type="secondary" className="text-xs font-semibold">{completedItems} / {totalItems}</Text>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

/* --- StatusOverview --- */
const StatusOverview = ({ workItems, statuses }) => {
  const [chartData, setChartData] = useState([]);
  const totalItems = workItems.length;

  useEffect(() => {
    const statusMap = new Map(statuses.map(s => [s.id, { ...s, count: 0 }]));
    workItems.forEach(item => {
      if (item.status && statusMap.has(item.status.id)) {
        statusMap.get(item.status.id).count++;
      }
    });
    const colors = generateColors(Math.max(1, statusMap.size));
    const data = Array.from(statusMap.values()).map((status, index) => ({
      name: status.name,
      value: status.count,
      color: colors[index % colors.length],
    }));
    setChartData(data);
  }, [workItems, statuses]);

  if (!totalItems && chartData.every(d => d.value === 0)) return null;

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card
        title={<Title level={4} className="!mb-0 font-bold">Status overview</Title>}
        className="shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        styles={{
        header:{ marginBottom: 0,borderBottom: "none", paddingBottom: 0 },
        body:{ padding: 40, paddingTop: 0 }
        }}
      >
        <Text type="secondary" className="block mb-3 text-sm">
                Get a snapshot of the status of your work items.
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.value > 0 ? entry.color : "#f3f4f6"}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value, name) => [`${name}: ${value}`, null]}
                  contentStyle={{
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    padding: "6px 10px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                  cursor={{ fill: "transparent" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Title level={4} className="!mb-0 font-bold">{totalItems}</Title>
              <Text type="secondary" className="text-xs font-semibold">Total work items</Text>
            </div>
          </div>

          <div className="space-y-2 self-center">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center">
                <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: item.value > 0 ? item.color : "#f3f4f6" }} />
                <Text className="text-sm font-medium">{item.name}: {item.value}</Text>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

/* --- TypesOfWork --- */
const TypesOfWork = ({ tasks, stories, epics, bugs }) => {
  const workTypes = [
    { name: "Tasks", items: tasks, icon: <FiCheckSquare className="text-blue-500" /> },
    { name: "Stories", items: stories, icon: <FiBookmark className="text-green-500" /> },
    { name: "Epics", items: epics, icon: <FiZap className="text-purple-500" /> },
    { name: "Bugs", items: bugs, icon: <FaBug className="text-red-500" /> },
  ];

  const totalItems = workTypes.reduce((sum, type) => sum + type.items.length, 0);
  if (!totalItems) return null;

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card
        title={<Title level={4} className="!mb-0 font-bold">Types of work</Title>}
        className="shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        styles={{
        header:{ marginBottom: 0,borderBottom: "none", paddingBottom: 0 },
        body:{ padding: 40, paddingTop: 0 }
        }}
        // extra={<Link href="#" className="font-semibold">View all items</Link>}
      >
        <Text type="secondary" className="block mb-3 text-sm">Get a breakdown of work items by their types.</Text>

        <div className="flex justify-between mb-2">
          <Text strong className="text-gray-500 w-2/5 text-xs">Type</Text>
          <Text strong className="text-gray-500 w-3/5 text-xs">Distribution</Text>
        </div>

        <div className="space-y-3">
          {workTypes.map((type) => {
            const percentage = totalItems > 0 ? (type.items.length / totalItems) * 100 : 0;
            if (type.items.length === 0) return null;
            return (
              <div key={type.name} className="flex items-center">
                <div className="w-2/5 flex items-center">
                  <span className="mr-3 text-lg">{type.icon}</span>
                  <Text className="text-sm font-medium">{type.name}</Text>
                </div>
                <div className="w-3/5">
                  <DistributionBar percentage={percentage} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
};

/* --- TeamWorkload --- */
const TeamWorkload = ({ workItems, users }) => {
  const [workloadData, setWorkloadData] = useState([]);
  const totalItems = workItems.length;

  useEffect(() => {
    const userMap = new Map(users.map(u => [u.id, { ...u, count: 0 }]));

    // Default Unassigned bucket
    const unassigned = {
      id: null,
      name: "Unassigned",
      count: 0,
      color: "#9ca3af",
      initials: <FiUser />
    };

    // FIX: detect assignee by assigneeId OR assignee.id
    workItems.forEach(item => {
      const assignedTo = item.assigneeId || item.assignee?.id;

      if (assignedTo && userMap.has(assignedTo)) {
        userMap.get(assignedTo).count++;
      } else {
        unassigned.count++;
      }
    });

    // Only show users who have at least 1 assignment
    const assignedUsers = Array.from(userMap.values()).filter(u => u.count > 0);

    // Put Unassigned at the top if it has items
    const allAssignees = unassigned.count > 0
      ? [unassigned, ...assignedUsers]
      : assignedUsers;

    const colors = generateColors(Math.max(1, assignedUsers.length));

    // Build workload array
    const data = allAssignees.map((user, index) => {
      const percentage =
        totalItems > 0 ? (user.count / totalItems) * 100 : 0;

      const initials = user.id
        ? (user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?")
        : <FiUser />;

      return {
        ...user,
        percentage,
        initials,
        color: user.id ? colors[index % colors.length] : "#9ca3af"
      };
    });

    setWorkloadData(data);
  }, [workItems, users]);

  if (!totalItems) return null;

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card
        title={
          <Title level={4} className="!mb-0 font-bold">
            Team workload
          </Title>
        }
        className="shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        styles={{
          header: { marginBottom: 0, borderBottom: "none", paddingBottom: 0 },
          body: { padding: 40, paddingTop: 0 }
        }}
      >
        <Text type="secondary" className="block !mt-0 !mb-1 text-sm">
          Monitor the capacity of your team.
        </Text>

        <div className="flex justify-between mb-2">
          <Text strong className="text-gray-500 w-2/5 text-xs">
            Assignee
          </Text>
          <Text strong className="text-gray-500 w-3/5 text-xs">
            Work distribution
          </Text>
        </div>

        <div className="space-y-3">
          {workloadData.map(user => (
            <div key={user.name} className="flex items-center">
              <div className="w-2/5 flex items-center">
                <Avatar
                  size="small"
                  style={{
                    backgroundColor: user.color,
                    marginRight: 12,
                    fontWeight: "bold"
                  }}
                >
                  {user.initials}
                </Avatar>
                <Text className="text-sm font-medium">
                  {user.name || user.email || "Unassigned"}
                </Text>
              </div>
              <div className="w-3/5">
                <DistributionBar percentage={user.percentage} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};


/* --- PriorityDistribution --- */
const PriorityDistribution = ({ tasks, stories, bugs }) => {
  const preparePriorityData = () => {
    const allPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL", "UNSPECIFIED"];
    const dataMap = new Map(allPriorities.map(p => [p, { priority: p, Tasks: 0, Stories: 0, Bugs: 0 }]));

    const allItems = [
      ...tasks.map(item => ({ ...item, type: 'Tasks' })),
      ...stories.map(item => ({ ...item, type: 'Stories' })),
      ...bugs.map(item => ({ ...item, type: 'Bugs' })),
    ];

    allItems.forEach(item => {
      const p = item.priority?.toUpperCase() || "UNSPECIFIED";
      if (dataMap.has(p) && item.type) {
        dataMap.get(p)[item.type]++;
      }
    });

    return Array.from(dataMap.values()).filter(entry => entry.Tasks > 0 || entry.Stories > 0 || entry.Bugs > 0);
  };

  const data = preparePriorityData();

  const CustomPriorityTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-2 bg-indigo-900 text-white text-sm rounded-lg shadow-lg"
        >
          <p className="font-bold text-sm mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {entry.value}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  if (!data.length) return null;

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card
        title={<Title level={4} className="!mb-0 font-bold">Priority Distribution</Title>}
        className="shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        styles={{
        header:{ marginBottom: 0,borderBottom: "none", paddingBottom: 0 },
        body:{ padding: 40, paddingTop: 0 }
        }}
      >
        <Text type="secondary" className="block mb-3 text-sm uppercase tracking-wide font-semibold">Breakdown by priority</Text>

        <div className="w-full" >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 8, right: 10, left: 8, bottom: 6 }} barGap={6} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79, 70, 229, 0.06)" />
              <XAxis dataKey="priority" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} />
              <RechartsTooltip content={<CustomPriorityTooltip />} cursor={{ fill: 'rgba(79, 70, 229, 0.03)' }} />
              <Legend wrapperStyle={{ paddingTop: 6, fontWeight: 600, fontSize: 13 }} />
              <Bar dataKey="Tasks" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={28} />
              <Bar dataKey="Stories" fill="#7c3aed" radius={[6, 6, 0, 0]} barSize={28} />
              <Bar dataKey="Bugs" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};

/* --- Main Summary Component (compact, single page scroll) --- */
const Summary = ({ projectId, projectName }) => {
  const [projectData, setProjectData] = useState({
    epics: [],
    stories: [],
    tasks: [],
    bugs: [],
    statuses: [],
    users: [],
    stage: "INITIATION",
  });
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const base = import.meta.env.VITE_PMS_BASE_URL;

        const [projRes, epicRes, storyRes, taskRes, bugRes, statusRes, userRes] = await Promise.all([
          axios.get(`${base}/api/projects/${projectId}`, { headers }),
          axios.get(`${base}/api/projects/${projectId}/epics`, { headers }),
          axios.get(`${base}/api/projects/${projectId}/stories`, { headers }),
          axios.get(`${base}/api/projects/${projectId}/tasks`, { headers }),
          axios.get(`${base}/api/bugs/project/${projectId}`, { headers }),
          axios.get(`${base}/api/projects/${projectId}/statuses`, { headers }),
          axios.get(`${base}/api/projects/${projectId}/members`, { headers }),
        ]);

        setProjectData({
          epics: epicRes.data || [],
          stories: storyRes.data || [],
          tasks: taskRes.data || [],
          bugs: bugRes.data || [],
          statuses: statusRes.data || [],
          users: userRes.data || [],
          stage: projRes.data?.currentStage || "INITIATION",
        });
      } catch (err) {
        console.error("Failed to fetch project summary:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && token) {
      fetchAll();
    } else {
      // If no projectId or token, stop loading to show empty state
      setLoading(false);
    }
  }, [projectId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full" style={{ minHeight: "220px" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        >
          <Spin size="large" tip="Loading Project Summary..." />
        </motion.div>
      </div>
    );
  }

  const allWorkItems = [...projectData.tasks, ...projectData.stories, ...projectData.bugs];

  return (
    <motion.div
      className="px-6 bg-white mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.36 }}
      style={{ minHeight: "calc(100vh - 120px)" }} // change 120px to match your header/navbar
    >
      {/* Top header row (kept minimal to avoid extra space) */}
      {/* <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <Title level={3} className="!mb-0 !text-gray-800 font-bold">{projectName || "Project"}</Title>
          </div>
          <div>
            <Text type="secondary" className="text-sm">Stage: {projectData.stage}</Text>
          </div>
        
        </div>
      </div> */}

      {/* Section 1: ScopeAndProgress (compact) */}
      <div className="mb-4">
        <ScopeAndProgress
          epics={projectData.epics}
          stories={projectData.stories}
          bugs={projectData.bugs}
          tasks={projectData.tasks}
        />
      </div>

      {/* Section 2: StatusOverview */}
      <div className="mb-4">
        <StatusOverview workItems={allWorkItems} statuses={projectData.statuses} />
      </div>

      {/* Section 3: Bottom grid - these will appear below and page will scroll naturally if needed */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={containerVariants} initial="hidden" animate="visible">
        <div>
          <PriorityDistribution
            tasks={projectData.tasks}
            stories={projectData.stories}
            bugs={projectData.bugs}
          />
        </div>

        <div className="flex flex-col gap-4">
          <TypesOfWork
            tasks={projectData.tasks}
            stories={projectData.stories}
            epics={projectData.epics}
            bugs={projectData.bugs}
          />
          <TeamWorkload workItems={allWorkItems} users={projectData.users} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Summary;
