import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommentBox from './CommentBox';
import ExpandableList from '../../../components/List/List';
 
const Lists = ({ projectId }) => {
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editState, setEditState] = useState({ type: '', id: null });
  const [formData, setFormData] = useState({});
  const [selectedEntity, setSelectedEntity] = useState(null);
 
  const fakeUsers = [
    { id: 1, name: 'Sindhu Reddy' },
    { id: 2, name: 'Vijayadurga' },
    { id: 3, name: 'Niharika Kandukoori' },
    { id: 4, name: 'Ruchitha Nuthula' },
  ];
  const [currentUser, setCurrentUser] = useState(fakeUsers[0]);
 
  const fetchData = async () => {
    try {
      const [epicRes, storyRes, taskRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/projects/${projectId}/epics`),
        axios.get(`http://localhost:8080/api/projects/${projectId}/stories`),
        axios.get(`http://localhost:8080/api/projects/${projectId}/tasks`),
      ]);
 
      const enrichedStories = storyRes.data.map((story) => ({
        ...story,
        tasks: taskRes.data.filter((task) => task.storyId === story.id),
      }));
 
      const enrichedEpics = epicRes.data.map((epic) => ({
        ...epic,
        stories: enrichedStories.filter((story) => story.epicId === epic.id),
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
 
  const handleDelete = async (type, id) => {
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
 
  const handleEdit = (type, item) => {
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
 
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
 
  if (loading) return <div className="p-6 text-xl text-slate-500">Loading project data...</div>;
 
  return (
    <div className="p-6 space-y-6">
      {/* User Switch */}
      <div className="flex justify-end gap-2 mb-4 items-center">
        <label className="text-base font-medium text-gray-700">Logged in as:</label>
        <select
          value={currentUser.id}
          onChange={(e) => {
            const selected = fakeUsers.find(u => u.id === parseInt(e.target.value));
            if (selected) setCurrentUser(selected);
          }}
          className="border border-gray-300 rounded px-3 py-1"
        >
          {fakeUsers.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>
 
      {/* Epics */}
      {epics.map((epic) => (
        <ExpandableList
          key={epic.id}
          title={epic.name}
          count={epic.stories.length}
          headerRight={
            <div className="space-x-3">
              <button onClick={() => handleEdit('epic', epic)} className="text-blue-600 hover:underline">Edit</button>
              <button onClick={() => handleDelete('epic', epic.id)} className="text-red-600 hover:underline">Delete</button>
              <button onClick={() => setSelectedEntity({ id: epic.id, type: 'epic' })} className="text-green-600 hover:underline">Comment</button>
            </div>
          }
        >
          {epic.stories.map((story) => (
            <li key={story.id}>
              <ExpandableList
                title={story.title}
                count={story.tasks.length}
                headerRight={
                  <div className="space-x-3">
                    <button onClick={() => handleEdit('story', story)} className="text-blue-500 hover:underline">Edit</button>
                    <button onClick={() => handleDelete('story', story.id)} className="text-red-500 hover:underline">Delete</button>
                    <button onClick={() => setSelectedEntity({ id: story.id, type: 'story' })} className="text-green-600 hover:underline">Comment</button>
                  </div>
                }
              >
                {story.tasks.map((task) => (
                  <li key={task.id} className="flex justify-between items-center px-2">
                    <span className="text-sm font-medium text-gray-700">{task.title}</span>
                    <div className="space-x-2 text-sm">
                      <button onClick={() => handleEdit('task', task)} className="text-blue-500 hover:underline">Edit</button>
                      <button onClick={() => handleDelete('task', task.id)} className="text-red-500 hover:underline">Delete</button>
                      <button onClick={() => setSelectedEntity({ id: task.id, type: 'task' })} className="text-green-600 hover:underline">Comment</button>
                    </div>
                  </li>
                ))}
              </ExpandableList>
            </li>
          ))}
        </ExpandableList>
      ))}
 
      {/* Comment Box */}
      {selectedEntity && (
        <div className="fixed bottom-0 right-0 w-[400px] h-[50vh] bg-white shadow-xl border-l border-t rounded-tl-xl z-50 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold capitalize">
              Comments for {selectedEntity.type} #{selectedEntity.id}
            </h2>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-gray-500 hover:text-red-600 text-xl"
            >
              &times;
            </button>
          </div>
          <CommentBox
            entityId={selectedEntity.id}
            entityType={selectedEntity.type}
            currentUser={currentUser}
          />
        </div>
      )}
    </div>
  );
};
 
export default Lists;