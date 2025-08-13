import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#4c1d95', '#9d174d', '#6366f1', '#10b981', '#f59e0b'];

const ITEMS_PER_PAGE = 5;

const EmployeePerformance = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [expandedEmployees, setExpandedEmployees] = useState(new Set());

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/performance/employees`);
      setData(response.data);
      setFiltered(response.data);
    } catch (error) {
      console.error('Error fetching data', error);
      setData([]);
      setFiltered([]);
    }
  };

  // Search filter handler
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filteredData = data.filter(emp =>
      emp.employeeName.toLowerCase().includes(term) ||
      emp.employeeEmail.toLowerCase().includes(term)
    );
    setFiltered(filteredData);
    setPage(1);
  };

  const toggleExpand = (email) => {
    setExpandedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(email)) newSet.delete(email);
      else newSet.add(email);
      return newSet;
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Chart data mapping
  const getStatusData = () => {
    const statusMap = {};
    filtered.forEach(item => {
      const total = item.totalTasks || 0;
      const completed = item.tasksCompleted || 0;
      const inProgress = item.tasksInProgress || 0;
      const overdue = item.tasksOverdue || 0;
      if (total > 0) {
        statusMap['Total Tasks'] = (statusMap['Total Tasks'] || 0) + total;
        statusMap['Completed'] = (statusMap['Completed'] || 0) + completed;
        statusMap['In Progress'] = (statusMap['In Progress'] || 0) + inProgress;
        statusMap['Overdue'] = (statusMap['Overdue'] || 0) + overdue;
      }
    });
    return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-indigo-900">Employee Performance</h2>

      {/* Search input */}
      <input
        type="search"
        placeholder="Search by employee name or email..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md mb-6 focus:ring focus:ring-indigo-300 focus:outline-none"
        aria-label="Search Employees"
      />

      {/* Table Container */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
        <table className="min-w-full border-collapse text-sm text-left">
          <thead className="bg-indigo-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-semibold border-b border-gray-300">Employee</th>
              <th className="px-4 py-3 font-semibold border-b border-gray-300">Email</th>
              <th className="px-4 py-3 font-semibold border-b border-gray-300">Projects</th>
              <th className="px-4 py-3 font-semibold border-b border-gray-300">Total Tasks</th>
              <th className="px-4 py-3 font-semibold border-b border-gray-300">In Progress</th>
              <th className="px-4 py-3 font-semibold border-b border-gray-300">Completed</th>
              <th className="px-4 py-3 font-semibold border-b border-gray-300">Overdue</th>
              <th className="px-4 py-3 font-semibold border-b border-gray-300">Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No employees found.
                </td>
              </tr>
            ) : (
              paginatedData.map(emp => (
                <tr
                  key={emp.employeeEmail}
                  className="hover:bg-indigo-50 cursor-pointer"
                  tabIndex={0}
                  aria-expanded={expandedEmployees.has(emp.employeeEmail)}
                  aria-controls={`${emp.employeeEmail}-details`}
                >
                  <td className="px-4 py-3 border-b border-gray-200">{emp.employeeName || 'N/A'}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{emp.employeeEmail || 'N/A'}</td>
                  <td className="px-4 py-3 border-b border-gray-200 max-w-xs break-words">
                    {emp.projectNames?.length > 0 ? emp.projectNames.join(', ') : 'No projects'}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200">{emp.totalTasks ?? 0}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{emp.tasksInProgress ?? 0}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{emp.tasksCompleted ?? 0}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{emp.tasksOverdue ?? 0}</td>
                  <td className="px-4 py-3 border-b border-gray-200">
                    {emp.epics?.length > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(emp.employeeEmail);
                        }}
                        className="text-indigo-700 hover:text-indigo-900 underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                        aria-label={`${expandedEmployees.has(emp.employeeEmail) ? 'Collapse' : 'Expand'} epics for ${emp.employeeName}`}
                        aria-expanded={expandedEmployees.has(emp.employeeEmail)}
                      >
                        {expandedEmployees.has(emp.employeeEmail) ? 'Hide' : 'Show'}
                      </button>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center my-6 space-x-3">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Previous page"
        >
          Previous
        </button>
        {[...Array(totalPages).keys()].map(i => {
          const pageNumber = i + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              aria-current={page === pageNumber ? 'page' : undefined}
              className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                page === pageNumber ? 'bg-indigo-700 text-white' : 'bg-white text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Next page"
        >
          Next
        </button>
      </div>

      {/* Expanded Employee Details */}
      {paginatedData.map(emp =>
        expandedEmployees.has(emp.employeeEmail) && emp.epics.length > 0 ? (
          <section
            key={`${emp.employeeEmail}-details`}
            id={`${emp.employeeEmail}-details`}
            className="mb-8 bg-white shadow rounded p-5 max-w-5xl mx-auto"
            aria-label={`Epics details for ${emp.employeeName}`}
          >
            <h3 className="text-xl font-bold mb-4 text-indigo-800">{emp.employeeName}'s Epics</h3>
            {emp.epics.map(epic => (
              <div key={epic.epicId} className="mb-6 border-l-4 border-indigo-600 pl-4">
                <h4 className="font-semibold mb-2 text-indigo-700">{epic.epicName}</h4>
                {epic.stories.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {epic.stories.map(story => (
                      <li key={story.storyId}>
                        <div className="font-semibold mb-1">{story.storyTitle}</div>
                        {story.taskTitles.length > 0 ? (
                          <ul className="list-decimal list-inside ml-6 text-gray-600">
                            {story.taskTitles.map((task, idx) => (
                              <li key={idx} className="italic">{task}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="ml-6 italic text-gray-500">No tasks available</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="italic text-gray-500">No stories available</div>
                )}
              </div>
            ))}
          </section>
        ) : null
      )}

      {/* Charts */}
      <section className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-10">
        <div className="bg-white shadow rounded-lg p-5 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-indigo-900">Task Status - Pie Chart</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                dataKey="value"
                data={getStatusData()}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name }) => name.replace('_', ' ')}
                labelLine={false}
              >
                {getStatusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Tasks']} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => value.replace('_', ' ')}
                wrapperStyle={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-5 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-indigo-900">Task Status - Bar Chart</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={getStatusData()}>
              <XAxis dataKey="name" tick={{ fill: '#4b5563', fontWeight: '600' }} />
              <YAxis tick={{ fill: '#4b5563' }} />
              <Tooltip formatter={(value) => [value, 'Tasks']} />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}
              />
              <Bar dataKey="value" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default EmployeePerformance;