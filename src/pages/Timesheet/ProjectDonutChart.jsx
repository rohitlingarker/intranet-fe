import React, { useState, useMemo } from "react";

/**
 * Donut chart with project-wise hours and billable breakdown
 */
const ProjectDonutChart = ({ entries }) => {
  const [hoveredProject, setHoveredProject] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ side: "right" });
  const projectData = useMemo(() => {
    const projectMap = {};
    entries.forEach((entry) => {
      if (!entry) return;
      const project = entry.project || "Unknown";
      if (!projectMap[project]) {
        projectMap[project] = {
          name: project,
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0,
        };
      }
      projectMap[project].totalHours += Number(entry.hours || 0);
      if (entry.type === "Billable") {
        projectMap[project].billableHours += Number(entry.hours || 0);
      } else if (entry.type === "Non-Billable") {
        projectMap[project].nonBillableHours += Number(entry.hours || 0);
      }
    });

    const projectArray = Object.values(projectMap).sort(
      (a, b) => b.totalHours - a.totalHours
    );
    const totalHours = projectArray.reduce((sum, p) => sum + p.totalHours, 0);
    return projectArray.map((p) => ({
      ...p,
      percentage:
        totalHours > 0 ? ((p.totalHours / totalHours) * 100).toFixed(1) : 0,
      billablePercentage:
        p.totalHours > 0
          ? ((p.billableHours / p.totalHours) * 100).toFixed(1)
          : 0,
      nonBillablePercentage:
        p.totalHours > 0
          ? ((p.nonBillableHours / p.totalHours) * 100).toFixed(1)
          : 0,
    }));
  }, [entries]);

  const colors = [
    { main: "#4f46e5", light: "#818cf8", dark: "#3730a3" },
    { main: "#16a34a", light: "#4ade80", dark: "#15803d" },
    { main: "#ea580c", light: "#fb923c", dark: "#c2410c" },
    { main: "#0284c7", light: "#38bdf8", dark: "#075985" },
    { main: "#dc2626", light: "#f87171", dark: "#991b1b" },
    { main: "#7c3aed", light: "#a78bfa", dark: "#5b21b6" },
    { main: "#d97706", light: "#fbbf24", dark: "#92400e" },
    { main: "#059669", light: "#34d399", dark: "#047857" },
  ];

  const donutSegments = useMemo(() => {
    let currentAngle = -90;
    const centerX = 100;
    const centerY = 100;
    const innerRadius = 50;
    const outerRadius = 80;

    return projectData.map((project, index) => {
      const angle = (parseFloat(project.percentage) / 100) * 360;
      const endAngle = currentAngle + angle;

      const startRad = (currentAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + outerRadius * Math.cos(startRad);
      const y1 = centerY + outerRadius * Math.sin(startRad);
      const x2 = centerX + outerRadius * Math.cos(endRad);
      const y2 = centerY + outerRadius * Math.sin(endRad);
      const x3 = centerX + innerRadius * Math.cos(endRad);
      const y3 = centerY + innerRadius * Math.sin(endRad);
      const x4 = centerX + innerRadius * Math.cos(startRad);
      const y4 = centerY + innerRadius * Math.sin(startRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const path = [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        "Z",
      ].join(" ");

      const segment = {
        project: project.name,
        path,
        color: colors[index % colors.length],
        data: project,
        startAngle: currentAngle,
        endAngle,
      };

      currentAngle = endAngle;
      return segment;
    });
  }, [projectData]);

  const totalHours = projectData.reduce((sum, p) => sum + p.totalHours, 0);

  if (projectData.length === 0) {
    return (
      <div className="donut-chart-container">
        <h2 className="section-title">Project-wise Hours Distribution</h2>
        <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
          No project data available
        </p>
      </div>
    );
  }

  return (
    <div className="donut-chart-container">
      <h2 className="section-title">Project-wise Hours Distribution</h2>

      <div className="donut-chart-grid flex justify-between items-center gap-8">
        <div className="donut-chart-wrapper flex-1 flex justify-center items-center relative">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 200"
            className="donut-svg"
          >
            {donutSegments.map((segment, index) => {
              const midAngle = (segment.startAngle + segment.endAngle) / 2;
              const dx = 5 * Math.cos((midAngle * Math.PI) / 180);
              const dy = 5 * Math.sin((midAngle * Math.PI) / 180);
              return (
                <path
                  key={index}
                  d={segment.path}
                  fill={
                    hoveredProject === segment.project
                      ? segment.color.light
                      : segment.color.main
                  }
                  stroke="white"
                  opacity={hoveredProject === segment.project ? 1 : 0.85}
                  strokeWidth={hoveredProject === segment.project ? "3" : "2"}
                  className="donut-segment transition-all duration-300"
                  onMouseEnter={() => {
                    setHoveredProject(segment.project);

                    const midAngle =
                      (segment.startAngle + segment.endAngle) / 2;

                    if (midAngle > -90 && midAngle < 90) {
                      // Right side of donut (0° is rightmost)
                      setTooltipPos({ side: "right" });
                    } else {
                      // Left side of donut
                      setTooltipPos({ side: "left" });
                    }
                  }}
                  onMouseLeave={() => setHoveredProject(null)}
                />
              );
            })}

            <circle
              cx="100"
              cy="100"
              r="45"
              fill="white"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            <text
              x="100"
              y="95"
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
              fontWeight="500"
            >
              Total Hours
            </text>
            <text
              x="100"
              y="115"
              textAnchor="middle"
              fontSize="18"
              fill="#111827"
              fontWeight="500"
            >
              {totalHours.toFixed(1)}
            </text>
          </svg>

          {hoveredProject && (
            <div className={`donut-hover-info ${tooltipPos.side === "left" ? "tooltip-left" : "tooltip-right"}`}>
              {(() => {
                const project = projectData.find(
                  (p) => p.name === hoveredProject
                );
                const segment = donutSegments.find(
                  (s) => s.project === hoveredProject
                );
                return (
                  <>
                    <div className="donut-hover-header">
                      <div
                        className="donut-hover-color"
                        style={{ backgroundColor: segment.color.main }}
                      />
                      <h3 className="donut-hover-title">{hoveredProject}</h3>
                    </div>

                    <div className="donut-hover-details">
                      <div className="donut-hover-item donut-hover-total">
                        <span className="donut-hover-label">Total Hours:</span>
                        <span className="donut-hover-value">
                          {project.totalHours.toFixed(1)} hrs (
                          {project.percentage}%)
                        </span>
                      </div>

                      <div className="donut-hover-item donut-hover-billable">
                        <span className="donut-hover-label">Billable:</span>
                        <span className="donut-hover-value">
                          {project.billableHours.toFixed(1)} hrs (
                          {project.billablePercentage}%)
                        </span>
                      </div>

                      <div className="donut-hover-item donut-hover-nonbillable">
                        <span className="donut-hover-label">Non-Billable:</span>
                        <span className="donut-hover-value">
                          {project.nonBillableHours.toFixed(1)} hrs (
                          {project.nonBillablePercentage}%)
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        <div className="donut-legend flex-1">
          <h3 className="donut-legend-title">Projects</h3>
          <div className="donut-legend-items">
            {donutSegments.map((segment, index) => (
              <div
                key={index}
                className={`donut-legend-item ${
                  hoveredProject === segment.project
                    ? "donut-legend-item-active"
                    : ""
                }`}
                onMouseEnter={() => setHoveredProject(segment.project)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div
                  className="donut-legend-color"
                  style={{ backgroundColor: segment.color.main }}
                ></div>
                <div className="donut-legend-content">
                  <div className="donut-legend-name">{segment.project}</div>
                  <div className="donut-legend-hours">
                    {segment.data.totalHours.toFixed(1)} hrs
                  </div>
                </div>
                <div
                  className="donut-legend-percentage"
                  style={{ color: segment.color.dark }}
                >
                  {segment.data.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDonutChart;
