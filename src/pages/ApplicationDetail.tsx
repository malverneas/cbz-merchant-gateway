import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useApplication, useUpdateApplicationStatus } from '@/hooks/useApplications';
import { useApplicationDocuments, useDocumentUrl } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Building2,
  User,
  FileText,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  ExternalLink,
  Edit,
  ShoppingCart
} from 'lucide-react';

// Document download component
const DocumentItem: React.FC<{ doc: { id: string; name: string; file_path: string; uploaded_at: string } }> = ({ doc }) => {
  const { data: signedUrl, isLoading } = useDocumentUrl(doc.file_path);

  const handleDownload = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <FileText className="text-primary" size={20} />
        <div>
          <p className="font-medium text-foreground text-sm">{doc.name}</p>
          <p className="text-xs text-muted-foreground">
            Uploaded {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={handleDownload} disabled={isLoading}>
        {isLoading ? (
          <span className="text-xs">Loading...</span>
        ) : (
          <>
            <ExternalLink size={16} className="mr-1" />
            View
          </>
        )}
      </Button>
    </div>
  );
};

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [comment, setComment] = useState('');

  const { data: application, isLoading } = useApplication(id);
  const { data: documents, isLoading: docsLoading } = useApplicationDocuments(id);
  const updateStatus = useUpdateApplicationStatus();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground">Application not found</h2>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const canReview = user?.role === 'onboarding_officer' || user?.role === 'admin';
  const canApprove = user?.role === 'compliance_officer' || user?.role === 'admin';
  const isMerchant = user?.role === 'merchant';

  const handleStatusChange = async (newStatus: 'under_review' | 'compliance_review' | 'approved' | 'rejected' | 'additional_documents_requested') => {
    try {
      await updateStatus.mutateAsync({ id: application.id, status: newStatus });

      const statusLabels: Record<string, string> = {
        under_review: 'marked as Under Review',
        compliance_review: 'forwarded to Compliance',
        approved: 'Approved',
        rejected: 'Rejected',
        additional_documents_requested: 'marked for Additional Documents',
      };

      toast({
        title: 'Status Updated',
        description: `Application has been ${statusLabels[newStatus]}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status.',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;

    toast({
      title: 'Comment Added',
      description: 'Your comment has been added to the application.',
    });
    setComment('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{application.business_name}</h1>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-muted-foreground">
                {application.submitted_at
                  ? `Submitted on ${format(new Date(application.submitted_at), 'MMMM d, yyyy')}`
                  : `Created on ${format(new Date(application.created_at), 'MMMM d, yyyy')}`
                }
              </p>
            </div>
            {isMerchant && application.status === 'additional_documents_requested' && (
              <Button variant="hero" onClick={() => navigate(`/apply/${application.id}`)}>
                <Edit size={16} className="mr-2" />
                Edit & Re-submit
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="font-medium text-foreground">{application.business_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nature of Business</p>
                  <p className="font-medium text-foreground">{(application as any).nature_of_business || application.business_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium text-foreground">{(application as any).account_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Number (Proprietor/Manager)</p>
                  <p className="font-medium text-foreground">{(application as any).id_number || application.registration_number}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium text-foreground">
                    {application.business_address}, {application.city}
                    {application.province && `, ${application.province}`}, {application.country}
                  </p>
                </div>
                {application.website_url && (
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <p className="font-medium text-foreground">{application.website_url}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Types */}
          {(application as any).service_types && (application as any).service_types.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart size={20} className="text-primary" />
                  Service Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {((application as any).service_types as string[]).map((type: string) => {
                    const labels: Record<string, string> = { paylink: 'Paylink', payment_gateway: 'Payment Gateway', zikimall: 'Zikimall' };
                    return (
                      <span key={type} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {labels[type] || type}
                      </span>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} className="text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium text-foreground">{application.contact_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{application.contact_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{application.contact_phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Uploaded Documents
              </CardTitle>
              <CardDescription>
                {docsLoading ? 'Loading...' : `${documents?.length || 0} document(s) uploaded`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {docsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <DocumentItem key={doc.id} doc={doc} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No documents uploaded yet</p>
              )}
            </CardContent>
          </Card>

          {/* Timeline / Status Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm">
                    <span className="font-medium">Created:</span>{' '}
                    {format(new Date(application.created_at), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
                {application.submitted_at && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-info" />
                    <p className="text-sm">
                      <span className="font-medium">Submitted:</span>{' '}
                      {format(new Date(application.submitted_at), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                )}
                {application.reviewed_at && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    <p className="text-sm">
                      <span className="font-medium">Reviewed:</span>{' '}
                      {format(new Date(application.reviewed_at), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                )}
                {application.compliance_reviewed_at && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <p className="text-sm">
                      <span className="font-medium">Compliance Reviewed:</span>{' '}
                      {format(new Date(application.compliance_reviewed_at), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments & Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" />
                Comments & Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4 mb-4">No comments yet</p>

              {/* Add Comment */}
              {!isMerchant && (
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Add a comment or note..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={handleAddComment} className="flex-shrink-0">
                    <Send size={16} />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!isMerchant && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  {canReview && application.status === 'submitted' && 'Review this application and forward to compliance'}
                  {canApprove && application.status === 'compliance_review' && 'Complete KYC review and make a decision'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {canReview && (application.status === 'submitted' || application.status === 'under_review') && (
                    <>
                      <Button
                        variant="default"
                        onClick={() => handleStatusChange('compliance_review')}
                        disabled={updateStatus.isPending}
                      >
                        <Send size={16} className="mr-2" />
                        Forward to Compliance
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange('additional_documents_requested')}
                        disabled={updateStatus.isPending}
                      >
                        <AlertTriangle size={16} className="mr-2" />
                        Request Documents
                      </Button>
                    </>
                  )}

                  {canApprove && application.status === 'compliance_review' && (
                    <>
                      <Button
                        variant="default"
                        className="bg-success hover:bg-success/90"
                        onClick={() => handleStatusChange('approved')}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Approve Application
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusChange('rejected')}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle size={16} className="mr-2" />
                        Reject Application
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange('additional_documents_requested')}
                        disabled={updateStatus.isPending}
                      >
                        <AlertTriangle size={16} className="mr-2" />
                        Request Documents
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationDetail;