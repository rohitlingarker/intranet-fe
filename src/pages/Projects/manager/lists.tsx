import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ListsProps {
  projectId: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Sprint {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  storyPoints?: number;
  dueDate?: string;
  storyId: number;
  assignee?: User;
  reporter?: User;
  sprint?: Sprint;
  project?: Project;
}

interface Story {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  storyPoints?: number;
  acceptanceCriteria?: string;
  epicId: number;
  tasks: Task[];
}

interface Epic {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  progressPercentage: number;
  dueDate: string;
  projectId: number;
  stories: Story[];
}

const Lists: React.FC<ListsProps> = ({ projectId }) => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editState, setEditState] = useState<{ type: string; id: number | null }>({ type: '', id: null });
  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    try {
      const [epicRes, storyRes, taskRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/projects/${projectId}/epics`),
        axios.get(`http://localhost:8080/api/projects/${projectId}/stories`),
        axios.get(`http://localhost:8080/api/projects/${projectId}/tasks`),
      ]);

      const enrichedStories = storyRes.data.map((story: Story) => ({
        ...story,
        tasks: taskRes.data.filter((task: Task) => task.storyId === story.id),
      }));

      const enrichedEpics = epicRes.data.map((epic: Epic) => ({
        ...epic,
        stories: enrichedStories.filter((story: Story) => story.epicId === epic.id),
      }));

      setEpics(enrichedEpics);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleDelete = async (type: 'epic' | 'story' | 'task', id: number) => {
    const urlMap = {
      epic: `http://localhost:8080/api/epics/${id}`,
      story: `http://localhost:8080/api/stories/${id}`,
      task: `http://localhost:8080/api/tasks/${id}`,
    };
    try {
      await axios.delete(urlMap[type]);
      fetchData();
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
    }
  };

  const handleEdit = (type: 'epic' | 'story' | 'task', item: any) => {
    const payload = { ...item };
    if (type === 'epic') {
      delete payload.stories;
      payload.projectId = projectId;
    } else if (type === 'story') {
      delete payload.tasks;
    } else if (type === 'task') {
      payload.projectId = item.project?.id ?? projectId;
      payload.reporterId = item.reporter?.id;
      payload.assigneeId = item.assignee?.id;
      payload.sprintId = item.sprint?.id;
    }
    setEditState({ type, id: item.id });
    setFormData(payload);
  };

  const handleSave = async () => {
    const { type, id } = editState;
    if (!id) return;

    const endpoint = `http://localhost:8080/api/${type === 'story' ? 'stories' : `${type}s`}/${id}`;
    const payload = { ...formData };

    try {
      await axios.put(endpoint, payload);
      setEditState({ type: '', id: null });
      fetchData();
    } catch (err) {
      console.error(`Error updating ${type}:`, err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const renderInput = (field: string, label: string, type: string = 'text') => (
    <div className="flex flex-col text-base">
      <label className="text-gray-700 font-medium mb-1">{label}</label>
      <input
        type={type}
        value={formData[field] ?? ''}
        onChange={(e) => handleChange(field, e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );

  if (loading) return <div className="p-6 text-xl text-slate-500">Loading project data...</div>;

  return (
    <div className="p-6 space-y-6">
      {epics.map((epic) => (
        <div key={epic.id} className="bg-white shadow-md rounded-lg p-5 border border-slate-200">
          {editState.type === 'epic' && editState.id === epic.id ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('name', 'Epic Name')}
                {renderInput('status', 'Status')}
                {renderInput('priority', 'Priority')}
                {renderInput('progressPercentage', 'Progress %', 'number')}
                {renderInput('dueDate', 'Due Date', 'date')}
                {renderInput('description', 'Description')}
              </div>
              <div className="space-x-4 mt-4">
                <button onClick={handleSave} className="text-white bg-green-600 px-4 py-1 rounded hover:bg-green-700">Save</button>
                <button onClick={() => setEditState({ type: '', id: null })} className="text-gray-600 hover:underline">Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-indigo-900">{epic.name}</h2>
                <div className="space-x-4 text-base">
                  <button onClick={() => handleEdit('epic', epic)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete('epic', epic.id)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
              <p className="text-gray-700 text-base">{epic.description}</p>
              <p className="text-sm text-gray-500">Status: {epic.status} | Priority: {epic.priority} | Due: {epic.dueDate}</p>
            </>
          )}

          <div className="mt-4 space-y-3">
            {epic.stories.map((story) => (
              <div key={story.id} className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                {editState.type === 'story' && editState.id === story.id ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderInput('title', 'Title')}
                      {renderInput('status', 'Status')}
                      {renderInput('priority', 'Priority')}
                      {renderInput('storyPoints', 'Story Points', 'number')}
                      {renderInput('acceptanceCriteria', 'Acceptance Criteria')}
                      {renderInput('description', 'Description')}
                    </div>
                    <div className="space-x-4 mt-3">
                      <button onClick={handleSave} className="text-white bg-green-600 px-4 py-1 rounded hover:bg-green-700">Save</button>
                      <button onClick={() => setEditState({ type: '', id: null })} className="text-gray-600 hover:underline">Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-pink-800">{story.title}</h3>
                      <div className="space-x-3 text-sm">
                        <button onClick={() => handleEdit('story', story)} className="text-blue-500 hover:underline">Edit</button>
                        <button onClick={() => handleDelete('story', story.id)} className="text-red-500 hover:underline">Delete</button>
                      </div>
                    </div>

                    <ul className="ml-4 mt-2 space-y-1 text-base text-slate-800">
                      {story.tasks.map((task) => (
                        <li key={task.id} className="flex justify-between items-start border-t pt-2">
                          {editState.type === 'task' && editState.id === task.id ? (
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                              {renderInput('title', 'Title')}
                              {renderInput('status', 'Status')}
                              {renderInput('priority', 'Priority')}
                              {renderInput('storyPoints', 'Story Points', 'number')}
                              {renderInput('dueDate', 'Due Date', 'date')}
                              {renderInput('assigneeId', 'Assignee ID')}
                              {renderInput('reporterId', 'Reporter ID')}
                              {renderInput('sprintId', 'Sprint ID')}
                              <div className="col-span-full space-x-4 mt-2">
                                <button onClick={handleSave} className="text-white bg-green-600 px-4 py-1 rounded hover:bg-green-700">Save</button>
                                <button onClick={() => setEditState({ type: '', id: null })} className="text-gray-600 hover:underline">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-gray-500">Status: {task.status} | Due: {task.dueDate?.split('T')[0]}</p>
                              </div>
                              <div className="text-sm space-x-2">
                                <button onClick={() => handleEdit('task', task)} className="text-blue-500 hover:underline">Edit</button>
                                <button onClick={() => handleDelete('task', task.id)} className="text-red-500 hover:underline">Delete</button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Lists;
