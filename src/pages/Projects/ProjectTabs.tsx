import React from 'react';
import { BarChart3, List, KanbanSquare } from 'lucide-react';

interface ProjectTabsProps {
  selectedTab: 'summary' | 'backlog' | 'board';
  onTabSelect: (tab: 'summary' | 'backlog' | 'board') => void;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({ selectedTab, onTabSelect }) => {
  const tabs = [
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'backlog', label: 'Backlog', icon: List },
    { id: 'board', label: 'Board', icon: KanbanSquare }
  ] as const;

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};