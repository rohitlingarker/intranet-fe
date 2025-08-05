import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, List, KanbanSquare, Rows3, Flag } from 'lucide-react';
import axios from 'axios';

import Summary from './Summary';
import Backlog from './Backlog/Backlog';
import  Board  from './Board';
import SprintBoard from './Sprint/SprintBoard';
import Lists from './lists';

const ProjectTabs = () => {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [selectedTab, setSelectedTab] = useState('summary');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (projectId) {
      axios
        .get(`http://localhost:8080/api/projects/${projectId}`)
        .then((res) => {
          setProjectName(res.data.name);
          setNotFound(false);
        })
        .catch(() => {
          setNotFound(true);
        });
    }
  }, [projectId]);

  const renderTabContent = () => {
    if (!projectId) return null;
    const pid = parseInt(projectId, 10);

    switch (selectedTab) {
      case 'summary':
        return <Summary projectId={pid} projectName={projectName} />;
      case 'backlog':
        return <Backlog projectId={pid} />;
      case 'board':
        return <Board projectId={pid} projectName={projectName} />;
      case 'sprint':
        return <SprintBoard projectId={pid} projectName={projectName} />;
      case 'lists':
        return <Lists projectId={pid} />;
      default:
        return null;
    }
  };

  if (!projectId) {
    return <div className="p-6 text-slate-400">No project selected.</div>;
  }

  if (notFound) {
    return <div className="p-6 text-red-500">Project not found.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header and Tabs */}
      <div className="border-b border-slate-200 p-4 bg-white">
        <h2 className="text-xl font-semibold text-slate-800">{projectName}</h2>

        <div className="mt-4 flex flex-wrap gap-4">
          <TabButton
            label="Summary"
            icon={<BarChart3 size={16} />}
            active={selectedTab === 'summary'}
            onClick={() => setSelectedTab('summary')}
          />
          <TabButton
            label="Backlog"
            icon={<List size={16} />}
            active={selectedTab === 'backlog'}
            onClick={() => setSelectedTab('backlog')}
          />
          <TabButton
            label="Board"
            icon={<KanbanSquare size={16} />}
            active={selectedTab === 'board'}
            onClick={() => setSelectedTab('board')}
          />
          <TabButton
            label="Sprints"
            icon={<Flag size={16} />}
            active={selectedTab === 'sprint'}
            onClick={() => setSelectedTab('sprint')}
          />
          <TabButton
            label="Lists"
            icon={<Rows3 size={16} />}
            active={selectedTab === 'lists'}
            onClick={() => setSelectedTab('lists')}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-slate-50 overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Reusable Tab Button component
const TabButton = ({ label, icon, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded transition-colors duration-200
        ${active ? 'bg-indigo-900 text-white' : 'text-slate-600 hover:bg-slate-100'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default ProjectTabs;
