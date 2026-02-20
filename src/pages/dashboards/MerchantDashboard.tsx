import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApplicationCard } from '@/components/ApplicationCard';
import { useAuth } from '@/contexts/AuthContext';
import { useMyApplications, useApplicationStats } from '@/hooks/useApplications';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

export const MerchantDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: applications, isLoading } = useMyApplications();
  const stats = useApplicationStats(applications);
  
  const statCards = [
    { 
      label: 'Total Applications', 
      value: stats.total, 
      icon: FileText, 
      color: 'text-info' 
    },
    { 
      label: 'Pending Review', 
      value: stats.submitted + stats.underReview + stats.complianceReview, 
      icon: Clock, 
      color: 'text-warning' 
    },
    { 
      label: 'Approved', 
      value: stats.approved, 
      icon: CheckCircle, 
      color: 'text-success' 
    },
    { 
      label: 'Action Required', 
      value: stats.additionalDocuments, 
      icon: AlertCircle, 
      color: 'text-destructive' 
    },
  ];

  return (
    <DashboardLayout allowedRoles={['merchant']}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}</h1>
            <p className="text-muted-foreground">Manage your merchant applications</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/apply">
              <Plus size={18} className="mr-2" />
              New Application
            </Link>
          </Button>
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

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest merchant applications</CardDescription>
            </div>
            {applications && applications.length > 0 && (
              <Button variant="ghost" asChild>
                <Link to="/applications">
                  View All
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            )}
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
                <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Start your journey by submitting your first merchant application.
                </p>
                <Button variant="hero" asChild>
                  <Link to="/apply">
                    <Plus size={18} className="mr-2" />
                    Start Application
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 3).map((application) => (
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
