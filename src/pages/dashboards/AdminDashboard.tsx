import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApplicationCard } from '@/components/ApplicationCard';
import { useAllApplications, useApplicationStats } from '@/hooks/useApplications';
import { useProfilesWithRoles } from '@/hooks/useProfiles';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  ArrowRight,
  Building2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { data: applications, isLoading: applicationsLoading } = useAllApplications();
  const { data: users, isLoading: usersLoading } = useProfilesWithRoles();
  const stats = useApplicationStats(applications);
  
  const isLoading = applicationsLoading || usersLoading;
  
  const merchantCount = users?.filter(u => u.role === 'merchant').length || 0;
  const onboardingCount = users?.filter(u => u.role === 'onboarding_officer').length || 0;
  const complianceCount = users?.filter(u => u.role === 'compliance_officer').length || 0;
  const adminCount = users?.filter(u => u.role === 'admin').length || 0;
  
  const statCards = [
    { 
      label: 'Total Applications', 
      value: stats.total, 
      icon: FileText, 
      color: 'text-info',
      change: '+12%'
    },
    { 
      label: 'Registered Merchants', 
      value: merchantCount, 
      icon: Building2, 
      color: 'text-primary',
      change: '+8%'
    },
    { 
      label: 'Pending Review', 
      value: stats.submitted + stats.underReview + stats.complianceReview, 
      icon: Clock, 
      color: 'text-warning',
      change: null
    },
    { 
      label: 'Approved', 
      value: stats.approved, 
      icon: CheckCircle, 
      color: 'text-success',
      change: '+15%'
    },
  ];

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                      <Icon size={20} />
                    </div>
                    {stat.change && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        stat.change.startsWith('+') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest merchant applications</CardDescription>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/onboarding/review">
                  View All
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : !applications || applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No applications yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((application) => (
                    <ApplicationCard 
                      key={application.id} 
                      application={application}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Overview</CardTitle>
                <CardDescription>System users by role</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { role: 'Merchants', count: merchantCount, color: 'bg-info' },
                    { role: 'Onboarding Officers', count: onboardingCount, color: 'bg-warning' },
                    { role: 'Compliance Officers', count: complianceCount, color: 'bg-status-compliance' },
                    { role: 'Administrators', count: adminCount, color: 'bg-primary' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm text-foreground">{item.role}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Users</span>
                  {usersLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <span className="text-lg font-bold text-foreground">{users?.length || 0}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
