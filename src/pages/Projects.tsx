import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, Users, AlertCircle } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import CreateProjectModal from '../components/modals/CreateProjectModal';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  deadline: string;
  team: string[];
  progress: number;
  priority: 'Low' | 'Medium' | 'High';
}

const Projects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { showNotification } = useNotification();

  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'Employee Portal Redesign',
      description: 'Complete redesign of the employee self-service portal',
      status: 'Active',
      deadline: '2024-02-15',
      team: ['Sarah Johnson', 'Mike Chen', 'David Wilson'],
      progress: 65,
      priority: 'High'
    },
    {
      id: '2',
      title: 'HR System Integration',
      description: 'Integrate new HR system with existing infrastructure',
      status: 'Active',
      deadline: '2024-03-01',
      team: ['Emily Davis', 'John Administrator'],
      progress: 30,
      priority: 'Medium'
    },
    {
      id: '3',
      title: 'Mobile App Development',
      description: 'Develop mobile app for field employees',
      status: 'Active',
      deadline: '2024-04-20',
      team: ['Mike Chen', 'David Wilson'],
      progress: 15,
      priority: 'High'
    },
    {
      id: '4',
      title: 'Security Audit',
      description: 'Comprehensive security audit of all systems',
      status: 'Completed',
      deadline: '2024-01-10',
      team: ['John Administrator'],
      progress: 100,
      priority: 'High'
    }
  ];

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = (projectData: any) => {
    console.log('Creating project:', projectData);
    showNotification('Project created successfully (mock)');
    setIsCreateModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600">Track projects, deadlines, and team progress</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#263383] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3548b6] transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#263383] focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#263383] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm">{project.description}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <AlertCircle className={`h-4 w-4 ${getPriorityColor(project.priority)}`} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{project.team.length} team member{project.team.length !== 1 ? 's' : ''}</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#263383] h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-2">
                {project.team.slice(0, 3).map((member, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                  >
                    {member}
                  </span>
                ))}
                {project.team.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                    +{project.team.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default Projects;