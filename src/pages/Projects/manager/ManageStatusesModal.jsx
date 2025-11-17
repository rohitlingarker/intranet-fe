import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Trash2, GripVertical } from "lucide-react";
import Button from "../../../components/Button/Button";

const ManageStatusesModal = ({ isOpen, onClose, projectId }) => {
  const [statuses, setStatuses] = useState([]);
  const [newStatusName, setNewStatusName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!isOpen) {
      setStatuses([]);
      setNewStatusName("");
      return;
    }

    const fetchStatuses = async () => {
      if (!projectId) return;
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/statuses`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data && response.data.length > 0) {
          // Sort by sortOrder and set existing statuses
          const sortedStatuses = response.data.sort((a, b) => a.sortOrder - b.sortOrder);
          setStatuses(sortedStatuses);
        } else {
          // If no statuses exist, provide a default set
          setStatuses([
            { id: `temp-${Date.now()}-1`, name: "To Do" },
            { id: `temp-${Date.now()}-2`, name: "In Progress" },
            { id: `temp-${Date.now()}-3`, name: "Done" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch statuses, using defaults.", error);
        toast.warn("Could not fetch existing statuses. Using defaults.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatuses();
  }, [isOpen, projectId, token]);

  const handleAddStatus = () => {
    if (newStatusName.trim() === "") {
      toast.warn("Status name cannot be empty.");
      return;
    }
    const newStatus = {
      id: `temp-${Date.now()}`, // Temporary ID for dnd key
      name: newStatusName.trim(),
    };
    setStatuses([...statuses, newStatus]);
    setNewStatusName("");
  };

  const handleRemoveStatus = (indexToRemove) => {
    setStatuses(statuses.filter((_, index) => index !== indexToRemove));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(statuses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setStatuses(items);
  };

  const handleSave = async () => {
    if (!projectId) {
      toast.error("Project ID is missing.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = statuses.map((status, index) => ({
        name: status.name,
        sortOrder: index,
      }));

      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/statuses`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Project statuses saved successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to save statuses:", error);
      toast.error(error.response?.data?.message || "Failed to save statuses.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-1">Manage Project Statuses</h2>
        <p className="text-sm text-gray-500 mb-4">
          Define the workflow statuses for your project. Drag to reorder.
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              placeholder="Add new status (e.g., 'Review')"
              className="w-full border px-3 py-2 rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
            />
            <Button onClick={handleAddStatus} variant="primary" size="small">
              <Plus size={16} /> Add
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center p-10">Loading statuses...</div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="statuses">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {statuses.map((status, index) => (
                      <Draggable key={status.id} draggableId={status.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={provided.draggableProps.style}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between bg-gray-100 p-2 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <GripVertical className="text-gray-400" size={16} />
                              <span>{status.name}</span>
                            </div>
                            <button onClick={() => handleRemoveStatus(index)} className="text-gray-500 hover:text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Skip for Now
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Statuses"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManageStatusesModal;