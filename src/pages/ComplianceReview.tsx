import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApplicationCard } from '@/components/ApplicationCard';
import { useAllApplications, useApplicationStats } from '@/hooks/useApplications';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Clock, CheckCircle } from 'lucide-react';

const ComplianceReview: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const { data: allApplications, isLoading } = useAllApplications();
  const stats = useApplicationStats(allApplications);
  
  const applications = allApplications?.filter(app => {
    if (filter === 'pending') {
      return app.status === 'compliance_review';
    }
    if (filter === 'completed') {
      return app.status === 'approved' || app.status === 'rejected';
    }
    return app.status === 'compliance_review' || app.status === 'approved' || app.status === 'rejected';
  }) || [];

  const pendingCount = stats.complianceReview;

  return (
    <DashboardLayout allowedRoles={['compliance_officer', 'admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance Review</h1>
          <p className="text-muted-foreground">Perform KYC verification and approve applications</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            <Shield size={16} className="mr-2" />
            All
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            <Clock size={16} className="mr-2" />
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            <CheckCircle size={16} className="mr-2" />
            Completed
          </Button>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Applications for Compliance Review</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${applications.length} application(s) found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-success" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Applications</h3>
                <p className="text-muted-foreground">
                  {filter === 'pending' 
                    ? 'No applications pending compliance review.' 
                    : 'No applications match your filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((application) => (
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

export default ComplianceReview;
