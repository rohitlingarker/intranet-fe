// src/pages/Projects/manager/Lists.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommentBox from './CommentBox';
import ExpandableList from '../../../components/List/List';
import CreateIssueForm from './Backlog/CreateIssueForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pencil, Trash, X, Download } from 'lucide-react';
import { useAuth } from "../../../contexts/AuthContext";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

const token = localStorage.getItem('token');

const Lists = ({ projectId }) => {
  const [epics, setEpics] = useState([]);
  const [noEpicStories, setNoEpicStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { user } = useAuth();

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_PMS_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchData = async () => {
    try {
      const [epicRes, storyRes, taskRes, noEpicRes] = await Promise.all([
        axiosInstance.get(`/api/projects/${projectId}/epics`),
        axiosInstance.get(`/api/projects/${projectId}/stories`),
        axiosInstance.get(`/api/projects/${projectId}/tasks`),
        axiosInstance.get(`/api/stories/no-epic`, { params: { projectId } }), // Pass projectId as query param
      ]);

      const enrichedStories = storyRes.data.map(story => ({
        ...story,
        tasks: taskRes.data.filter(task => task.storyId === story.id),
      }));

      const enrichedEpics = epicRes.data.map(epic => ({
        ...epic,
        stories: enrichedStories.filter(story => story.epicId === epic.id),
      }));

      const enrichedNoEpicStories = noEpicRes.data.map(story => ({
        ...story,
        tasks: taskRes.data.filter(task => task.storyId === story.id),
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
      toast.error(err.response?.data || `Failed to delete ${type}.`, { position: 'top-right' });
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

  // ===== WORD EXPORT WITH TABLE STRUCTURE =====
  const handleExport = async () => {
    setShowExportMenu(false);
    try {
      const docChildren = [];

      epics.forEach(epic => {
        // Epic Title
        docChildren.push(new Paragraph({
          text: `Epic: ${epic.name} (ID: ${epic.id})`,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }));

        // Epic Table
        const epicTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Description", bold: true })] }),
                new TableCell({ children: [new Paragraph(epic.description || "-")] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Progress")] }),
                new TableCell({ children: [new Paragraph(`${epic.progressPercentage || 0}%`)] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph("Due Date")] }),
                new TableCell({ children: [new Paragraph(epic.dueDate || "-")] }),
              ],
            }),
          ],
        });
        docChildren.push(epicTable, new Paragraph({}));

        // Each Story under Epic
        epic.stories.forEach(story => {
          docChildren.push(new Paragraph({
            text: `Story: ${story.title} (ID: ${story.id})`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }));

          const storyTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              ["Description", story.description || "-"],
              ["Status", story.status || "-"],
              ["Priority", story.priority || "-"],
              ["Story Points", String(story.storyPoints || "-")],
              ["Acceptance Criteria", story.acceptanceCriteria || "-"],
              ["Reporter", story.reporter?.name || "-"],
              ["Assignee", story.assignee?.name || "-"],
              ["Sprint", story.sprint?.name || "-"],
              ["Due Date", story.dueDate || "-"],
            ].map(([label, value]) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: label, bold: true })] }),
                  new TableCell({ children: [new Paragraph(String(value))] }),
                ],
              })
            ),
          });
          docChildren.push(storyTable, new Paragraph({}));

          // Tasks under Story
          if (story.tasks.length > 0) {
            docChildren.push(new Paragraph({
              text: "Tasks:",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 100, after: 50 },
            }));

            story.tasks.forEach(task => {
              docChildren.push(new Paragraph({
                text: `Task: ${task.title} (ID: ${task.id})`,
                heading: HeadingLevel.HEADING_4,
              }));

              const taskTable = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  ["Description", task.description || "-"],
                  ["Status", task.status || "-"],
                  ["Priority", task.priority || "-"],
                  ["Story Points", String(task.storyPoints || "-")],
                  ["Acceptance Criteria", task.acceptanceCriteria || "-"],
                  ["Reporter", task.reporter?.name || "-"],
                  ["Assignee", task.assignee?.name || "-"],
                  ["Sprint", task.sprint?.name || "-"],
                  ["Due Date", task.dueDate || "-"],
                ].map(([label, value]) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: label, bold: true })] }),
                      new TableCell({ children: [new Paragraph(String(value))] }),
                    ],
                  })
                ),
              });
              docChildren.push(taskTable, new Paragraph({}));
            });
          }
        });
      });

      if (docChildren.length === 0) {
        toast.info("No data to export.", { position: "top-right" });
        return;
      }

      const doc = new Document({
        sections: [{ properties: {}, children: docChildren }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `project_${projectId}_hierarchy.docx`);
      toast.success("Word export completed with table format!", { position: "top-right" });
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export Word document.", { position: "top-right" });
    }
  };

  if (loading) return <div className="p-6 text-xl text-slate-500">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-indigo-700">Epics</h2>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
          >
            <Download size={16} /> Export
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
              <button
                onClick={handleExport}
                className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm"
              >
                Export Word (.docx)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested Lists */}
      {epics.map(epic => (
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
          {epic.stories.map(story => (
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
                {story.tasks.map(task => (
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

      {/* Edit Modal */}
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

      {/* Comments Drawer */}
      {selectedEntity && (
        <div className="fixed bottom-0 right-0 w-[400px] h-[50vh] bg-white shadow-xl border-l border-t rounded-tl-xl z-50 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold capitalize">
              Comments for {selectedEntity.type} #{selectedEntity.id}
            </h2>
            <button onClick={() => setSelectedEntity(null)}><X className="w-5 h-5" /></button>
          </div>
          <CommentBox entityId={selectedEntity.id} entityType={selectedEntity.type} currentUser={user} />
        </div>
      )}
    </div>
  );
};

export default Lists;
