import React, { useEffect, useState } from 'react';
import axios from 'axios';
 
interface SummaryProps {
  projectId: number;
  projectName: string;
}
 
interface Epic {
  id: number;
  name: string;
  status: string;
}
 
interface Story {
  id: number;
  title: string;
  status: string;
}
 
interface Task {
  id: number;
  title: string;
  status: string;
}
 
const Summary: React.FC<SummaryProps> = ({ projectId, projectName }) => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [expandedEpicId, setExpandedEpicId] = useState<number | null>(null);
  const [stories, setStories] = useState<Record<number, Story[]>>({});
  const [expandedStoryId, setExpandedStoryId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Record<number, Task[]>>({});
 
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/projects/${projectId}/epics`)
      .then((res) => setEpics(res.data))
      .catch((err) => console.error('Failed to load epics', err));
  }, [projectId]);
 
  const fetchStories = (epicId: number) => {
    if (stories[epicId]) {
      setExpandedEpicId(expandedEpicId === epicId ? null : epicId);
      return;
    }
 
    axios
      .get(`http://localhost:8080/api/stories/epic/${epicId}`)
      .then((res) => {
        setStories((prev) => ({ ...prev, [epicId]: res.data }));
        setExpandedEpicId(epicId);
        setExpandedStoryId(null);
      })
      .catch((err) => console.error('Failed to load stories', err));
  };
 
  const fetchTasks = (storyId: number) => {
    if (tasks[storyId]) {
      setExpandedStoryId(expandedStoryId === storyId ? null : storyId);
      return;
    }
 
    axios
      .get(`http://localhost:8080/api/stories/${storyId}/tasks`)
      .then((res) => {
        setTasks((prev) => ({ ...prev, [storyId]: res.data }));
        setExpandedStoryId(storyId);
      })
      .catch((err) => console.error('Failed to load tasks', err));
  };
 
  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4">Summary for {projectName}</h3>
      <div className="space-y-4">
        {epics.map((epic) => (
          <div key={epic.id} className="border p-4 rounded bg-white shadow">
            <div
              className="cursor-pointer font-semibold text-lg text-blue-600"
              onClick={() => fetchStories(epic.id)}
            >
              📘 Epic: {epic.name} ({epic.status})
            </div>
 
            {expandedEpicId === epic.id &&
              stories[epic.id]?.map((story) => (
                <div
                  key={story.id}
                  className="ml-6 mt-2 cursor-pointer text-gray-700"
                  onClick={() => fetchTasks(story.id)}
                >
                  📝 Story: {story.title} ({story.status})
 
                  {expandedStoryId === story.id &&
                    tasks[story.id]?.map((task) => (
                      <div
                        key={task.id}
                        className="ml-6 text-sm text-gray-600"
                      >
                        ✅ Task: {task.title} ({task.status})
                      </div>
                    ))}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};
 
export default Summary;