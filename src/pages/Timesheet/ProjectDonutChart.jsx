// ProjectDonutChart.jsx

import React, { useState, useMemo } from 'react';

/**
 * Component for rendering a donut chart showing project-wise hours distribution
 * with billable/non-billable breakdown on hover
 */
const ProjectDonutChart = ({ entries, globalTotalHours }) => {
    const [hoveredProject, setHoveredProject] = useState(null);
    // Calculate project-wise data
    const projectData = useMemo(() => {
        const projectMap = {};

        entries.forEach(entry => {
            // Skip weekends and leaves
            if (entry.type === 'Weekend' || entry.type === 'Leave') return;

            const project = entry.project;
            if (!projectMap[project]) {
                projectMap[project] = {
                    name: project,
                    totalHours: 0,
                    billableHours: 0,
                    nonBillableHours: 0
                };
            }

            projectMap[project].totalHours += entry.hours;
            if (entry.type === 'Billable') {
                projectMap[project].billableHours += entry.hours;
            } else if (entry.type === 'Non-Billable') {
                projectMap[project].nonBillableHours += entry.hours;
            }
        });

        // Convert to array and sort by total hours
        const projectArray = Object.values(projectMap).sort((a, b) => b.totalHours - a.totalHours);

        // Calculate percentages
        const totalHours = projectArray.reduce((sum, p) => sum + p.totalHours, 0);
        
        return projectArray.map(project => ({
            ...project,
            percentage: totalHours > 0 ? ((project.totalHours / totalHours) * 100).toFixed(1) : 0,
            billablePercentage: project.totalHours > 0 
                ? ((project.billableHours / project.totalHours) * 100).toFixed(1) 
                : 0,
            nonBillablePercentage: project.totalHours > 0 
                ? ((project.nonBillableHours / project.totalHours) * 100).toFixed(1) 
                : 0
        }));
    }, [entries]);

    // Color palette for projects
    const colors = [
        { main: '#4f46e5', light: '#818cf8', dark: '#3730a3' }, // Indigo
        { main: '#16a34a', light: '#4ade80', dark: '#15803d' }, // Green
        { main: '#ea580c', light: '#fb923c', dark: '#c2410c' }, // Orange
        { main: '#0284c7', light: '#38bdf8', dark: '#075985' }, // Sky
        { main: '#dc2626', light: '#f87171', dark: '#991b1b' }, // Red
        { main: '#7c3aed', light: '#a78bfa', dark: '#5b21b6' }, // Violet
        { main: '#d97706', light: '#fbbf24', dark: '#92400e' }, // Amber
        { main: '#059669', light: '#34d399', dark: '#047857' }, // Emerald
    ];

    // Generate donut segments using simpler approach
    const donutSegments = useMemo(() => {
        let currentAngle = -90; // Start from top
        const centerX = 100;
        const centerY = 100;
        const innerRadius = 50;
        const outerRadius = 80;

        return projectData.map((project, index) => {
            const angle = (parseFloat(project.percentage) / 100) * 360;
            const endAngle = currentAngle + angle;
            
            // Calculate start and end points
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
                'Z'
            ].join(' ');
            
            const segment = {
                project: project.name,
                path,
                color: colors[index % colors.length],
                data: project
            };
            
            currentAngle = endAngle;
            return segment;
        });
    }, [projectData, colors]);

    const totalHours = projectData.reduce((sum, p) => sum + p.totalHours, 0);

    if (projectData.length === 0) {
        return (
            <div className="donut-chart-container">
                <h2 className="section-title">Project-wise Hours Distribution</h2>
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                    No project data available
                </p>
            </div>
        );
    }

    return (
        <div className="donut-chart-container">
            <h2 className="section-title">Project-wise Hours Distribution</h2>
            
            <div className="donut-chart-grid flex justify-between items-center gap-8">
                {/* Donut Chart */}
                <div className="donut-chart-wrapper flex-1 flex justify-center items-center relative">
                    <svg 
                        width="100%" 
                        height="100%" 
                        viewBox="0 0 200 200"
                        className="donut-svg"
                    >
                        {donutSegments.map((segment, index) => (
                            <path
                            key={index}
                            d={segment.path}
                            fill={hoveredProject === segment.project ? segment.color.light : segment.color.main}
                            stroke="white"
                            strokeWidth="2"
                            className="donut-segment transition-transform duration-300"
                            // 🟢 This creates the upward “lift” effect on hover 
                            transform={
                                hoveredProject === segment.project
                                ? `translate(${5 * Math.cos(((segment.data.percentage / 100) * 360 / 2) * Math.PI / 180)}, ${5 * Math.sin(((segment.data.percentage / 100) * 360 / 2) * Math.PI / 180)})`
                                : ''
                            }
                            onMouseEnter={() => setHoveredProject(segment.project)}
                            onMouseLeave={() => setHoveredProject(null)}
                            />
                        ))}

                        {/* Center circle with total hours */}
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
                            {globalTotalHours ? globalTotalHours : 0} hrs
                        </text>
                    </svg>

                    {/* Hover Info Box */}
                    {hoveredProject && (
                        <div className="donut-hover-info">
                            {(() => {
                                const project = projectData.find(p => p.name === hoveredProject);
                                const segment = donutSegments.find(s => s.project === hoveredProject);
                                return (
                                    <>
                                        <div className="donut-hover-header">
                                            <div 
                                                className="donut-hover-color"
                                                style={{ backgroundColor: segment.color.main }}
                                            ></div>
                                            <h3 className="donut-hover-title">
                                                {hoveredProject}
                                            </h3>
                                        </div>
                                        
                                        <div className="donut-hover-details">
                                            <div className="donut-hover-item donut-hover-total">
                                                <span className="donut-hover-label">Total Hours:</span>
                                                <span className="donut-hover-value">
                                                    {project.totalHours.toFixed(1)} hrs ({project.percentage}%)
                                                </span>
                                            </div>
                                            
                                            <div className="donut-hover-item donut-hover-billable">
                                                <span className="donut-hover-label">Billable:</span>
                                                <span className="donut-hover-value">
                                                    {project.billableHours.toFixed(1)} hrs ({project.billablePercentage}%)
                                                </span>
                                            </div>
                                            
                                            <div className="donut-hover-item donut-hover-nonbillable">
                                                <span className="donut-hover-label">Non-Billable:</span>
                                                <span className="donut-hover-value">
                                                    {project.nonBillableHours.toFixed(1)} hrs ({project.nonBillablePercentage}%)
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="donut-legend flex-1">
                    <h3 className="donut-legend-title">Projects</h3>
                    <div className="donut-legend-items">
                        {donutSegments.map((segment, index) => (
                            <div
                                key={index}
                                className={`donut-legend-item ${hoveredProject === segment.project ? 'donut-legend-item-active' : ''}`}
                                onMouseEnter={() => setHoveredProject(segment.project)}
                                onMouseLeave={() => setHoveredProject(null)}
                            >
                                <div 
                                    className="donut-legend-color"
                                    style={{ backgroundColor: segment.color.main }}
                                ></div>
                                <div className="donut-legend-content">
                                    <div className="donut-legend-name">
                                        {segment.project}
                                    </div>
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