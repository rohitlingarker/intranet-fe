import React, { useEffect, useState } from "react";
import axios from "axios";
import ExpandableList from "../../../components/List/List";

const Lists = ({ projectId }) => {
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editState, setEditState] = useState({ type: "", id: null });
  const [formData, setFormData] = useState({});

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
      console.error("Error loading data:", err);
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
    if (type === "epic") {
      delete payload.stories;
      payload.projectId = projectId;
    } else if (type === "story") {
      delete payload.tasks;
    } else if (type === "task") {
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

    const endpoint = `http://localhost:8080/api/${type === "story" ? "stories" : `${type}s`}/${id}`;
    try {
      await axios.put(endpoint, formData);
      setEditState({ type: "", id: null });
      fetchData();
    } catch (err) {
      console.error(`Error updating ${type}:`, err);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const renderInput = (field, label, type = "text") => (
    <div className="flex flex-col text-sm">
      <label className="text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={formData[field] ?? ""}
        onChange={(e) => handleChange(field, e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      />
    </div>
  );

  if (loading) return <div className="p-4 text-slate-500">Loading project data...</div>;

  return (
    <div className="p-4 space-y-4">
      {epics.map((epic) => (
        <ExpandableList
          key={epic.id}
          title={epic.name}
          count={epic.stories.length}
          headerRight={
            <div className="space-x-2">
              <button onClick={() => handleEdit("epic", epic)} className="text-blue-500 hover:underline text-sm">Edit</button>
              <button onClick={() => handleDelete("epic", epic.id)} className="text-red-500 hover:underline text-sm">Delete</button>
            </div>
          }
        >
          {editState.type === "epic" && editState.id === epic.id && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("name", "Epic Name")}
              {renderInput("status", "Status")}
              {renderInput("priority", "Priority")}
              {renderInput("progressPercentage", "Progress %", "number")}
              {renderInput("dueDate", "Due Date", "date")}
              {renderInput("description", "Description")}
              <div className="col-span-full mt-2 space-x-2">
                <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Save</button>
                <button onClick={() => setEditState({ type: "", id: null })} className="text-gray-600 hover:underline text-sm">Cancel</button>
              </div>
            </div>
          )}

          {epic.stories.map((story) => (
            <ExpandableList
              key={story.id}
              title={story.title}
              count={story.tasks.length}
              headerRight={
                <div className="space-x-2 text-sm">
                  <button onClick={() => handleEdit("story", story)} className="text-blue-500 hover:underline">Edit</button>
                  <button onClick={() => handleDelete("story", story.id)} className="text-red-500 hover:underline">Delete</button>
                </div>
              }
            >
              {editState.type === "story" && editState.id === story.id && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput("title", "Title")}
                  {renderInput("status", "Status")}
                  {renderInput("priority", "Priority")}
                  {renderInput("storyPoints", "Story Points", "number")}
                  {renderInput("acceptanceCriteria", "Acceptance Criteria")}
                  {renderInput("description", "Description")}
                  <div className="col-span-full mt-2 space-x-2">
                    <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Save</button>
                    <button onClick={() => setEditState({ type: "", id: null })} className="text-gray-600 hover:underline text-sm">Cancel</button>
                  </div>
                </div>
              )}

              <ul className="space-y-1 text-sm">
                {story.tasks.map((task) => (
                  <li key={task.id} className="flex justify-between items-start">
                    {editState.type === "task" && editState.id === task.id ? (
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderInput("title", "Title")}
                        {renderInput("status", "Status")}
                        {renderInput("priority", "Priority")}
                        {renderInput("storyPoints", "Story Points", "number")}
                        {renderInput("dueDate", "Due Date", "date")}
                        {renderInput("assigneeId", "Assignee ID")}
                        {renderInput("reporterId", "Reporter ID")}
                        {renderInput("sprintId", "Sprint ID")}
                        <div className="col-span-full mt-2 space-x-2">
                          <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Save</button>
                          <button onClick={() => setEditState({ type: "", id: null })} className="text-gray-600 hover:underline text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-xs text-gray-500">Status: {task.status} | Due: {task.dueDate?.split("T")[0]}</p>
                        </div>
                        <div className="text-sm space-x-2">
                          <button onClick={() => handleEdit("task", task)} className="text-blue-500 hover:underline">Edit</button>
                          <button onClick={() => handleDelete("task", task.id)} className="text-red-500 hover:underline">Delete</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </ExpandableList>
          ))}
        </ExpandableList>
      ))}
    </div>
  );
};

export default Lists;
