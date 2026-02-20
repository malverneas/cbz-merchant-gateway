import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MerchantDashboard } from './dashboards/MerchantDashboard';
import { OnboardingDashboard } from './dashboards/OnboardingDashboard';
import { ComplianceDashboard } from './dashboards/ComplianceDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'merchant':
        return <MerchantDashboard />;
      case 'onboarding_officer':
        return <OnboardingDashboard />;
      case 'compliance_officer':
        return <ComplianceDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <MerchantDashboard />;
    }
  };

  return renderDashboard();
};

export default Dashboard;
