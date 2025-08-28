// src/pages/Projects/manager/Lists.jsx
import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import CommentBox from './CommentBox';
import ExpandableList from '../../../components/List/List';
import CreateIssueForm from './Backlog/CreateIssueForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pencil, Trash, X } from 'lucide-react';

// Get token from localStorage (or wherever you store it)
const token = localStorage.getItem('token');

const Lists = ({ projectId }) => {
  const [epics, setEpics] = useState([]);
  const [noEpicStories, setNoEpicStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const fakeUsers = [
    { id: 1, name: 'Sindhu Reddy' },
    { id: 2, name: 'Vijayadurga' },
    { id: 3, name: 'Niharika Kandukoori' },
    { id: 4, name: 'Ruchitha Nuthula' },
  ];
  const [currentUser, setCurrentUser] = useState(fakeUsers[0]);

  // Create an axios instance with the token
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_PMS_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchData = async () => {
    try {
      const [epicRes, storyRes, taskRes, noEpicRes] = await Promise.all([
        axiosInstance.get(`/api/projects/${projectId}/epics`),
        axiosInstance.get(`/api/projects/${projectId}/stories`),
        axiosInstance.get(`/api/projects/${projectId}/tasks`),
        axiosInstance.get(`/api/stories/no-epic`),
      ]);

      const enrichedStories = storyRes.data.map((story) => ({
        ...story,
        tasks: taskRes.data.filter((task) => task.storyId === story.id),
      }));

      const enrichedEpics = epicRes.data.map((epic) => ({
        ...epic,
        stories: enrichedStories.filter((story) => story.epicId === epic.id),
      }));

      const enrichedNoEpicStories = noEpicRes.data.map((story) => ({
        ...story,
        tasks: taskRes.data.filter((task) => task.storyId === story.id),
      }));

      setEpics(enrichedEpics);
      setNoEpicStories(enrichedNoEpicStories);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load project data.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  useEffect(() => {
    document.body.style.overflow = editItem ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [editItem]);

  const handleDelete = async (type, id) => {
    let endpoint = '';
    if (type === 'epic') endpoint = `/api/epics/${id}`;
    if (type === 'story') endpoint = `/api/stories/${id}`;
    if (type === 'task') endpoint = `/api/tasks/${id}`;

    try {
      await axiosInstance.delete(endpoint);
      toast.success(`${type} deleted successfully!`, { position: 'top-right' });
      await fetchData();
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      let userMessage = err.response?.data || `Failed to delete ${type}.`;
      toast.error(userMessage, { position: 'top-right' });
    }
  };

  const handleEdit = (type, item) => {
    let initialData = {};
    if (type === 'epic') {
      initialData = {
        id: item.id,
        name: item.name,
        description: item.description || '',
        progressPercentage: item.progressPercentage || 0,
        projectId: item.projectId || projectId,
        dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
      };
    }
    if (type === 'story') {
      initialData = {
        id: item.id,
        title: item.title,
        description: item.description || '',
        status: item.status || 'BACKLOG',
        priority: item.priority || 'MEDIUM',
        storyPoints: item.storyPoints || 0,
        acceptanceCriteria: item.acceptanceCriteria || '',
        epicId: item.epicId || '',
        reporterId: item.reporter?.id || '',
        assigneeId: item.assignee?.id || '',
        projectId: item.projectId || projectId,
        sprintId: item.sprint?.id || '',
        dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
      };
    }
    if (type === 'task') {
      initialData = {
        id: item.id,
        title: item.title,
        description: item.description || '',
        status: item.status || 'TODO',
        priority: item.priority || 'MEDIUM',
        storyPoints: item.storyPoints || 0,
        acceptanceCriteria: item.acceptanceCriteria || '',
        reporterId: item.reporter?.id || '',
        assigneeId: item.assignee?.id || '',
        storyId: item.storyId || '',
        sprintId: item.sprint?.id || '',
        dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
        projectId: item.projectId || projectId,
      };
    }
    setEditItem({ type, initialData });
  };

  const handleEditClose = () => {
    setEditItem(null);
    fetchData();
  };

  if (loading) return <div className="p-6 text-xl text-slate-500">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      {/* User Switch */}
      <div className="flex justify-end gap-2 mb-4 items-center">
        <label>Logged in as:</label>
        <select
          value={currentUser.id}
          onChange={(e) => setCurrentUser(fakeUsers.find((u) => u.id === +e.target.value))}
          className="border rounded px-3 py-1"
        >
          {fakeUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {/* Epics */}
      <h2 className="text-xl font-bold  pb-1 text-indigo-700">
        Epics
      </h2>
      {epics.map((epic) => (
        <ExpandableList
          key={epic.id}
          title={epic.name}
          count={epic.stories.length}
          headerRight={
            <div className="flex gap-3">
              <button onClick={() => handleEdit('epic', epic)}><Pencil className="text-blue-600 w-4 h-4" /></button>
              <button onClick={() => handleDelete('epic', epic.id)}><Trash className="text-red-600 w-4 h-4" /></button>
              <button onClick={() => setSelectedEntity({ id: epic.id, type: 'epic' })}>💬</button>
            </div>
          }
        >
          {epic.stories.map((story) => (
            <li key={story.id}>
              <ExpandableList
                title={<>{story.title} <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 rounded">Story</span></>}
                count={story.tasks.length}
                headerRight={
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit('story', story)}><Pencil className="text-blue-500 w-4 h-4" /></button>
                    <button onClick={() => handleDelete('story', story.id)}><Trash className="text-red-500 w-4 h-4" /></button>
                    <button onClick={() => setSelectedEntity({ id: story.id, type: 'story' })}>💬</button>
                  </div>
                }
              >
                {story.tasks.map((task) => (
                  <li key={task.id} className="flex justify-between items-center px-2">
                    <span>{task.title} <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 rounded">Task</span></span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit('task', task)}><Pencil className="text-blue-500 w-4 h-4" /></button>
                      <button onClick={() => handleDelete('task', task.id)}><Trash className="text-red-500 w-4 h-4" /></button>
                      <button onClick={() => setSelectedEntity({ id: task.id, type: 'task' })}>💬</button>
                    </div>
                  </li>
                ))}
              </ExpandableList>
            </li>
          ))}
        </ExpandableList>
      ))}

      {/* No Epics */}
      {noEpicStories.length > 0 && (
        <ExpandableList className="text-pink-950" title="Unassigned Stories" count={noEpicStories.length}>
          {noEpicStories.map((story) => (
            <li key={story.id}>
              <ExpandableList
                title={<>{story.title} <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 rounded">Story</span></>}
                count={story.tasks.length}
                headerRight={
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit('story', story)}><Pencil className="text-blue-500 w-4 h-4" /></button>
                    <button onClick={() => handleDelete('story', story.id)}><Trash className="text-red-500 w-4 h-4" /></button>
                    <button onClick={() => setSelectedEntity({ id: story.id, type: 'story' })}>💬</button>
                  </div>
                }
              >
                {story.tasks.map((task) => (
                  <li key={task.id} className="flex justify-between items-center px-2">
                    <span>{task.title} <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 rounded">Task</span></span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit('task', task)}><Pencil className="text-blue-500 w-4 h-4" /></button>
                      <button onClick={() => handleDelete('task', task.id)}><Trash className="text-red-500 w-4 h-4" /></button>
                      <button onClick={() => setSelectedEntity({ id: task.id, type: 'task' })}>💬</button>
                    </div>
                  </li>
                ))}
              </ExpandableList>
            </li>
          ))}
        </ExpandableList>
      )}

      {/* Edit Modal with scroll */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-lg relative">
            <button onClick={() => setEditItem(null)} className="absolute top-2 right-2">
              <X className="w-5 h-5" />
            </button>
            <CreateIssueForm
              mode="edit"
              issueType={editItem.type === 'story' ? 'User Story' : editItem.type === 'task' ? 'Task' : 'Epic'}
              initialData={editItem.initialData}
              onClose={handleEditClose}
              onCreated={handleEditClose}
              projectId={projectId}
            />
          </div>
        </div>
      )}

      {/* Comments */}
      {selectedEntity && (
        <div className="fixed bottom-0 right-0 w-[400px] h-[50vh] bg-white shadow-xl border-l border-t rounded-tl-xl z-50 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold capitalize">
              Comments for {selectedEntity.type} #{selectedEntity.id}
            </h2>
            <button onClick={() => setSelectedEntity(null)}><X className="w-5 h-5" /></button>
          </div>
          <CommentBox entityId={selectedEntity.id} entityType={selectedEntity.type} currentUser={currentUser} />
        </div>
      )}
    </div>
  );
};

export default Lists;
