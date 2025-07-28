export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  key: string;
  createdAt: Date;
  assignedEmployees: Employee[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'epic' | 'story' | 'task';
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  parentId?: string; // For stories under epics, tasks under stories
  assignedTo?: Employee;
  createdAt: Date;
  isStarred: boolean;
  storyPoints?: number;
}

export interface AppState {
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
  selectedProjectId: string | null;
  selectedTab: 'summary' | 'backlog' | 'board';
  sidebarCollapsed: boolean;
}