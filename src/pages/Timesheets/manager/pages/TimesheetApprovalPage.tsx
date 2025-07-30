import TimesheetApprovalTable from '../components/TimesheetApprovalTable';

const TimesheetApprovalPage = () => {
  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <h2 className="text-xl font-semibold mb-4">Pending Timesheet Approvals</h2>
      <TimesheetApprovalTable />
    </div>
  );
};

export default TimesheetApprovalPage;
