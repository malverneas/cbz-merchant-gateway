/**
 * Email utility service using EmailJS REST API
 */

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

/**
 * Sends an email using the EmailJS API
 */
export const sendEmail = async (templateParams: Record<string, any>) => {
  console.log('DEBUG: Attempting to send EmailJS notification...');

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.error('DEBUG: EmailJS environment variables are not fully set.');
    return { success: false, error: 'EmailJS not configured' };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DEBUG: EmailJS API error:', errorText);
      return { success: false, error: errorText || 'Failed to send email' };
    }

    console.log('DEBUG: EmailJS sent successfully!');
    return { success: true };
  } catch (error) {
    console.error('DEBUG: Error sending EmailJS email:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Sends an application status update notification
 */
export const sendApplicationStatusEmail = async (
  email: string,
  businessName: string,
  status: 'approved' | 'rejected' | 'additional_documents_requested'
) => {
  const statusLabels: Record<string, string> = {
    approved: 'Approved',
    rejected: 'Declined',
    additional_documents_requested: 'Additional Information Required',
  };

  const dashboardUrl = `${window.location.origin}/dashboard`;
  const currentTime = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Map these variables to your EmailJS Template
  const templateParams = {
    to_email: email,
    business_name: businessName,
    merchant_name: businessName, // Fallback for name
    status: statusLabels[status],
    dashboard_url: dashboardUrl,
    time: currentTime,
    message: status === 'approved'
      ? 'We are pleased to inform you that your application has been Approved.'
      : status === 'rejected'
        ? 'After careful review, we regret to inform you that your application has been Declined.'
        : 'Our review team requires additional documentation to proceed with your application.',
  };

  return sendEmail(templateParams);
};
