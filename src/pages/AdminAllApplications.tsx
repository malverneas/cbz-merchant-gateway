import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApplicationCard } from '@/components/ApplicationCard';
import { useAllApplications, useApplicationStats } from '@/hooks/useApplications';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import {
    FileText,
    Search,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '@/lib/types';

const statusFilters: { value: ApplicationStatus | 'all'; label: string; icon: React.ElementType }[] = [
    { value: 'all', label: 'All', icon: FileText },
    { value: 'submitted', label: 'Submitted', icon: Clock },
    { value: 'under_review', label: 'Under Review', icon: Clock },
    { value: 'compliance_review', label: 'Compliance', icon: AlertTriangle },
    { value: 'approved', label: 'Approved', icon: CheckCircle },
    { value: 'rejected', label: 'Rejected', icon: XCircle },
    { value: 'additional_documents_requested', label: 'Action Required', icon: AlertTriangle },
];

const AdminAllApplications: React.FC = () => {
    const { data: applications, isLoading } = useAllApplications();
    const stats = useApplicationStats(applications);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');

    const filteredApplications = applications?.filter(app => {
        const matchesSearch = searchTerm === '' ||
            app.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.contact_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

        return matchesSearch && matchesStatus;
    }) || [];

    return (
        <DashboardLayout allowedRoles={['admin']}>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">All Applications</h1>
                    <p className="text-muted-foreground">View and manage all merchant applications</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Total', value: stats.total, color: 'text-info' },
                        { label: 'Pending', value: stats.submitted + stats.underReview + stats.complianceReview, color: 'text-warning' },
                        { label: 'Approved', value: stats.approved, color: 'text-success' },
                        { label: 'Rejected', value: stats.rejected, color: 'text-destructive' },
                    ].map((stat, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                {isLoading ? (
                                    <Skeleton className="h-8 w-12" />
                                ) : (
                                    <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                                )}
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search & Filter */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input
                                    placeholder="Search by business name, email, or contact..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {statusFilters.map((filter) => (
                                    <Button
                                        key={filter.value}
                                        variant={statusFilter === filter.value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setStatusFilter(filter.value)}
                                        className="text-xs"
                                    >
                                        {filter.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText size={20} className="text-primary" />
                            Applications ({filteredApplications.length})
                        </CardTitle>
                        <CardDescription>
                            {statusFilter === 'all'
                                ? 'Showing all applications'
                                : `Filtered by: ${statusFilters.find(f => f.value === statusFilter)?.label}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="text-center py-12">
                                <Building2 className="mx-auto text-muted-foreground mb-3" size={40} />
                                <p className="text-muted-foreground">
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'No applications match your filters.'
                                        : 'No applications have been submitted yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredApplications.map((application) => (
                                    <ApplicationCard
                                        key={application.id}
                                        application={application}
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

export default AdminAllApplications;
