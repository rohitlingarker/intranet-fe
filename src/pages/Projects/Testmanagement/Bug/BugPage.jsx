import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  createBug,
  updateBugStatus,
  listBugs,
  bugSummaries,
} from "../api/bugApi"; 
import LoadingSpinner from "../../../../components/LoadingSpinner";

const BugPage = () => {
    const { projectId } = useParams();
  const [bugs, setBugs] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    runCaseId: "",
    runCaseStepId: "",
    title: "",
    description: "",
    expected: "",
    actual: "",
    reproductionSteps: "",
    severity: "MEDIUM",
    priority: "NORMAL",
    assignedTo: "",
  });

  // Fetch Bugs
  const fetchBugs = async () => {
    try {
      setLoading(true);
      const res = await listBugs(projectId, page, size);
      setBugs(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to load bugs", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Summaries
  const fetchSummaries = async () => {
    try {
      const res = await bugSummaries(projectId);
      setSummaries(res.data);
    } catch (err) {
      console.error("Failed to load summaries", err);
    }
  };

  useEffect(() => {
    fetchBugs();
    fetchSummaries();
  }, [projectId, page]);

  // Create Bug Handler
  const handleCreateBug = async () => {
    try {
      const payload = {
        ...form,
        runCaseId: Number(form.runCaseId),
        runCaseStepId: form.runCaseStepId ? Number(form.runCaseStepId) : null,
        assignedTo: form.assignedTo ? Number(form.assignedTo) : null,
      };

      await createBug(payload);
      setShowModal(false);
      fetchBugs();
    } catch (e) {
      console.error("Error creating bug", e);
    }
  };

  // Update Status Handler
  const handleStatusChange = async (bugId, status) => {
    try {
      await updateBugStatus(bugId, { status });
      fetchBugs();
    } catch (e) {
      console.error("Status update failed", e);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Bug Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          + Create Bug
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {summaries.map((s) => (
          <div key={s.id} className="p-4 bg-white shadow rounded-lg border">
            <div className="font-semibold">{s.title}</div>
            <div className="text-gray-500">{s.status.label}</div>
            <div className="text-sm">Priority: {s.priority}</div>
          </div>
        ))}
      </div>

      {/* Bug List Table */}
      <div className="bg-white shadow border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">Title</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Priority</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Assigned To</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-center" colSpan={5}>
                  <LoadingSpinner text="Loading..."/>
                </td>
              </tr>
            ) : bugs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500 italic font-semibold">
                  No bugs found.
                </td>
              </tr>
            ) : (
              bugs.map((bug) => (
                <tr key={bug.id} className="border-b">
                  <td className="px-4 py-2">{bug.title}</td>
                  <td className="px-4 py-2">{bug.priority}</td>

                  {/* Status Dropdown */}
                  <td className="px-4 py-2">
                    <select
                      className="border px-2 py-1 rounded"
                      value={bug.status}
                      onChange={(e) =>
                        handleStatusChange(bug.id, e.target.value)
                      }
                    >
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="READY_FOR_RETEST">Ready For Retest</option>
                      <option value="REOPENED">Reopened</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </td>

                  <td className="px-4 py-2">{bug.assignedTo || "-"}</td>

                  <td className="px-4 py-2 text-right">
                    <button className="text-blue-600 hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between p-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* CREATE BUG MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">Create Bug</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Form Inputs */}
              {[
                "runCaseId",
                "runCaseStepId",
                "title",
                "description",
                "expected",
                "actual",
                "reproductionSteps",
                "assignedTo",
              ].map((field) => (
                <div className="col-span-2" key={field}>
                  <label className="block text-sm font-medium capitalize">
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 mt-1"
                    value={form[field]}
                    onChange={(e) =>
                      setForm({ ...form, [field]: e.target.value })
                    }
                  />
                </div>
              ))}

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium">Severity</label>
                <select
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: e.target.value })
                  }
                >
                  <option>LOW</option>
                  <option>MEDIUM</option>
                  <option>HIGH</option>
                  <option>CRITICAL</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium">Priority</label>
                <select
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  <option>NORMAL</option>
                  <option>HIGH</option>
                  <option>URGENT</option>
                </select>
              </div>
            </div>

            {/* Button Row */}
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBug}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
              >
                Create Bug
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BugPage;