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
  status: string
) => {
  const statusLabels: Record<string, string> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    compliance_review: 'Compliance Review',
    approved: 'Approved',
    rejected: 'Declined',
    additional_documents_requested: 'Additional Information Required',
  };

  const dashboardUrl = `${window.location.origin}/dashboard`;
  const currentTime = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  let message = '';
  switch (status) {
    case 'submitted':
      message = `We have received your application for ${businessName}. Our team will begin the review process shortly.`;
      break;
    case 'under_review':
      message = `Your application for ${businessName} is now under review by our onboarding team.`;
      break;
    case 'compliance_review':
      message = `Your application for ${businessName} has passed initial review and is now in compliance review.`;
      break;
    case 'approved':
      message = `Congratulations! Your application for ${businessName} has been Approved. You can now start using our services.`;
      break;
    case 'rejected':
      message = `After careful review, we regret to inform you that your application for ${businessName} has been Declined.`;
      break;
    case 'additional_documents_requested':
      message = `Our review team requires additional documentation to proceed with your application for ${businessName}. Please log in to your dashboard to see the details.`;
      break;
    default:
      message = `Your application status for ${businessName} has been updated to ${status}.`;
  }

  // Map these variables to your EmailJS Template
  const templateParams = {
    to_email: email,
    business_name: businessName,
    merchant_name: businessName, // Fallback for name
    status: statusLabels[status] || status,
    dashboard_url: dashboardUrl,
    time: currentTime,
    message: message,
  };

  return sendEmail(templateParams);
};


/**
 * Sends login credentials to a newly created staff member
 */
export const sendNewUserCredentialsEmail = async (
  email: string,
  name: string,
  password: string,
  roleName: string
) => {
  const loginUrl = `${window.location.origin}/auth`;

  const templateParams = {
    to_email: email,
    merchant_name: name,
    business_name: 'CBZ Bank E-Commerce Services',
    status: 'Account Created',
    dashboard_url: loginUrl,
    time: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    message: `Welcome to CBZ Bank E-Commerce Services! Your ${roleName} account has been created.\n\nYour login credentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease sign in at ${loginUrl} and change your password after your first login.`,
  };

  return sendEmail(templateParams);
};
