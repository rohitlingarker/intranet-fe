import useLeaveConsumption from "../hooks/useLeaveConsumption";
import LeaveUsageChart from "./LeaveUsageChart";

export default function LeaveDashboard({ employeeId }) {
  const { leaveData, loading } = useLeaveConsumption(employeeId);

  if (loading) return <p className="text-center">Loading leave data...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {leaveData.map((leave) => {
        const { leaveName } = leave.leaveType;

        if (leaveName === "Paternity Leave") return null;

        const isUnpaid = leaveName === "Unpaid";

        return (
          <div
            key={leave.balanceId}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center w-full justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{leaveName}</h3>
              <button className="text-indigo-600 text-sm hover:text-indigo-800 transition-colors">
                View details
              </button>
            </div>

            {!isUnpaid && <LeaveUsageChart leave={leave} />}

            <div className="space-y-2 mt-4">
              {!isUnpaid && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">AVAILABLE</span>
                    <span className="text-gray-500">CONSUMED</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>
                      {Math.max(leave.accruedLeaves - leave.usedLeaves, 0)} days
                    </span>
                    <span>{leave.usedLeaves} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ACCRUED SO FAR</span>
                    <span className="text-gray-500">ANNUAL QUOTA</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>{leave.accruedLeaves} days</span>
                    <span>{leave.totalLeaves || "-"} days</span>
                  </div>
                </>
              )}

              {isUnpaid && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">CONSUMED</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>{leave.usedLeaves} days</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">AVAILABLE</span>
                    <span className="text-gray-500">ACCRUED</span>
                    <span className="text-gray-500">ANNUAL QUOTA</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
