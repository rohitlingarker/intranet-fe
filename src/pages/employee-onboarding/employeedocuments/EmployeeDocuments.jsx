import React, { useState } from "react";

export default function EmployeeDocumentsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [expandedEmp, setExpandedEmp] = useState(null);

  /* ================= MOCK DATA ================= */

  const [employees, setEmployees] = useState([
    {
      id: "EMP001",
      name: "John Smith",
      department: "Engineering",
      documents: [
        {
          id: 1,
          docName: "Offer Letter",
          type: "Generated",
          category: "Identity",
          updated: "12 Mar 2024",
          status: "Signed",
          fileUrl: "#",
        },
        {
          id: 2,
          docName: "ID Proof",
          type: "Uploaded",
          category: "Identity",
          updated: "14 Mar 2024",
          status: "Verified",
          fileUrl: "#",
        },
      ],
    },
    {
      id: "EMP007",
      name: "Tom Daris",
      department: "HR",
      documents: [
        {
          id: 3,
          docName: "Employment Contract",
          type: "Generated",
          category: "v2",
          updated: "10 Mar 2024",
          status: "Pending",
          fileUrl: "#",
        },
      ],
    },
    {
    id: "EMP002",
    name: "Alice Johnson",
    department: "Finance",
    documents: [
      {
        id: 3,
        docName: "Employment Contract",
        type: "Generated",
        category: "v2",
        updated: "10 Feb 2024",
        status: "Signed",
        fileUrl: "#",
      },
      {
        id: 4,
        docName: "PAN Card",
        type: "Uploaded",
        category: "Identity",
        updated: "11 Feb 2024",
        status: "Verified",
        fileUrl: "#",
      },
    ],
  },
  {
    id: "EMP003",
    name: "Michael Brown",
    department: "IT",
    documents: [
      {
        id: 5,
        docName: "NDA Agreement",
        type: "Generated",
        category: "Identity",
        updated: "01 Mar 2024",
        status: "Pending",
        fileUrl: "#",
      },
    ],
  },
  {
    id: "EMP004",
    name: "Sophia Williams",
    department: "HR",
    documents: [
      {
        id: 6,
        docName: "Offer Letter",
        type: "Generated",
        category: "Identity",
        updated: "22 Jan 2024",
        status: "Signed",
        fileUrl: "#",
      },
      {
        id: 7,
        docName: "Address Proof",
        type: "Uploaded",
        category: "Identity",
        updated: "25 Jan 2024",
        status: "Verified",
        fileUrl: "#",
      },
    ],
  },
  {
    id: "EMP005",
    name: "David Lee",
    department: "Operations",
    documents: [
      {
        id: 8,
        docName: "Joining Letter",
        type: "Generated",
        category: "Identity",
        updated: "18 Mar 2024",
        status: "Pending",
        fileUrl: "#",
      },
    ],
  },
  {
    id: "EMP006",
    name: "Emma Davis",
    department: "Marketing",
    documents: [
      {
        id: 9,
        docName: "Experience Certificate",
        type: "Generated",
        category: "Identity",
        updated: "05 Mar 2024",
        status: "Signed",
        fileUrl: "#",
      },
      {
        id: 10,
        docName: "Resume",
        type: "Uploaded",
        category: "Identity",
        updated: "05 Mar 2024",
        status: "Verified",
        fileUrl: "#",
      },
    ],
  },
]);


  /* ================= Delete Document ================= */

  const deleteDocument = (empId, docId) => {
    if (!window.confirm("Delete this document?")) return;

    const updated = employees.map((emp) => {
      if (emp.id !== empId) return emp;

      return {
        ...emp,
        documents: emp.documents.filter((doc) => doc.id !== docId),
      };
    });

    setEmployees(updated);
  };

  /* ================= Download ================= */

  const downloadDocument = () => {
    alert("Mock download triggered");
  };

  /* ================= Styles ================= */

  const container = { padding: "30px", background: "#f4f6f9" };

  const card = {
    background: "#fff",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  };

  const table = { width: "100%", borderCollapse: "collapse" };

  const thtd = {
    borderBottom: "1px solid #eee",
    padding: "10px",
    textAlign: "left",
  };

  const badge = (status) => ({
    padding: "4px 8px",
    borderRadius: "4px",
    color: "#fff",
    fontSize: "12px",
    background:
      status === "Signed"
        ? "#16a34a"
        : status === "Verified"
        ? "#3b82f6"
        : "#f59e0b",
  });

  /* ================= Render ================= */

  return (
    <div style={container}>
      <h2>Employee Documents</h2>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Search Employee Name / ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />

        <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        style={{ padding: "8px", marginLeft: "10px" }}
        >
        <option value="">All Categories</option>
        <option value="Identity">Identity</option>
        <option value="Education">Education</option>
        <option value="Work">Work</option>
        <option value="HR Document">HR Document</option>
        </select>
      </div>

      {/* Employees */}
      {employees
        .filter(
          (emp) =>
            emp.name.toLowerCase().includes(search.toLowerCase()) ||
            emp.id.toLowerCase().includes(search.toLowerCase())
        )
        .map((emp) => (
          <div key={emp.id} style={card}>
            {/* Employee Header */}
            <div
              style={{ cursor: "pointer" }}
              onClick={() =>
                setExpandedEmp(expandedEmp === emp.id ? null : emp.id)
              }
            >
              <h3>
                {emp.name} ({emp.id})
              </h3>
              <p style={{ color: "#666" }}>{emp.department}</p>
            </div>

            {/* Documents Table */}
            {expandedEmp === emp.id && (
              <table style={table}>
                <thead>
                  <tr>
                    <th style={thtd}>Document</th>
                    <th style={thtd}>Type</th>
                    <th style={thtd}>category</th>
                    <th style={thtd}>Updated</th>
                    <th style={thtd}>Status</th>
                    <th style={thtd}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {emp.documents
                    .filter(
                      (doc) =>
                        !categoryFilter || doc.category === categoryFilter
                    )
                    .map((doc) => (
                      <tr key={doc.id}>
                        <td style={thtd}>{doc.docName}</td>
                        <td style={thtd}>{doc.type}</td>
                        <td style={thtd}>{doc.category}</td>
                        <td style={thtd}>{doc.updated}</td>
                        <td style={thtd}>
                          <span style={badge(doc.status)}>
                            {doc.status}
                          </span>
                        </td>
                        <td style={thtd}>
                          <button
                            onClick={downloadDocument}
                            style={{ marginRight: "8px" }}
                          >
                            Download
                          </button>

                          <button
                            onClick={() =>
                              deleteDocument(emp.id, doc.id)
                            }
                            style={{ color: "red" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                  {emp.documents.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: "15px" }}>
                        No documents available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        ))}
    </div>
  );
}

