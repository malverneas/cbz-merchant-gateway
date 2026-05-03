import React from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl gradient-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center justify-end px-8 gap-4 sticky top-0 z-30">
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-8 text-foreground">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

