import { useEffect, useState } from "react";
import axios from "axios";

export default function EducationDocumentManagement() {
  const [docs, setDocs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const BASE = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;
  const token = localStorage.getItem("token");

  const fetchDocs = async () => {
    const res = await axios.get(`${BASE}/education/education-document`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDocs(res.data);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const deleteDoc = async (uuid) => {
    if (!confirm("Delete document?")) return;
    await axios.delete(`${BASE}/education/education-document/${uuid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDocs();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-semibold">Education Documents</h1>
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
            <th className="p-3 text-left">Document</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.education_document_uuid} className="border-t">
              <td className="p-3">{d.document_name}</td>
              <td className="p-3">{d.description || "—"}</td>
              <td className="p-3 text-right space-x-4">
                <button
                  className="text-blue-700"
                  onClick={() => {
                    setEditData(d);
                    setShowModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-red-600"
                  onClick={() => deleteDoc(d.education_document_uuid)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <DocumentModal
          editData={editData}
          onClose={() => setShowModal(false)}
          onSuccess={fetchDocs}
        />
      )}
    </div>
  );
}

function DocumentModal({ editData, onClose, onSuccess }) {
  const [name, setName] = useState(editData?.document_name || "");
  const [desc, setDesc] = useState(editData?.description || "");

  const BASE = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;
  const token = localStorage.getItem("token");

  const save = async () => {
    const payload = { document_name: name, description: desc };

    if (editData) {
      await axios.put(
        `${BASE}/education/education-document/${editData.education_document_uuid}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post(
        `${BASE}/education/create_education_document`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    onClose();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="font-semibold mb-4">
          {editData ? "Edit" : "Add"} Document
        </h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Document Name"
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
