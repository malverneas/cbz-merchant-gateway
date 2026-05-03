-- Migration: Add Real-time Notification System
-- Description: Creates notifications table and trigger for application status changes

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  status public.application_status,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 4. Function to handle status change
CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS trigger AS $$
DECLARE
  merchant_user_id uuid;
  notification_title text;
  notification_message text;
BEGIN
  -- Only trigger if status has changed
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    merchant_user_id := NEW.user_id;
    
    -- Define messages based on status
    CASE NEW.status
      WHEN 'submitted' THEN
        notification_title := 'Application Submitted';
        notification_message := 'Your application for ' || NEW.business_name || ' has been successfully submitted and is awaiting review.';
      WHEN 'under_review' THEN
        notification_title := 'Review in Progress';
        notification_message := 'Your application is now being reviewed by our onboarding team.';
      WHEN 'compliance_review' THEN
        notification_title := 'Compliance Review';
        notification_message := 'Your application has moved to the final compliance review stage.';
      WHEN 'approved' THEN
        notification_title := 'Application Approved!';
        notification_message := 'Congratulations! Your application for ' || NEW.business_name || ' has been approved.';
      WHEN 'rejected' THEN
        notification_title := 'Application Declined';
        notification_message := 'We regret to inform you that your application for ' || NEW.business_name || ' was not successful at this time.';
      WHEN 'additional_documents_requested' THEN
        notification_title := 'Action Required';
        notification_message := 'Our team needs more information or documents to proceed with your application.';
      ELSE
        notification_title := 'Status Update';
        notification_message := 'Your application status has been updated to ' || NEW.status || '.';
    END CASE;

    -- Insert into notifications table
    INSERT INTO public.notifications (user_id, title, message, status)
    VALUES (merchant_user_id, notification_title, notification_message, NEW.status);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger
DROP TRIGGER IF EXISTS on_application_status_change ON public.applications;
CREATE TRIGGER on_application_status_change
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_application_status_change();
