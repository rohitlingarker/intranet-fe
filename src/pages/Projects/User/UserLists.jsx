import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommentBox from './UserCommentBox';
import ExpandableList from '../../../components/List/List';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { X } from 'lucide-react';

const Lists = ({ projectId }) => {
  const [epics, setEpics] = useState([]);
  const [noEpicStories, setNoEpicStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);

  const fakeUsers = [
    { id: 1, name: 'Sindhu Reddy' },
    { id: 2, name: 'Vijayadurga' },
    { id: 3, name: 'Niharika Kandukoori' },
    { id: 4, name: 'Ruchitha Nuthula' },
  ];
  const [currentUser, setCurrentUser] = useState(fakeUsers[0]);

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [epicRes, storyRes, taskRes, noEpicRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/stories/no-epic`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
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
    if (selectedEntity) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedEntity]);

  if (loading)
    return (
      <div className="p-6 text-xl text-slate-500">Loading project data...</div>
    );

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      {/* User Switch */}
      <div className="flex justify-end gap-2 mb-4 items-center">
        <label className="text-base font-medium text-gray-700">
          Logged in as:
        </label>
        <select
          value={currentUser.id}
          onChange={(e) => {
            const selected = fakeUsers.find(
              (u) => u.id === parseInt(e.target.value)
            );
            if (selected) setCurrentUser(selected);
          }}
          className="border border-gray-300 rounded px-3 py-1"
        >
          {fakeUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Epics */}
      <h2 className="text-xl font-bold text-indigo-700">Epics</h2>
      {epics.map((epic) => (
        <ExpandableList
          key={epic.id}
          title={epic.name}
          count={epic.stories.length}
          headerRight={
            <div className="flex items-center">
              <button
                onClick={() => setSelectedEntity({ id: epic.id, type: 'epic' })}
              >
                💬
              </button>
            </div>
          }
        >
          {epic.stories.map((story) => (
            <li key={story.id}>
              <ExpandableList
                title={
                  <span>
                    {story.title}{' '}
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                      Story
                    </span>
                  </span>
                }
                count={story.tasks.length}
                headerRight={
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        setSelectedEntity({ id: story.id, type: 'story' })
                      }
                    >
                      💬
                    </button>
                  </div>
                }
              >
                {story.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex justify-between items-center px-2"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {task.title}{' '}
                      <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                        Task
                      </span>
                    </span>
                    <div className="flex items-center">
                      <button
                        onClick={() =>
                          setSelectedEntity({ id: task.id, type: 'task' })
                        }
                      >
                        💬
                      </button>
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
        <>
          <h2 className="text-xl font-bold text-pink-700 mt-6">No Epics</h2>
          <ExpandableList title="No Epic" count={noEpicStories.length}>
            {noEpicStories.map((story) => (
              <li key={story.id}>
                <ExpandableList
                  title={
                    <span>
                      {story.title}{' '}
                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                        Story
                      </span>
                    </span>
                  }
                  count={story.tasks.length}
                  headerRight={
                    <div className="flex items-center">
                      <button
                        onClick={() =>
                          setSelectedEntity({ id: story.id, type: 'story' })
                        }
                      >
                        💬
                      </button>
                    </div>
                  }
                >
                  {story.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex justify-between items-center px-2"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {task.title}{' '}
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                          Task
                        </span>
                      </span>
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            setSelectedEntity({ id: task.id, type: 'task' })
                          }
                        >
                          💬
                        </button>
                      </div>
                    </li>
                  ))}
                </ExpandableList>
              </li>
            ))}
          </ExpandableList>
        </>
      )}

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
              <X className="w-5 h-5" />
            </button>
          </div>
          <CommentBox
            entityId={selectedEntity.id}
            entityType={selectedEntity.type}
            currentUser={currentUser}
            token={token} // Pass token if CommentBox needs it
          />
        </div>
      )}
    </div>
  );
};

export default Lists;
