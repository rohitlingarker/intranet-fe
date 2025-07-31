import { useEffect, useState } from "react";

interface Approver {
  id: number;
  name: string;
}

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

const ITEMS_PER_PAGE = 8;

const ApprovalTrackerPage = () => {
  const [data, setData] = useState<ApprovalRow[]>([]);
  const [allUsers, setAllUsers] = useState<Approver[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showApproverInput, setShowApproverInput] = useState(null);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const fetchSummaryData = async () => {
    try {
      const res = await fetch(
        "http://localhost:8080/api/user-approver-map/api/user-approver-summary"
      );
      const resData = await res.json();
      const transformed = resData.map((item: any) => ({
        ...item,
        newApproverId: "",
        newApproverName: "",
        showInput: false,
        showSuccess: false,
        showDuplicateError: false,
      }));
      setData(transformed);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/approversList/mock");
      const approvers = await res.json();
      setAllUsers(approvers);
    } catch (err) {
      console.error("Failed to fetch approvers list:", err);
    }
  };

  useEffect(() => {
    fetchSummaryData();
    fetchAllUsers();
  }, []);

  const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const handleInputChange = (userId: number, approverId: string) => {
    const approver = allUsers.find((a) => a.id === parseInt(approverId));
    setData((prev) =>
      prev.map((row) => {
        if (row.userId === userId) {
          const isDuplicate = row.approvers.some(
            (a) => a.id === parseInt(approverId)
          );
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

  const handleAssign = async (userId: number) => {
    const user = data.find((d) => d.userId === userId);
    if (!user || !user.newApproverId || user.showDuplicateError) return;

    try {
      const res = await fetch(
        "http://localhost:8080/api/user-approver-map/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            approverId: parseInt(user.newApproverId),
            rolePriority: "PRIMARY",
          }),
        }
      );

      if (!res.ok) throw new Error("Assign failed");

      await fetchSummaryData();
      setData((prev) =>
        prev.map((row) =>
          row.userId === userId
            ? {
                ...row,
                showInput: false,
                newApproverId: "",
                newApproverName: "",
                showSuccess: true,
                showDuplicateError: false,
              }
            : row
        )
      );

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

  const handleDeleteAll = async (userId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all approvers for this user?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/user-approver-map/delete/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      await fetchSummaryData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete approvers");
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Approvers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-center">
                Action
              </th>
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
                  <div className="flex flex-col gap-2 ">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition "
                          onClick={() => handleToggleInput(row.userId)}
                        >
                          Assign Approver
                        </button>
                      </div>
                      <button
                        className={` w-20 h-8  px-3 py-1 rounded transition text-white ${
                          row.approvers.length === 0
                            ? "bg-red-300 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                        onClick={() => handleDeleteAll(row.userId)}
                        disabled={row.approvers.length === 0}
                      >
                        Delete All
                      </button>
                    </div>

                    {row.showInput && (
                      <div className="">
                        <select
                          className="border border-gray-300 px-2 py-1 rounded :focus-within:display-block"
                          value={row.newApproverId || ""}
                          onChange={(e) =>
                            handleInputChange(row.userId, e.target.value)
                          }
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
                          className="  bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                          onClick={() => handleAssign(row.userId)}
                          disabled={row.showDuplicateError}
                        >
                          Save
                        </button>
                      </div>
                    )}

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
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
