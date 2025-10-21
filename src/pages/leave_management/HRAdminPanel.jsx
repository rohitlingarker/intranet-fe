import React from 'react';
import ApprovalDashboard from './models/ApprovalDashboard';
import EnterpriseConfigManager from './EnterpriseConfigManager';

const HRAdminPanel = () => {
  return (
    // You can add more HR-Admin specific components here in the future
    <ApprovalDashboard />
    // <EnterpriseConfigManager />
  );
};

export default HRAdminPanel;