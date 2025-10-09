import React from "react";

const ApprovalQueue = ({ actionType, payload }) => {
  let parsed = null;
  try {
    parsed = JSON.parse(payload);
  } catch (e) {
    console.error("Failed to parse approval payload:", e);
    return (
      <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">
        Error: Could not parse request details.
      </p>
    );
  }

  const formatKey = (key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  const isEmptyVal = (v) =>
    v === null || v === "" || v === false || (Array.isArray(v) && v.length === 0);

  const KeyValueTable = ({ obj }) => {
    const entries = Object.entries(obj || {}).filter(([, v]) => !isEmptyVal(v));
    if (entries.length === 0) {
      return <p className="text-sm text-gray-500">No details to display.</p>;
    }
    return (
      <div className="overflow-x-auto mt-4 border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Field
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map(([k, v]) => (
              <tr key={k}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                  {formatKey(k)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const DiffTable = ({ before, after }) => {
    const allKeys = Array.from(
      new Set([...(before ? Object.keys(before) : []), ...(after ? Object.keys(after) : [])])
    );

    const rows = allKeys
      .map((k) => {
        const b = before ? before[k] : undefined;
        const a = after ? after[k] : undefined;
        const changed = JSON.stringify(b ?? null) !== JSON.stringify(a ?? null);
        return { k, b, a, changed };
      })
      .filter((row) => row.changed || (!isEmptyVal(row.a) || !isEmptyVal(row.b)));

    if (rows.length === 0) {
      return <p className="text-sm text-gray-500">No changes detected.</p>;
    }

    return (
      <div className="overflow-x-auto mt-4 border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Field
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Before
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                After
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(({ k, b, a, changed }) => (
              <tr key={k} className={changed ? "bg-yellow-50" : ""}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                  {formatKey(k)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {typeof b === "object" ? JSON.stringify(b) : String(b)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {typeof a === "object" ? JSON.stringify(a) : String(a)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const BalancesTable = ({ balances }) => {
    if (!Array.isArray(balances) || balances.length === 0) {
      return <p className="text-sm text-gray-500">No balances provided.</p>;
    }
    return (
      <div className="overflow-x-auto mt-4 border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remaining
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {balances.map((b, idx) => (
              <tr key={`${b.leaveTypeId}-${idx}`}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                  {b.leaveTypeId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {b.remainingLeaves}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {b.year}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  switch (actionType) {
    case "CREATE_LEAVE_TYPE": {
      const newData = (parsed && parsed.newData) || {};
      return <KeyValueTable obj={newData} />;
    }
    case "UPDATE_LEAVE_TYPE": {
      const before = (parsed && parsed.before) || {};
      const after = (parsed && parsed.after) || {};
      return <DiffTable before={before} after={after} />;
    }
    case "DEACTIVATE_LEAVE_TYPE": {
      return <KeyValueTable obj={parsed} />;
    }
        case "UPDATE_EMPLOYEE_LEAVE_BALANCE": {
      // Accept three shapes:
      // 1) only newData
      // 2) beforeData + newData
      // 3) oldData.balances + newData
      const hasBeforeArray = Array.isArray(parsed?.beforeData);
      const hasOldObjectArray = Array.isArray(parsed?.oldData?.balances);

      const oldArray = hasBeforeArray
        ? parsed.beforeData
        : hasOldObjectArray
        ? parsed.oldData.balances
        : [];

      const newData = (parsed && parsed.newData) || {};
      const newArray = Array.isArray(newData.balances) ? newData.balances : [];

      // Summary fields
      const topEmployeeId =
        newData.employeeId ||
        parsed?.oldData?.employeeId ||
        (oldArray[0]?.employee?.employeeId ?? undefined);
      const performedBy = newData.performedBy ?? undefined;

      // Build maps keyed by leaveTypeId
      const oldMap = {};
      oldArray.forEach((row) => {
        const lt = row?.leaveType?.leaveTypeId;
        if (lt) {
          oldMap[lt] = {
            remainingLeaves: row.remainingLeaves,
            year: row.year,
            leaveName: row?.leaveType?.leaveName,
          };
        }
      });

      const newMap = {};
      newArray.forEach((b) => {
        if (b?.leaveTypeId) {
          newMap[b.leaveTypeId] = {
            remainingLeaves: b.remainingLeaves,
            year: b.year,
          };
        }
      });

      const allLeaveTypes = Array.from(
        new Set([...Object.keys(oldMap), ...Object.keys(newMap)])
      );

      const DiffRow = ({ lt }) => {
        const oldVal = oldMap[lt] || {};
        const newVal = newMap[lt] || {};
        const changed =
          JSON.stringify(oldVal.remainingLeaves ?? null) !==
          JSON.stringify(newVal.remainingLeaves ?? null);
        return (
          <tr key={lt} className={changed ? "bg-yellow-50" : ""}>
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
              {lt} {oldVal.leaveName ? `(${oldVal.leaveName})` : ""}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
              {oldVal.remainingLeaves ?? "-"}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
              {newVal.remainingLeaves ?? "-"}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
              {newVal.year ?? oldVal.year ?? "-"}
            </td>
          </tr>
        );
      };

      const ComparisonTable = () => (
        <div className="overflow-x-auto mt-4 border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Old Record
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Record
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allLeaveTypes.map((lt) => (
                <DiffRow key={lt} lt={lt} />
              ))}
            </tbody>
          </table>
        </div>
      );

      // const OldDetailsTable = () => {
      //   if (!Array.isArray(oldArray) || oldArray.length === 0) return null;
      //   return (
      //     <div className="overflow-x-auto mt-4 border border-gray-200 rounded-lg">
      //       <table className="min-w-full divide-y divide-gray-200">
      //         <thead className="bg-gray-50">
      //           <tr>
      //             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      //               Leave Type
      //             </th>
      //             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      //               Leave Name
      //             </th>
      //             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      //               Remaining
      //             </th>
      //             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      //               Year
      //             </th>
      //             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      //               Last Accrual
      //             </th>
      //           </tr>
      //         </thead>
      //         <tbody className="bg-white divide-y divide-gray-200">
      //           {oldArray.map((row, idx) => (
      //             <tr key={row.balanceId || idx}>
      //               <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
      //                 {row?.leaveType?.leaveTypeId}
      //               </td>
      //               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
      //                 {row?.leaveType?.leaveName}
      //               </td>
      //               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
      //                 {row?.remainingLeaves}
      //               </td>
      //               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
      //                 {row?.year}
      //               </td>
      //               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
      //                 {row?.lastAccrualDate || "-"}
      //               </td>
      //             </tr>
      //           ))}
      //         </tbody>
      //       </table>
      //     </div>
      //   );
      // };

      return (
        <div className="mt-4 space-y-4">
          {/* Summary */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                    Employee Id
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {topEmployeeId ?? "-"}
                  </td>
                </tr>
                {/* <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                    Performed By
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {performedBy ?? "-"}
                  </td>
                </tr> */}
              </tbody>
            </table>
          </div>

          {/* Diff by leave type */}
          <ComparisonTable />

          {/* Raw old details if present */}
          {/* {oldArray.length > 0 ? (
            <div>
              <div className="text-xs text-gray-500 mt-2">Old details</div>
              <OldDetailsTable />
            </div>
          ) : null} */}
        </div>
      );
    }
    default: {
      if (parsed && parsed.newData && typeof parsed.newData === "object") {
        return <KeyValueTable obj={parsed.newData} />;
      }
      return <KeyValueTable obj={parsed} />;
    }
  }
};

export default ApprovalQueue;