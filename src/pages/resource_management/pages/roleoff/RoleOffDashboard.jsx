import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Download, AlertTriangle, Zap, TrendingUp, Activity, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { getFilteredRoleOffs, exportRoleOffsCsv } from "../../services/roleOffService";
import { searchClients } from "../../services/clientservice";
import { getProjects } from "../../services/projectService";
import Modal from "../../../../components/Modal/modal";

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];

const RoleOffDashboard = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [data, setData] = useState({
    totalRoleOffs: 0,
    filteredEvents: [],
    reasonBreakdown: {},
    riskMetrics: {
      riskScore: 0,
      riskLevel: "LOW",
    },
    riskAlerts: [],
    hasHighRiskPatterns: false
  });

  const getPresentMonthDates = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const pad = (n) => n.toString().padStart(2, '0');
    const formatDateLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    return {
      start: formatDateLocal(firstDay),
      end: formatDateLocal(lastDay)
    };
  };

  const defaultDates = getPresentMonthDates();

  const [filters, setFilters] = useState({
    startDate: defaultDates.start,
    endDate: defaultDates.end,
    project: "",
    client: "",
    reason: ""
  });

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [clientsList, setClientsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchDropdownData = async () => {
    try {
      const [clientsData, projectsData] = await Promise.all([
        searchClients({ search: "", region: "", type: "", priority: "", status: "", startDate: "", endDate: "" }, 0, 1000),
        getProjects({ page: 0, size: 1000 })
      ]);
      
      const clients = Array.isArray(clientsData?.data?.records) ? clientsData.data.records : 
                     (Array.isArray(clientsData?.data) ? clientsData.data : (clientsData || []));
      
      const projects = Array.isArray(projectsData?.data?.content) ? projectsData.data.content : 
                      (Array.isArray(projectsData?.data) ? projectsData.data : (projectsData || []));
      
      setClientsList(clients);
      setProjectsList(projects);
    } catch (error) {
      console.error("Failed to load dropdown options", error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Build API payload
      const payload = {};
      if (filters.startDate) payload.startDate = filters.startDate;
      if (filters.endDate) payload.endDate = filters.endDate;
      if (filters.project) payload.projectIds = [parseInt(filters.project)]; // Mock ID handling
      if (filters.client) payload.clientIds = [filters.client];
      if (filters.reason) payload.reasons = [filters.reason];

      const response = await getFilteredRoleOffs(payload);
      setData(response);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch role-off report data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const payload = {};
      if (filters.startDate) payload.startDate = filters.startDate;
      if (filters.endDate) payload.endDate = filters.endDate;
      if (filters.project) payload.projectIds = [parseInt(filters.project)];
      if (filters.client) payload.clientIds = [filters.client];
      if (filters.reason) payload.reasons = [filters.reason];

      const blob = await exportRoleOffsCsv(payload);

      // Download blob
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `role-off-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const formatReasonData = (breakdown) => {
    if (!breakdown) return [];
    return Object.keys(breakdown).map(key => ({
      name: key,
      value: breakdown[key]
    }));
  };

  const getProjectData = (events) => {
    if (!events) return [];
    const projCount = {};
    events.forEach(e => {
      const p = e.projectName || 'Unknown';
      projCount[p] = (projCount[p] || 0) + 1;
    });
    return Object.keys(projCount).map(k => ({
      name: k,
      value: projCount[k]
    })).sort((a,b) => b.value - a.value).slice(0, 10);
  };

  const getTrendData = (events, startDateStr, endDateStr) => {
    const start = startDateStr ? new Date(startDateStr) : new Date(new Date().setMonth(new Date().getMonth() - 11));
    const end = endDateStr ? new Date(endDateStr) : new Date();
    
    const months = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endLimit = new Date(end.getFullYear(), end.getMonth(), 1);
    
    // Safety break (max 60 months) to avoid infinite loops
    let safeGuard = 0;
    while(current <= endLimit && safeGuard < 60) {
      const monthStr = current.toLocaleString('en-US', { month: 'short' });
      const yearStr = current.getFullYear().toString().slice(-2);
      months.push({
        name: `${monthStr} ${yearStr}`,
        events: 0
      });
      current.setMonth(current.getMonth() + 1);
      safeGuard++;
    }
    
    if (events) {
      events.forEach(e => {
        if (!e.effectiveRoleOffDate) return;
        const date = new Date(e.effectiveRoleOffDate);
        const monthStr = date.toLocaleString('en-US', { month: 'short' });
        const yearStr = date.getFullYear().toString().slice(-2);
        const key = `${monthStr} ${yearStr}`;
        const found = months.find(m => m.name === key);
        if (found) {
          found.events += 1;
        }
      });
    }
    
    return months;
  };

  const pieData = formatReasonData(data.reasonBreakdown);
  const barData = getProjectData(data.filteredEvents);
  const trendData = getTrendData(data.filteredEvents, filters.startDate, filters.endDate);

  // Calculate distinct projects affected
  const projectsAffected = barData.length;
  
  const getEntityName = (alert) => {
    if (alert.affectedProjects && alert.affectedProjects.length > 0) {
      return alert.affectedProjects.join(", ");
    }
    if (alert.affectedResources && alert.affectedResources.length > 0) {
      return alert.affectedResources.join(", ");
    }
    return null;
  };

  const displayedEvents = data.filteredEvents?.filter(e => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (e.resourceName?.toLowerCase() || '').includes(term) ||
      (e.projectName?.toLowerCase() || '').includes(term) ||
      (e.roleOffReason?.toLowerCase() || '').includes(term);
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#081534]">Role-Off Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Track and analyze resource role-off events</p>
        </div>
        <div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-md bg-[#081534] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#10214f] disabled:opacity-70"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Total Role-Offs</h3>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-md">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#081534]">{data.totalRoleOffs || 0}</div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-gray-600">High Risk Patterns</h3>
            <div className={`p-2 rounded-md ${data.hasHighRiskPatterns ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className={`text-3xl font-bold ${data.hasHighRiskPatterns ? 'text-red-600' : 'text-[#081534]'}`}>
            {data.riskAlerts?.length || 0}
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Projects Affected</h3>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-md">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#081534]">{projectsAffected}</div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Risk Score</h3>
            <div className={`p-2 rounded-md ${data.riskMetrics?.riskLevel === 'HIGH' || data.riskMetrics?.riskLevel === 'CRITICAL' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
              }`}>
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#081534]">
            {data.riskMetrics?.riskScore || 0}
            <span className="text-xs font-normal text-gray-500 ml-2">/ 100</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white border border-gray-200 p-5 mb-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#081534] mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-gray-500 font-semibold mb-1 block">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full text-sm border-gray-300 rounded-md h-9 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold mb-1 block">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full text-sm border-gray-300 rounded-md h-9 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold mb-1 block">Project</label>
            <select name="project" value={filters.project} onChange={handleFilterChange} className="w-full text-sm border-gray-300 rounded-md h-9 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Projects</option>
              {projectsList.map((proj) => (
                <option key={proj.pmsProjectId || proj.id} value={proj.pmsProjectId || proj.id}>
                  {proj.projectName || proj.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold mb-1 block">Client</label>
            <select name="client" value={filters.client} onChange={handleFilterChange} className="w-full text-sm border-gray-300 rounded-md h-9 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Clients</option>
              {clientsList.map((c) => (
                <option key={c.clientId || c.id} value={c.clientId || c.id}>
                  {c.clientName || c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold mb-1 block">Reason</label>
            <select name="reason" value={filters.reason} onChange={handleFilterChange} className="w-full text-sm border-gray-300 rounded-md h-9 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Reasons</option>
              <option value="PROJECT_END">Project End</option>
              <option value="PERFORMANCE">Performance</option>
              <option value="CLIENT_REQUEST">Client Request</option>
              <option value="ATTRITION">Attrition</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="rounded-lg bg-white border border-gray-200 p-5 shadow-sm flex flex-col items-center">
          <h3 className="text-sm font-bold text-[#081534] mb-4 w-full text-left">Role-Off Reasons</h3>
          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white border border-gray-200 p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-[#081534] mb-4">Role-Off Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white border border-gray-200 p-5 mb-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#081534] mb-4">Top Projects by Role-Offs</h3>
        <div className="h-60 w-full">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <RechartsTooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
          )}
        </div>
      </div>

      {data.riskAlerts && data.riskAlerts.length > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-5 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4" /> Systemic Risk Alerts Detected
          </h3>
          <div className="space-y-3">
            {data.riskAlerts.map((alert, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-red-100 shadow-sm flex flex-col">
                <span className="font-semibold text-red-600 text-sm flex items-center gap-2">
                  {alert.type}
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">{alert.severity}</span>
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {getEntityName(alert) && <span className="font-bold text-gray-800 pr-1">{getEntityName(alert)} - </span>}
                  {alert.description}
                </p>
                <p className="text-xs text-gray-500 mt-2 font-medium">Recommendation: {alert.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white border border-gray-200 p-0 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#081534]">Role-Off Events</h3>
          <span className="text-xs text-gray-500">{displayedEvents.length} events</span>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project, resource, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 h-10 border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">Date</th>
                <th className="px-6 py-3 whitespace-nowrap">Resource</th>
                <th className="px-6 py-3 whitespace-nowrap">Project</th>
                <th className="px-6 py-3 whitespace-nowrap">Reason</th>
                <th className="px-6 py-3 whitespace-nowrap">Initiated By</th>
                <th className="px-6 py-3 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="6" className="p-4 text-center text-gray-500 text-sm">Loading...</td></tr>
              ) : displayedEvents.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-gray-500 text-sm">No role-off events found for the selected filters.</td></tr>
              ) : (
                displayedEvents.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {row.effectiveRoleOffDate ? new Date(row.effectiveRoleOffDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-[#081534]">
                      {row.resourceName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {row.projectName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {row.roleOffReason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {row.roleInitiatedBy || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <button 
                        onClick={() => setSelectedEvent(row)} 
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-xs hover:bg-indigo-100 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-Off Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Role-Off Details"
        className="max-w-md"
      >
        {selectedEvent && (() => {
          const getEventRiskLevel = (reason) => {
            switch(reason) {
              case 'PERFORMANCE': return { label: 'High Risk', class: 'bg-red-50 text-red-600 border-red-200' };
              case 'CLIENT_REQUEST': return { label: 'High Risk', class: 'bg-orange-50 text-orange-600 border-orange-200' };
              case 'ATTRITION': return { label: 'Medium Risk', class: 'bg-amber-50 text-amber-600 border-amber-200' };
              case 'PROJECT_END': return { label: 'Low Risk', class: 'bg-green-50 text-green-600 border-green-200' };
              default: return { label: 'Normal', class: 'bg-gray-50 text-gray-600 border-gray-200' };
            }
          };
          const risk = getEventRiskLevel(selectedEvent.roleOffReason);

          return (
          <div className="space-y-5 px-1 py-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.resourceName || 'Unknown Resource'}</h2>
                {/* <p className="text-gray-500 mt-1">{selectedEvent.clientName ? `Client: ${selectedEvent.clientName}` : 'Client: -'}</p> */}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${risk.class}`}>
                {risk.label}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Related Project</span>
                <span className="text-sm text-gray-900 font-semibold text-right flex items-center">
                  {selectedEvent.projectName || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 font-medium">Reason</span>
                <span className="text-sm text-gray-900 font-semibold">{selectedEvent.roleOffReason ? selectedEvent.roleOffReason.replace(/_/g, ' ') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 font-medium">Date</span>
                <span className="text-sm text-gray-900 font-semibold">
                  {selectedEvent.effectiveRoleOffDate ? new Date(selectedEvent.effectiveRoleOffDate).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 font-medium">Initiated By</span>
                <span className="text-sm text-gray-900 font-semibold">
                  {selectedEvent.roleInitiatedBy || '-'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2">
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="w-full bg-[#18181b] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-black transition-colors"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
          );
        })()}
      </Modal>

    </div>
  );
};

export default RoleOffDashboard;
