import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApplicationCard } from '@/components/ApplicationCard';
import { useAllApplications, useApplicationStats } from '@/hooks/useApplications';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export const ComplianceDashboard: React.FC = () => {
  const { data: applications, isLoading } = useAllApplications();
  const stats = useApplicationStats(applications);
  
  // Filter applications for compliance review
  const pendingCompliance = applications?.filter(a => a.status === 'compliance_review') || [];
  
  const statCards = [
    { 
      label: 'Pending Review', 
      value: stats.complianceReview, 
      icon: Clock, 
      color: 'text-status-compliance' 
    },
    { 
      label: 'Documents Requested', 
      value: stats.additionalDocuments, 
      icon: AlertTriangle, 
      color: 'text-warning' 
    },
    { 
      label: 'Approved', 
      value: stats.approved, 
      icon: CheckCircle, 
      color: 'text-success' 
    },
    { 
      label: 'Rejected', 
      value: stats.rejected, 
      icon: XCircle, 
      color: 'text-destructive' 
    },
  ];

  return (
    <DashboardLayout allowedRoles={['compliance_officer', 'admin']}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
          <p className="text-muted-foreground">Review KYC documents and approve applications</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      {isLoading ? (
                        <Skeleton className="h-9 w-12 mt-1" />
                      ) : (
                        <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                      )}
                    </div>
                    <div className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Applications Pending Compliance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Compliance Review</CardTitle>
              <CardDescription>Applications forwarded by onboarding team</CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/compliance/review">
                View All
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : pendingCompliance.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-success" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Reviews</h3>
                <p className="text-muted-foreground">All compliance reviews are complete.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCompliance.slice(0, 5).map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application}
                    actionLabel="Review KYC"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
