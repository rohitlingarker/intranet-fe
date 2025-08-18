import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL;
 
const EmployeeLeaveBalances = () => {
  const [data, setData] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const token = localStorage.getItem('token');
 
  useEffect(() => {
    fetchLeaveData();
  }, []);
 
  const fetchLeaveData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/leave-balance/all-leave-balances`,{
          headers:{
            Authorization: `Bearer ${token}`
          }
        }
      );
      const raw = response.data;
 
      const groupedByEmployee = {};
 
      raw.forEach((entry) => {
        const empId = entry.employee?.employeeId || "Unknown";
        const empName = `${entry.employee?.firstName || ""} ${
          entry.employee?.lastName || ""
        }`.trim();
        const gender = entry?.employee?.gender;
        const year = entry?.year;
 
        if (!groupedByEmployee[empId]) {
          groupedByEmployee[empId] = {
            employeeId: empId,
            employeeName: empName,
            employeeGender: gender,
            balances: {},
          };
        }
 
        const leaveTypeName = entry.leaveType.leaveName;
        groupedByEmployee[empId].balances[leaveTypeName] = {
          ...entry,
          remainingLeaves: entry.remainingLeaves,
          leaveTypeId: entry.leaveType.leaveTypeId,
          year: entry.year,
        };
      });
 
      const allLeaveTypes = Array.from(
        new Map(
          raw.map((entry) => [
            entry.leaveType.leaveName,
            {
              leaveTypeName: entry.leaveType.leaveName,
              leaveTypeId: entry.leaveType.leaveTypeId,
            },
          ])
        ).values()
      );
 
      setLeaveTypes(allLeaveTypes);
      setData(Object.values(groupedByEmployee));
    } catch (error) {
      console.error("Error fetching leave balances", error);
    }
  };
 
  const handleEdit = (employee) => {
    setSelectedEmployee({ ...employee });
    setIsEditModalOpen(true);
  };
 
  const handleSubmit = async () => {
    try {
      const gender = selectedEmployee?.employeeGender?.toLowerCase();
 
      const filteredBalances = leaveTypes
        .filter(({ leaveTypeName }) => {
          const lowerName = leaveTypeName.toLowerCase();
          const isMaternity = lowerName.includes("maternity");
          const isPaternity = lowerName.includes("paternity");
 
          // ❌ Exclude maternity for males, paternity for females, or if gender unknown
          if (
            (isMaternity && gender === "male") ||
            (isPaternity && gender === "female") ||
            ((isMaternity || isPaternity) && !gender)
          ) {
            return false;
          }
 
          return true;
        })
        .map(({ leaveTypeName, leaveTypeId }) => ({
          leaveTypeId,
          remainingLeaves:
            selectedEmployee.balances[leaveTypeName]?.remainingLeaves ?? 0,
          year:
            selectedEmployee.balances[leaveTypeName]?.year ??
            new Date().getFullYear(),
        }));
 
      const payload = {
        employeeId: selectedEmployee.employeeId,
        balances: filteredBalances,
      };
 
      await axios.put(
        `${BASE_URL}/api/leave-balance/update`,
        payload,{
          headers:{
            Authorization: `Bearer ${token}`
          }
        }
      );
 
      toast.success("Leave balances updated successfully");
      setIsEditModalOpen(false);
      fetchLeaveData();
    } catch (err) {
      toast.error("Error updating leave balances");
      console.error(err);
    }
  };
 
  return (
    <>
      <div className="p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-6">Employee Leave Balances</h2>
 
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-max text-sm text-left border-collapse relative">
            <thead className="bg-gray-100 text-base">
              <tr>
                <th className="border px-6 py-3 sticky left-0 bg-gray-100 z-10 min-w-[200px]">
                  Employee Id
                </th>
                <th className="border px-6 py-3 sticky left-[200px] bg-gray-100 z-10 min-w-[250px]">
                  Employee Name
                </th>
                {leaveTypes.map(({ leaveTypeName }) => (
                  <th
                    key={leaveTypeName}
                    className="border px-6 py-3 text-center min-w-[160px] whitespace-nowrap"
                  >
                    {leaveTypeName}
                  </th>
                ))}
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
 
            <tbody className="text-sm">
              {data.map((emp) => (
                <tr key={emp.employeeId}>
                  <td className="border px-6 py-2 sticky left-0 bg-white z-10 font-medium min-w-[200px]">
                    {emp.employeeId}
                  </td>
                  <td className="border px-6 py-2 sticky left-[200px] bg-white z-10 font-medium min-w-[250px]">
                    {emp.employeeName}
                  </td>
                  {leaveTypes.map(({ leaveTypeName }) => (
                    <td
                      key={leaveTypeName}
                      className="border px-6 py-2 text-center min-w-[160px] whitespace-nowrap"
                    >
                      {emp.balances[leaveTypeName]?.remainingLeaves ?? "-"}
                    </td>
                  ))}
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
 
      {isEditModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">
              Edit Leave Balances – {selectedEmployee.employeeName}
            </h3>
 
            <div className="space-y-4">
              {leaveTypes.map(({ leaveTypeId, leaveTypeName }) => {
                const gender = selectedEmployee?.employeeGender?.toLowerCase();
                const totalLeaves =
                  selectedEmployee.balances[leaveTypeName]?.leaveType
                    ?.maxDaysPerYear ?? "N/A";
                const currentValue =
                  selectedEmployee.balances[leaveTypeName]?.remainingLeaves ??
                  "";
 
                const isMaternity = leaveTypeName
                  .toLowerCase()
                  .includes("maternity");
                const isPaternity = leaveTypeName
                  .toLowerCase()
                  .includes("paternity");
 
                let isDisabled = false;
                if (
                  (isMaternity && gender === "male") ||
                  (isPaternity && gender === "female") ||
                  ((isMaternity || isPaternity) && !gender)
                ) {
                  isDisabled = true;
                }
 
                return (
                  <div
                    key={leaveTypeId}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <label className="font-medium min-w-[150px]">
                      {leaveTypeName}
                    </label>
                    <div className="flex items-center gap-2 w-full sm:w-[300px]">
                      <input
                        type="number"
                        disabled={isDisabled}
                        className={`border px-3 py-2 w-full rounded shadow-sm ${
                          isDisabled
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : ""
                        }`}
                        value={isDisabled ? 0 : currentValue}
                        onChange={(e) => {
                          if (isDisabled) return;
                          const updated = { ...selectedEmployee };
                          if (!updated.balances[leaveTypeName])
                            updated.balances[leaveTypeName] = {};
                          updated.balances[leaveTypeName].remainingLeaves =
                            parseFloat(e.target.value);
                          setSelectedEmployee(updated);
                        }}
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        Total: {totalLeaves}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
 
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
 
export default EmployeeLeaveBalances;