import React, { useEffect, useState } from "react";

// Approver structure
interface Approver {
  id: number;
  name: string;
}

// Structure for each user-approver row
interface ApprovalRow {
  userId: number;
  userName: string;
  approvers: Approver[];
  newApproverId?: string;
  newApproverName?: string;
  showInput?: boolean;
  showSuccess?: boolean;
  showDuplicateError?: boolean;
}

// Pagination limit
const ITEMS_PER_PAGE = 8;

const ApprovalTrackerPage = () => {
  const [data, setData] = useState<ApprovalRow[]>([]);
  const [allUsers, setAllUsers] = useState<Approver[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  useEffect(() => {
    // Fetch user-approver summary
    fetch("http://localhost:8080/api/user-approver-map/api/user-approver-summary")
      .then((res) => res.json())
      .then((resData) => {
        setData(
          resData.map((item: any) => ({
            ...item,
            newApproverId: "",
            newApproverName: "",
            showInput: false,
            showSuccess: false,
            showDuplicateError: false,
          }))
        );
      })
      .catch((err) => console.error("Failed to fetch summary:", err));

    // Fetch list of all available approvers
    fetch("http://localhost:8080/approversList/mock")
      .then((res) => res.json())
      .then((approvers) => {
        setAllUsers(approvers);
      })
      .catch((err) => console.error("Failed to fetch approvers list:", err));
  }, []);

  // Get current page data
  const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Toggle visibility of dropdown
  const handleToggleInput = (userId: number) => {
    setData((prev) =>
      prev.map((row) =>
        row.userId === userId
          ? {
              ...row,
              showInput: !row.showInput,
              showSuccess: false,
              showDuplicateError: false,
              newApproverId: "",
              newApproverName: "",
            }
          : row
      )
    );
  };

  // Handle selection change
  const handleInputChange = (userId: number, approverId: string) => {
    const approver = allUsers.find((u) => u.id === parseInt(approverId));

    setData((prev) =>
      prev.map((row) => {
        if (row.userId === userId) {
          const isDuplicate = row.approvers.some((a) => a.id === parseInt(approverId));
          return {
            ...row,
            newApproverId: approverId,
            newApproverName: approver?.name || "",
            showDuplicateError: isDuplicate,
            showSuccess: false,
          };
        }
        return row;
      })
    );
  };

  // Assign the selected approver
  const handleAssign = async (userId: number) => {
    const user = data.find((u) => u.userId === userId);
    if (!user || !user.newApproverId || user.showDuplicateError) return;

    try {
      const approverId = parseInt(user.newApproverId);

      const response = await fetch("http://localhost:8080/api/user-approver-map/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          approverId: approverId,
          rolePriority: "PRIMARY",
        }),
      });

      if (!response.ok) throw new Error("Assign failed");

      const approverName = user.newApproverName || `ID ${approverId}`;

      setData((prev) =>
        prev.map((row) =>
          row.userId === userId
            ? {
                ...row,
                approvers: [...row.approvers, { id: approverId, name: approverName }],
                newApproverId: "",
                newApproverName: "",
                showInput: false,
                showSuccess: true,
              }
            : row
        )
      );

      // Auto-hide success after 3 seconds
      setTimeout(() => {
        setData((prev) =>
          prev.map((row) =>
            row.userId === userId ? { ...row, showSuccess: false } : row
          )
        );
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to assign approver");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Approver Assignment Dashboard
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-[#b22a4f] text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Approvers</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.userId}>
                <td className="px-6 py-3">{row.userId}</td>
                <td className="px-6 py-3">{row.userName}</td>
                <td className="px-6 py-3">
                  {row.approvers.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {row.approvers.map((a) => (
                        <li key={a.id}>
                          {a.name} (ID {a.id})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">None</span>
                  )}
                </td>
                <td className="px-6 py-3 w-80">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        onClick={() => handleToggleInput(row.userId)}
                      >
                        Assign Approver
                      </button>
                      {row.showInput && (
                        <>
                          <select
                            className="border border-gray-300 px-2 py-1 rounded w-48"
                            value={row.newApproverId || ""}
                            onChange={(e) => handleInputChange(row.userId, e.target.value)}
                          >
                            <option value="">Select Approver</option>
                            {allUsers.map((approver) => {
                              const isAlreadyAssigned = row.approvers.some(
                                (a) => a.id === approver.id
                              );
                              return (
                                <option
                                  key={approver.id}
                                  value={approver.id}
                                  disabled={isAlreadyAssigned}
                                >
                                  {approver.name} (ID {approver.id}){" "}
                                  {isAlreadyAssigned ? " - Already Assigned" : ""}
                                </option>
                              );
                            })}
                          </select>
                          <button
                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                            onClick={() => handleAssign(row.userId)}
                            disabled={row.showDuplicateError}
                          >
                            Save
                          </button>
                        </>
                      )}
                    </div>
                    {row.showSuccess && (
                      <span className="text-green-600 text-sm font-medium">
                        Approver assigned successfully!
                      </span>
                    )}
                    {row.showDuplicateError && (
                      <span className="text-red-600 text-sm font-medium">
                        This ID is already assigned to user.
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="px-6 py-4 bg-white">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === i + 1
                          ? "bg-[#b22a4f] text-white"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ApprovalTrackerPage;
