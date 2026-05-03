import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';
import { sendApplicationStatusEmail } from '@/lib/email';
import { sendApplicationStatusSMS } from '@/lib/sms';


export type Application = Tables<'applications'>;
export type ApplicationStatus = Application['status'];

export interface ApplicationWithProfile extends Application {
  reviewer_profile?: { name: string; email: string } | null;
  compliance_reviewer_profile?: { name: string; email: string } | null;
}

// Fetch all applications (for bank staff)
export const useAllApplications = () => {
  return useQuery({
    queryKey: ['applications', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
  });
};

// Fetch applications for current user (merchant)
export const useMyApplications = () => {
  const { user, session } = useAuth();
  const userId = session?.user?.id || user?.id;

  return useQuery({
    queryKey: ['applications', 'my', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
    enabled: !!userId,
  });
};

// Fetch applications by status
export const useApplicationsByStatus = (statuses: ApplicationStatus[]) => {
  return useQuery({
    queryKey: ['applications', 'status', statuses],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .in('status', statuses)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
  });
};

// Fetch single application by ID
export const useApplication = (id: string | undefined) => {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Application | null;
    },
    enabled: !!id,
  });
};

// Application data for creation
interface CreateApplicationData {
  business_name: string;
  trading_name?: string | null;
  business_type: string;
  registration_number: string;
  tax_id?: string | null;
  business_address: string;
  city: string;
  province?: string | null;
  postal_code?: string | null;
  country: string;
  website_url?: string | null;
  expected_monthly_volume?: string | null;
  business_description?: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}

// Create new application
export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (applicationData: CreateApplicationData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('applications')
        .insert({
          ...applicationData,
          user_id: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

// Update application
export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Application> & { id: string }) => {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications', data.id] });
    },
  });
};

// Submit application (change status from draft to submitted)
export const useSubmitApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Trigger notifications for submission
      const emailPromise = sendApplicationStatusEmail(data.contact_email, data.business_name, 'submitted');
      const smsPromise = sendApplicationStatusSMS(data.contact_phone, data.business_name, 'submitted');
      
      // Also create an in-app notification
      const notificationPromise = supabase.from('notifications').insert({
        user_id: data.user_id,
        title: 'Application Submitted',
        message: `Your application for ${data.business_name} has been successfully submitted and is under review.`,
        type: 'info'
      });
      
      Promise.allSettled([emailPromise, smsPromise, notificationPromise]).then((results) => {
        results.forEach((result, index) => {
          const names = ['Email', 'SMS', 'In-App'];
          const type = names[index];
          if (result.status === 'fulfilled') {
            const val = result.value as any;
            if (!val.error) {
              console.log(`DEBUG: Submission ${type} notification sent successfully!`);
            } else {
              console.error(`DEBUG: Submission ${type} notification failed:`, val.error);
            }
          } else {
            console.error(`DEBUG: Unexpected error in submission ${type} trigger:`, result.reason);
          }
        });
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

// Update application status (for bank staff)
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const updates: Partial<Application> = { status };

      // Add reviewer info based on status change
      if (status === 'under_review' || status === 'compliance_review') {
        updates.reviewed_at = new Date().toISOString();
        updates.reviewed_by = user?.id;
      }

      if (status === 'approved' || status === 'rejected') {
        updates.compliance_reviewed_at = new Date().toISOString();
        updates.compliance_reviewed_by = user?.id;
      }

      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('DEBUG: Application status updated successfully to:', status);
      
      // Trigger multi-channel notifications
      // In a real app, these would ideally be triggered by a backend edge function
      // but we implement them here for immediate effect as per current project pattern.
      
      // Trigger multi-channel notifications
      const emailPromise = sendApplicationStatusEmail(data.contact_email, data.business_name, status);
      const smsPromise = sendApplicationStatusSMS(data.contact_phone, data.business_name, status);
      
      // Also create an in-app notification
      const notificationPromise = supabase.from('notifications').insert({
        user_id: data.user_id,
        title: 'Application Update',
        message: `Your application for ${data.business_name} is now ${status.replace('_', ' ')}.`,
        type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info'
      });
      
      // Handle notification results
      Promise.allSettled([emailPromise, smsPromise, notificationPromise]).then((results) => {
        results.forEach((result, index) => {
          const names = ['Email', 'SMS', 'In-App'];
          const type = names[index];
          if (result.status === 'fulfilled') {
            const val = result.value as any;
            if (!val.error) {
              console.log(`DEBUG: ${type} notification sent successfully!`);
            } else {
              console.error(`DEBUG: ${type} notification failed:`, val.error);
            }
          } else {
            console.error(`DEBUG: Unexpected error in ${type} trigger:`, result.reason);
          }
        });
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

// Get application statistics
export const useApplicationStats = (applications: Application[] | undefined) => {
  if (!applications) {
    return {
      total: 0,
      draft: 0,
      submitted: 0,
      underReview: 0,
      complianceReview: 0,
      approved: 0,
      rejected: 0,
      additionalDocuments: 0,
    };
  }

  return {
    total: applications.length,
    draft: applications.filter(a => a.status === 'draft').length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    complianceReview: applications.filter(a => a.status === 'compliance_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    additionalDocuments: applications.filter(a => a.status === 'additional_documents_requested').length,
  };
};
