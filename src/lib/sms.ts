import { supabase } from "@/integrations/supabase/client";

export const sendSMS = async (phoneNumber: string, message: string) => {
  console.log(`DEBUG: Sending SMS via Supabase Edge Function to ${phoneNumber}...`);
  
  try {
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: { phoneNumber, message },
    });

    if (error) {
      console.error('DEBUG: Supabase Function error:', error);
      return { success: false, error: error.message };
    }

    console.log('DEBUG: SMS sent successfully via Edge Function!', data);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('DEBUG: Unexpected error in SMS trigger:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const sendApplicationStatusSMS = async (
  phoneNumber: string,
  businessName: string,
  status: string
) => {
  const statusLabels: Record<string, string> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    compliance_review: 'in Compliance Review',
    approved: 'Approved',
    rejected: 'Declined',
    additional_documents_requested: 'requiring Additional Documents',
  };

  const label = statusLabels[status] || status;
  const message = `CBZ Gateway: Your application for ${businessName} is now ${label}. Log in to the dashboard for details.`;

  return sendSMS(phoneNumber, message);
};
