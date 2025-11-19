import React, { useState, useMemo, useRef } from "react";

const ProjectDonutChart = ({ entries }) => {
  const [hoveredProject, setHoveredProject] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef(null);

  // -------------------------------
  // PREPARE DATA
  // -------------------------------
  const projectData = useMemo(() => {
    const map = {};

    entries.forEach((e) => {
      if (!e) return;
      const project = e.project || "Unknown";

      if (!map[project]) {
        map[project] = {
          name: project,
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0,
        };
      }

      map[project].totalHours += Number(e.hours || 0);
      if (e.type === "Billable") map[project].billableHours += Number(e.hours || 0);
      else map[project].nonBillableHours += Number(e.hours || 0);
    });

    const arr = Object.values(map).sort((a, b) => b.totalHours - a.totalHours);
    const totalHours = arr.reduce((s, p) => s + p.totalHours, 0);

    return arr.map((p) => ({
      ...p,
      percentage: totalHours ? ((p.totalHours / totalHours) * 100).toFixed(1) : 0,
      billablePercentage: p.totalHours
        ? ((p.billableHours / p.totalHours) * 100).toFixed(1)
        : 0,
      nonBillablePercentage: p.totalHours
        ? ((p.nonBillableHours / p.totalHours) * 100).toFixed(1)
        : 0,
    }));
  }, [entries]);

  const colors = [
    { main: "#4f46e5", light: "#818cf8" },
    { main: "#16a34a", light: "#4ade80" },
    { main: "#ea580c", light: "#fb923c" },
    { main: "#0284c7", light: "#38bdf8" },
    { main: "#dc2626", light: "#f87171" },
    { main: "#7c3aed", light: "#a78bfa" },
    { main: "#d97706", light: "#fbbf24" },
    { main: "#059669", light: "#34d399" },
  ];

  // -------------------------------
  // DONUT SEGMENTS
  // -------------------------------
  const donutSegments = useMemo(() => {
    let currentAngle = -90;
    const center = 100;
    const innerR = 50;
    const outerR = 80;

    return projectData.map((project, index) => {
      const angle = (parseFloat(project.percentage) / 100) * 360;
      const endAngle = currentAngle + angle;

      const startRad = (currentAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const midAngle = (currentAngle + endAngle) / 2;
      const midRad = (midAngle * Math.PI) / 180;

      const midX = center + (outerR + 12) * Math.cos(midRad);
      const midY = center + (outerR + 12) * Math.sin(midRad);

      const x1 = center + outerR * Math.cos(startRad);
      const y1 = center + outerR * Math.sin(startRad);
      const x2 = center + outerR * Math.cos(endRad);
      const y2 = center + outerR * Math.sin(endRad);
      const x3 = center + innerR * Math.cos(endRad);
      const y3 = center + innerR * Math.sin(endRad);
      const x4 = center + innerR * Math.cos(startRad);
      const y4 = center + innerR * Math.sin(startRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const path = `
        M ${x1} ${y1}
        A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4}
        Z
      `;

      const seg = {
        project: project.name,
        path,
        color: colors[index % colors.length],
        data: project,
        midX,
        midY,
        midAngle,
      };

      currentAngle = endAngle;
      return seg;
    });
  }, [projectData]);

  const totalHours = projectData.reduce((s, p) => s + p.totalHours, 0);

  // -------------------------------
  // UPDATE TOOLTIP POSITION (B + boundary clamp)
  // -------------------------------
  const updateTooltipPos = (segment) => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const tooltipWidth = 240;

    let left =
      segment.midAngle > 0
        ? segment.midX + 20 // right side
        : segment.midX - tooltipWidth - 20; // left side

    const minLeft = 10; // safe container padding
    const maxLeft = rect.width - tooltipWidth - 10;

    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;

    setTooltipPos({
      x: left,
      y: segment.midY - 40,
    });
  };

  return (
    <div className="donut-chart-container relative" ref={wrapperRef}>
      <h2 className="section-title">Project-wise Hours Distribution</h2>

      <div className="flex gap-8 relative">
        {/* Donut */}
        <div className="relative" style={{ width: "350px", height: "350px" }}>
          <svg width="100%" height="100%" viewBox="0 0 200 200">
            {donutSegments.map((segment, idx) => (
              <path
                key={idx}
                d={segment.path}
                fill={
                  hoveredProject === segment.project
                    ? segment.color.light
                    : segment.color.main
                }
                stroke="white"
                strokeWidth="2"
                opacity={hoveredProject === segment.project ? 1 : 0.85}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => {
                  setHoveredProject(segment.project);
                  updateTooltipPos(segment);
                }}
                onMouseLeave={() => setHoveredProject(null)}
              />
            ))}

            <circle cx="100" cy="100" r="45" fill="white" stroke="#e5e7eb" strokeWidth="2" />
            <text x="100" y="95" textAnchor="middle" fontSize="12" fill="#6b7280" fontWeight="500">
              Total Hours
            </text>
            <text x="100" y="115" textAnchor="middle" fontSize="18" fill="#111827" fontWeight="600">
              {totalHours.toFixed(1)}
            </text>
          </svg>

          {/* Tooltip */}
          {hoveredProject && (
            <div
              className="absolute bg-white shadow-lg rounded-xl p-4 w-60"
              style={{
                top: tooltipPos.y,
                left: tooltipPos.x,
                pointerEvents: "none",
                zIndex: 999,
              }}
            >
              {(() => {
                const p = projectData.find((x) => x.name === hoveredProject);
                const seg = donutSegments.find((x) => x.project === hoveredProject);

                return (
                  <>
                    <div className="flex items-center mb-2">
                      <div
                        className="w-4 h-4 rounded-sm mr-2"
                        style={{ backgroundColor: seg.color.main }}
                      ></div>
                      <h3 className="font-semibold text-gray-800">{hoveredProject}</h3>
                    </div>

                    <div className="text-sm text-gray-700">
                      <div className="mb-2">
                        <strong>Total Hours:</strong> {p.totalHours.toFixed(1)} hrs ({p.percentage}
                        %)
                      </div>

                      <div className="p-2 bg-green-50 border border-green-200 rounded mb-2">
                        <strong>Billable:</strong> {p.billableHours.toFixed(1)} hrs (
                        {p.billablePercentage}%)
                      </div>

                      <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                        <strong>Non-Billable:</strong> {p.nonBillableHours.toFixed(1)} hrs (
                        {p.nonBillablePercentage}%)
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Projects</h3>

          {donutSegments.map((segment, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2 cursor-pointer rounded ${
                hoveredProject === segment.project ? "bg-gray-100" : ""
              }`}
              onMouseEnter={() => {
                setHoveredProject(segment.project);
                updateTooltipPos(segment);
              }}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: segment.color.main }}
              ></div>

              <div className="flex-1">
                <div>{segment.project}</div>
                <div className="text-gray-500 text-sm">
                  {segment.data.totalHours.toFixed(1)} hrs
                </div>
              </div>

              <div className="font-semibold" style={{ color: segment.color.main }}>
                {segment.data.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDonutChart;
