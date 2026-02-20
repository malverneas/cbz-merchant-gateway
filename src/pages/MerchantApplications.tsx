import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApplicationCard } from '@/components/ApplicationCard';
import { useMyApplications } from '@/hooks/useApplications';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText } from 'lucide-react';

const MerchantApplications: React.FC = () => {
  const { data: applications, isLoading } = useMyApplications();

  return (
    <DashboardLayout allowedRoles={['merchant']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
            <p className="text-muted-foreground">View and manage your merchant applications</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/apply">
              <Plus size={18} className="mr-2" />
              New Application
            </Link>
          </Button>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${applications?.length || 0} application(s) found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : !applications || applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-muted-foreground" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Applications</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  You haven't submitted any applications yet. Start by creating a new application.
                </p>
                <Button variant="hero" asChild>
                  <Link to="/apply">
                    <Plus size={18} className="mr-2" />
                    Create Application
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application}
                    showMerchantInfo={false}
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

export default MerchantApplications;
