import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApplicationCard } from '@/components/ApplicationCard';
import { useAllApplications, useApplicationStats } from '@/hooks/useApplications';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  CheckCircle, 
  Send,
  ArrowRight,
  ClipboardCheck
} from 'lucide-react';

export const OnboardingDashboard: React.FC = () => {
  const { data: applications, isLoading } = useAllApplications();
  const stats = useApplicationStats(applications);
  
  // Get applications that need onboarding review
  const pendingReview = applications?.filter(a => 
    a.status === 'submitted' || a.status === 'under_review'
  ) || [];
  
  const statCards = [
    { 
      label: 'Pending Review', 
      value: stats.submitted, 
      icon: Clock, 
      color: 'text-warning' 
    },
    { 
      label: 'In Review', 
      value: stats.underReview, 
      icon: ClipboardCheck, 
      color: 'text-info' 
    },
    { 
      label: 'Forwarded', 
      value: stats.complianceReview, 
      icon: Send, 
      color: 'text-status-compliance' 
    },
    { 
      label: 'Completed', 
      value: stats.approved + stats.rejected, 
      icon: CheckCircle, 
      color: 'text-success' 
    },
  ];

  return (
    <DashboardLayout allowedRoles={['onboarding_officer', 'admin']}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Onboarding Dashboard</h1>
          <p className="text-muted-foreground">Review and process merchant applications</p>
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

        {/* Applications Requiring Review */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Applications Requiring Review</CardTitle>
              <CardDescription>Newly submitted applications awaiting initial review</CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/onboarding/review">
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
            ) : pendingReview.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-success" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">No applications pending review at this time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReview.slice(0, 5).map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application}
                    actionLabel="Review"
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
