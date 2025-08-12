import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, List, KanbanSquare } from 'lucide-react';
import axios from 'axios';

import UserSummary from './UserSummary'; // ✅ renamed to match your component
import UserBacklog from './Backlog/userbacklog';
import UserBoard from './userboard';

type TabType = 'summary' | 'backlog' | 'board';

const UserProjectTabs: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<TabType>('summary');
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
        return <UserSummary projectId={pid} projectName={projectName} />; // ✅ Correct usage
      case 'backlog':
        return <UserBacklog  />;
      case 'board':
        return <UserBoard projectId={pid} projectName={projectName} />;
      default:
        return null;
    }
  };

  if (!projectId) return <div className="p-6 text-slate-400">No project selected.</div>;
  if (notFound) return <div className="p-6 text-red-500">Project not found.</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 p-4 bg-white">
        <h2 className="text-xl font-semibold text-slate-800">{projectName}</h2>
        <div className="mt-4 flex space-x-6">
          <button
            onClick={() => setSelectedTab('summary')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded ${
              selectedTab === 'summary' ? 'bg-blue-900 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <BarChart3 size={16} />
            <span>Summary</span>
          </button>
          <button
            onClick={() => setSelectedTab('backlog')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded ${
              selectedTab === 'backlog' ? 'bg-blue-900 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <List size={16} />
            <span>Backlog</span>
          </button>
          <button
            onClick={() => setSelectedTab('board')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded ${
              selectedTab === 'board' ? 'bg-blue-900 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <KanbanSquare size={16} />
            <span>Board</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 overflow-auto">{renderTabContent()}</div>
    </div>
  );
};

export default UserProjectTabs;
