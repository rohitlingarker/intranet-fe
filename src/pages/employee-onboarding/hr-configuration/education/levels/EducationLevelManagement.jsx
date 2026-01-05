import { useEffect, useState } from "react";
import axios from "axios";

export default function EducationLevelManagement() {
  const [levels, setLevels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const BASE = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;
  const token = localStorage.getItem("token");

  const fetchLevels = async () => {
    const res = await axios.get(`${BASE}/masters/education-level`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLevels(res.data);
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const deleteLevel = async (uuid) => {
    if (!confirm("Delete education level?")) return;
    await axios.delete(`${BASE}/masters/education-level/${uuid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchLevels();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-semibold">Education Levels</h1>
        <button
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
          className="bg-blue-700 text-white px-4 py-2 rounded"
        >
          + Add
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((l) => (
            <tr key={l.education_uuid} className="border-t">
              <td className="p-3">{l.education_name}</td>
              <td className="p-3">{l.description || "—"}</td>
              <td className="p-3 text-right space-x-4">
                <button
                  className="text-blue-700"
                  onClick={() => {
                    setEditData(l);
                    setShowModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-red-600"
                  onClick={() => deleteLevel(l.education_uuid)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <LevelModal
          editData={editData}
          onClose={() => setShowModal(false)}
          onSuccess={fetchLevels}
        />
      )}
    </div>
  );
}

function LevelModal({ editData, onClose, onSuccess }) {
  const [name, setName] = useState(editData?.education_name || "");
  const [desc, setDesc] = useState(editData?.description || "");

  const BASE = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;
  const token = localStorage.getItem("token");

  const save = async () => {
    const payload = { education_name: name, description: desc };

    if (editData) {
      await axios.put(
        `${BASE}/masters/education-level/${editData.education_uuid}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post(`${BASE}/masters/education-level`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    onClose();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="font-semibold mb-4">
          {editData ? "Edit" : "Add"} Education Level
        </h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Education Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="border p-2 w-full mb-4"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2">
            Cancel
          </button>
          <button onClick={save} className="bg-blue-700 text-white px-4 py-2">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
