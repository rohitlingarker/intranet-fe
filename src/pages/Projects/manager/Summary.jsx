"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Sector,
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
// Added Tooltip from antd
import { Card, Avatar, Typography, Spin, Tooltip } from "antd"; 
import LoadingSpinner from "../../../components/LoadingSpinner";
import { motion, AnimatePresence, useInView } from "framer-motion";
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

const DASHBOARD_COLORS = [
  "#4f46e5", // Indigo 600
  "#7c3aed", // Purple 600
  "#0d9488", // Teal 600
  "#db2777", // Pink 600
  "#ea580c", // Orange 600
  "#2563eb", // Blue 600
  "#be185d", // Fuchsia 700
  "#65a30d", // Lime 600
  "#0891b2", // Cyan 600
  "#c026d3", // Fuchsia 600
  "#d97706", // Amber 600
  "#4338ca", // Indigo 700
];

/* --- DistributionBar: slim compact -- */
const DistributionBar = ({ percentage, count, total, isInteractive = true }) => {
  const percentLabel = `${Math.round(percentage)}%`;
  const tooltipTitle = `${count} / ${total} items`;

  const bar = (
    <div className={`w-full bg-gray-200 rounded h-4 flex items-center ${isInteractive ? 'cursor-pointer' : ''}`}>
        <motion.div
          className="bg-gray-600 h-4 rounded flex items-center px-2 text-xs text-white font-semibold origin-left"
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          whileHover={isInteractive ? { scaleY: 1.2 } : {}}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span>{percentLabel}</span>
        </motion.div>
      </div>
  );

  return isInteractive ? <Tooltip title={tooltipTitle}>{bar}</Tooltip> : bar;
};

/* --- Scope & Progress (compact) --- */
const ScopeAndProgress = ({ epics, stories, bugs, tasks, statuses }) => {
  const allWorkItems = [...stories, ...tasks, ...bugs];
  const totalItems = allWorkItems.length;

  const doneStatusId = React.useMemo(() => {
    if (!statuses || statuses.length === 0) {
      return null;
    }
    // The "done" status is the one with the highest sortOrder
    const doneStatus = statuses.reduce(
      (max, status) => (status.sortOrder > max.sortOrder ? status : max),
      statuses[0]
    );
    return doneStatus?.id;
  }, [statuses]);

  const completedItems = allWorkItems.filter(
    (item) => {
      if (doneStatusId) {
        return item.status?.id === doneStatusId;
      }
      // Fallback to original logic if statuses aren't available
      return item.status?.name?.toLowerCase() === "done";
    }
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
        body:{ padding: "0 24px 24px 24px" }
        }}
      >
        {/* compact grid: left stat column + right donut */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap- items-center">
          {/* Left: small stat tiles stacked */}
          <div className="grid grid-cols-4 gap-3">
  {statItems.map((item) => (
    <div 
      key={item.name} 
      className="bg-gray-50 rounded p-3 flex flex-col items-center justify-center transition-all duration-200 hover:bg-gray-100 hover:-translate-y-0.5"
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

// A simple status bar for the StatusOverview component
const StatusBar = ({ percentage, color }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <motion.div
      className="h-2 rounded-full"
      style={{ backgroundColor: color }}
      initial={{ width: 0 }}
      whileInView={{ width: `${percentage}%` }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    />
  </div>
);

/* --- StatusOverview --- */
const StatusOverview = ({ workItems, statuses }) => {
  const [chartData, setChartData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isPieHovered, setIsPieHovered] = useState(false);
  const totalItems = workItems.length;

  useEffect(() => {
    const statusMap = new Map(statuses.map(s => [s.id, { ...s, count: 0 }]));
    workItems.forEach(item => {
      if (item.status && statusMap.has(item.status.id)) {
        statusMap.get(item.status.id).count++;
      }
    });
    const data = Array.from(statusMap.values())
      .sort((a, b) => a.sortOrder - b.sortOrder) // Sort by status order
      .map((status, index) => ({
        name: status.name,
        value: status.count,
        percentage: totalItems > 0 ? (status.count / totalItems) * 100 : 0,
        color: DASHBOARD_COLORS[index % DASHBOARD_COLORS.length],
      }));
    setChartData(data);
  }, [workItems, statuses]);

  const onPieClick = (data, index) => {
    setActiveIndex(activeIndex === index ? null : index);
    setHoveredIndex(null); // Stop hovering when a slice is clicked
  };

  const onPieEnter = (_, index) => {
    setIsPieHovered(true);
    setHoveredIndex(index);
  };

  const onPieLeave = () => {
    setIsPieHovered(false);
    setHoveredIndex(null);
  };

  // Custom shape for the hovered/active slice to make it "zoom"
  const ActiveSliceShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, ...rest } = props;

    return (
      <g>
        <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="#374151" className="font-bold text-base">
          {payload.name}
        </text>
        <motion.g
          initial={{ scale: 1 }}
          animate={{ scale: 1.07 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <Sector
            {...rest} cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius}
            startAngle={startAngle} endAngle={endAngle} fill={fill}
          />
        </motion.g>
      </g>
    );
  };

  if (!totalItems && chartData.every(d => d.value === 0)) return null;

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card
        title={<Title level={4} className="!mb-0 font-bold">Status overview</Title>}
        className="shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        styles={{
        header:{ marginBottom: 0,borderBottom: "none", paddingBottom: 0 },
        body:{ padding: "0 32px 32px 32px" }
        }}
      >
        <Text type="secondary" className="block mb-6 text-sm">
                Get a snapshot of the status of your work items.
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="relative h-64 min-h-0">
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
                    onClick={onPieClick}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    activeIndex={activeIndex !== null ? activeIndex : hoveredIndex}
                    activeShape={isPieHovered || activeIndex !== null ? <ActiveSliceShape /> : undefined}
               >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.value > 0 ? entry.color : "#f3f4f6"}
                      style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                      opacity={
                        (activeIndex !== null && activeIndex !== index) || (hoveredIndex !== null && hoveredIndex !== index) ? 0.4 : 1
                      }
                    />
                  ))}
                </Pie> 
              </PieChart>
            </ResponsiveContainer>
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: isPieHovered || activeIndex !== null ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Title level={4} className="!mb-0 font-bold">{totalItems}</Title>
              <Text type="secondary" className="text-xs font-semibold">Total work items</Text>
            </motion.div>
          </div>

          <div className="space-y-3 self-center w-full" onMouseLeave={() => setHoveredIndex(null)}>
            {chartData.map((item, index) => (
              <div 
                key={item.name} 
                onMouseEnter={() => setHoveredIndex(index)}
                onClick={() => onPieClick(item, index)}
                className={`p-2 -m-1 rounded-md transition-all duration-200 cursor-pointer ${
                  activeIndex === index ? 'bg-indigo-50 scale-[1.02]' :
                  hoveredIndex === index ? 'bg-gray-100 scale-[1.02]' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.value > 0 ? item.color : "#f3f4f6" }} />
                    <Text className="text-m font-medium ml-2">{item.name}</Text>
                  </div>
                  <Text type="secondary" className="text-m font-semibold">{item.value} ({Math.round(item.percentage)}%)</Text>
                </div>
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
    <motion.div variants={itemVariants}>
      <Card
        title={<Title level={4} className="!mb-0 font-bold">Types of work</Title>}
        className="shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        styles={{
          header: { marginBottom: 0, borderBottom: "none", paddingBottom: 0 },
          body: { padding: "0 32px 32px 32px" }
        }}
      >
        <Text type="secondary" className="block mb-6 text-sm">
          Get a breakdown of work items by their types.
        </Text>

        <div className="flex justify-between mb-2">
          <Text strong className="text-gray-500 w-2/5 text-xs">Type</Text>
          <Text strong className="text-gray-500 w-3/5 text-xs">Distribution</Text>
        </div>

        <div className="space-y-3">
          {workTypes.map((type) => {
            const percentage =
              totalItems > 0 ? (type.items.length / totalItems) * 100 : 0;

            // ALWAYS show the row, even if count is 0
            return (
              <div key={type.name} className="flex items-center p-1 -m-1 rounded-md transition-colors hover:bg-gray-50">
                <div className="w-2/5 flex items-center">
                  <span className="mr-3 text-lg">{type.icon}</span>
                  <Text className="text-sm font-medium">
                    {type.name} ({type.items.length})
                  </Text>
                </div>
                <div className="w-3/5">
                  <DistributionBar 
                    percentage={percentage} 
                    count={type.items.length} 
                    total={totalItems} 
                  />
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
        color: user.id ? DASHBOARD_COLORS[index % DASHBOARD_COLORS.length] : "#9ca3af"
      };
    });

    setWorkloadData(data);
  }, [workItems, users]);

  if (!totalItems) return null;

  return (
    <motion.div variants={itemVariants}>
      <Card
        title={
          <Title level={4} className="!mb-0 font-bold">
            Team workload
          </Title>
        }
        className="shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        styles={{
          header: { marginBottom: 0, borderBottom: "none", paddingBottom: 0 },
          body: { padding: "0 32px 32px 32px" }
        }}
      >
        <Text type="secondary" className="block !mt-0 !mb-6 text-sm">
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
            <div key={user.name} className="flex items-center p-1 -m-1 rounded-md transition-colors hover:bg-gray-50">
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
                <DistributionBar 
                  percentage={user.percentage} 
                  count={user.count}
                  total={totalItems}
                  isInteractive={false} 
                />
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
      ...(tasks || []).map(item => ({ ...item, type: 'Tasks' })),
      ...(stories || []).map(item => ({ ...item, type: 'Stories' })),
      ...(bugs || []).map(item => ({ ...item, type: 'Bugs' })),
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
  const ref = React.useRef(null);
  // Animate only when the component is in view
  const isInView = useInView(ref, { once: true, amount: 0.5 });

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
    <motion.div ref={ref} variants={itemVariants} className="h-full">
      <Card
        title={<Title level={4} className="!mb-0 font-bold">Priority Distribution</Title>}
        className="shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 h-full flex flex-col"
        styles={{
        header:{ marginBottom: 0,borderBottom: "none", paddingBottom: 0 },
        body:{ padding: "0 32px 32px 32px", flex: '1 1 auto', display: 'flex', flexDirection: 'column' }
        }}
      >
        <Text type="secondary" className="block mb-6 text-sm uppercase tracking-wide font-semibold">Breakdown by priority</Text>

        <div className="w-full flex-grow min-h-0" >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 10, left: 8, bottom: 6 }} barGap={6} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79, 70, 229, 0.06)" />
              <XAxis dataKey="priority" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} />
              <RechartsTooltip content={<CustomPriorityTooltip />} cursor={{ fill: 'rgba(79, 70, 229, 0.03)' }} />
              <Legend wrapperStyle={{ paddingTop: 6, fontWeight: 600, fontSize: 13 }} />
              <Bar dataKey="Tasks" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={28} animationDuration={isInView ? 800 : 0} />
              <Bar dataKey="Stories" fill="#7c3aed" radius={[6, 6, 0, 0]} barSize={28} animationDuration={isInView ? 800 : 0} animationDelay={100} />
              <Bar dataKey="Bugs" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={28} animationDuration={isInView ? 800 : 0} animationDelay={200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};

/* --- [NEW] EpicProgress --- */
// Helper component for the AntD Tooltip content
const EpicTooltipContent = ({ epic }) => (
  <div className="text-xs">
    <Text strong className="text-white text-sm block mb-1">
      {epic.name}
    </Text>
    <div className="flex items-center">
      <span className="w-2.5 h-2.5 bg-green-300 rounded-sm mr-2" />
      <Text className="text-gray-200">Done: {epic.done}</Text>
    </div>
    <div className="flex items-center">
      <span className="w-2.5 h-2.5 bg-blue-300 rounded-sm mr-2" />
      <Text className="text-gray-200">In progress: {epic.inProgress}</Text>
    </div>
    <div className="flex items-center">
      <span className="w-2.5 h-2.5 bg-gray-500 rounded-sm mr-2" />
      <Text className="text-gray-200">To do: {epic.todo}</Text>
    </div>
  </div>
);

const EpicProgress = ({ epics, stories, tasks, bugs }) => {
  const [epicProgressData, setEpicProgressData] = useState([]);

  useEffect(() => {
    const allWorkItems = [...stories, ...tasks, ...bugs];
    
    const processedData = epics.map(epic => {
      // Find all children of this epic
      const children = allWorkItems.filter(
        item => item.epicId === epic.id || item.epic?.id === epic.id
      );
      
      let done = 0;
      let todo = 0;
      let inProgress = 0;

      // Categorize children based on status name
      children.forEach(child => {
        const statusName = child.status?.name?.toLowerCase();
        if (statusName === 'done') {
          done++;
        } else if (statusName === 'to do' || statusName === 'backlog') {
          todo++;
        } else if (statusName) {
          // Any other defined status is "In Progress"
          inProgress++;
        } else {
          // Default to "To Do" if status is missing
          todo++;
        }
      });

      const total = children.length;
      
      // Calculate percentages
      const percentDone = total > 0 ? (done / total) * 100 : 0;
      const percentInProgress = total > 0 ? (inProgress / total) * 100 : 0;
      const percentToDo = total > 0 ? (todo / total) * 100 : 0;

      return {
        ...epic,
        done,
        todo,
        inProgress,
        total,
        percentDone,
        percentInProgress,
        percentToDo,
      };
    });

    // Only show epics that have at least one child item
    setEpicProgressData(processedData.filter(e => e.total > 0));
  }, [epics, stories, tasks, bugs]);

  if (!epicProgressData.length) return null;

  return (
    <motion.div variants={itemVariants}>
      <Card
        title={<Title level={4} className="!mb-0 font-bold">Epic progress</Title>}
        className="shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        styles={{
          header: { marginBottom: 0, borderBottom: "none", paddingBottom: 0 },
          body: { padding: "0 32px 32px 32px" }
        }}
      >
        <Text type="secondary" className="block mb-6 text-sm">
          See how your epics are progressing at a glance.
        </Text>
        
        {/* Legend */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center p-1 -m-1 rounded transition-colors hover:bg-gray-100">
            <span className="w-3 h-3 bg-green-600 rounded-sm mr-2" />
            <Text className="text-xs font-semibold">Done</Text>
          </div>
          <div className="flex items-center p-1 -m-1 rounded transition-colors hover:bg-gray-100">
            <span className="w-3 h-3 bg-blue-500 rounded-sm mr-2" />
            <Text className="text-xs font-semibold">In progress</Text>
          </div>
          <div className="flex items-center p-1 -m-1 rounded transition-colors hover:bg-gray-100">
            <span className="w-3 h-3 bg-gray-600 rounded-sm mr-2" />
            <Text className="text-xs font-semibold">To do</Text>
          </div>
        </div>

        {/* Epic List */}
        <div className="space-y-3">
          {epicProgressData.map(epic => (
            <div key={epic.id}>
              <Tooltip 
                title={<EpicTooltipContent epic={epic} />} 
                placement="top"
                arrow={false}
                styles={{
                  popup: {
                    backgroundColor: 'rgba(23, 23, 23, 0.9)', 
                    borderRadius: '6px', 
                    padding: '8px 10px' 
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-1 cursor-default">
                  <FiZap className="text-purple-500" />
                  <Text strong className="text-sm">{epic.key || `EPIC-${epic.id}`}</Text>
                  <Text className="text-sm">{epic.name}</Text>
                </div>
              </Tooltip>
              
              {/* Stacked Progress Bar */}
              <div className="w-full h-6 flex rounded overflow-hidden text-gray-800">
                <motion.div
                  className="bg-green-300 flex items-center justify-center"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${epic.percentDone}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.5 }}
                >
                  {epic.percentDone > 10 && (
                    <span className="text-xs font-semibold px-1">
                      {Math.round(epic.percentDone)}%
                    </span>
                  )}
                </motion.div>
                <motion.div
                  className="bg-blue-300 flex items-center justify-center"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${epic.percentInProgress}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                  viewport={{ once: true, amount: 0.5 }}
                >
                  {epic.percentInProgress > 10 && (
                    <span className="text-xs font-semibold px-1">
                      {Math.round(epic.percentInProgress)}%
                    </span>
                  )}
                </motion.div>
                <motion.div
                  className="bg-gray-500 flex items-center justify-center"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${epic.percentToDo}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  viewport={{ once: true, amount: 0.5 }}
                >
                  {epic.percentToDo > 10 && (
                    <span className="text-xs font-semibold text-white px-1">
                      {Math.round(epic.percentToDo)}%
                    </span>
                  )}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

/* --- Skeleton Loader --- */
const SkeletonBlock = ({ className }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const SummarySkeleton = () => (
  <div className="bg-white mt-2">
    {/* Header Skeleton */}
    <div className="mb-6 px-1">
      <div className="flex items-center justify-between">
        <div>
          <SkeletonBlock className="h-8 w-48 mb-2" />
          <SkeletonBlock className="h-4 w-64" />
        </div>
        <div>
          <SkeletonBlock className="h-7 w-32 rounded-full" />
        </div>
      </div>
    </div>

    {/* ScopeAndProgress Skeleton */}
    <div className="mb-4 p-5 border border-gray-200 rounded-lg">
      <SkeletonBlock className="h-6 w-40 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="grid grid-cols-4 gap-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
        <div className="flex justify-center items-center">
          <SkeletonBlock className="h-36 w-36 rounded-full" />
        </div>
      </div>
    </div>

    {/* StatusOverview Skeleton */}
    <div className="mb-4 p-10 border border-gray-200 rounded-lg">
      <SkeletonBlock className="h-6 w-48 mb-3" />
      <SkeletonBlock className="h-4 w-72 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <SkeletonBlock className="h-64 w-64 rounded-full mx-auto" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-12" />
              </div>
              <SkeletonBlock className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="p-10 border border-gray-200 rounded-lg">
        <SkeletonBlock className="h-6 w-56 mb-8" />
        <SkeletonBlock className="h-60 w-full" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="p-10 border border-gray-200 rounded-lg">
          <SkeletonBlock className="h-6 w-48 mb-8" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
        <div className="p-10 border border-gray-200 rounded-lg">
          <SkeletonBlock className="h-6 w-48 mb-8" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
      </div>
    </div>
  </div>
);


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
          axios.get(`${base}/api/projects/${projectId}/members-with-owner`, { headers }),
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
    return <SummarySkeleton />;
  }

  const allWorkItems = [...projectData.tasks, ...projectData.stories, ...projectData.bugs];

  return (
    <motion.div
      className="bg-white mt-2 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.36 }}
//       style={{ minHeight: "calc(100vh - 120px)" }} // change 120px to match your header/navbar
    >
{/*       Top header row (kept minimal to avoid extra space) */}
      <div className="mb-6 px-1">
  <div className="flex items-center justify-between">
    
    {/* Left: Project Title */}
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
        {projectName || "Project"}
      </h1>
      <p className="text-sm text-slate-500 mt-0.5">
        Overview & progress at a glance
      </p>
    </div>

    {/* Right: Stage Badge */}
    <div>
      <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
        Stage: {projectData.stage}
      </span>
    </div>

  </div>
</div>


      {/* Section 1: ScopeAndProgress (compact) */}
      <div className="mb-4">
        <ScopeAndProgress
          epics={projectData.epics}
          stories={projectData.stories}
          statuses={projectData.statuses}
          bugs={projectData.bugs}
          tasks={projectData.tasks}
        />
      </div>

      {/* Section 2: StatusOverview */}
      <div className="mb-4">
        <StatusOverview workItems={allWorkItems} statuses={projectData.statuses} />
     </div>

      {/* Section 3: Bottom grid - these will appear below and page will scroll naturally if needed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-full">
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
      </div>
      
      {/* Section 4: Epic Progress (NEW) */}
      <div className="my-4">
        <EpicProgress
          epics={projectData.epics}
          stories={projectData.stories}
          tasks={projectData.tasks}
          bugs={projectData.bugs}
         />
      </div>
    </motion.div>
  );
};

export default Summary;