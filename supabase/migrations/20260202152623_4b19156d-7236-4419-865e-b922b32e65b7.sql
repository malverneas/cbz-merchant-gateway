-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Merchants can update their own draft applications" ON public.applications;

-- Create a new policy that allows merchants to update their own applications if:
-- 1. The application is in draft status (for editing)
-- 2. OR they're submitting it (changing from draft to submitted)
CREATE POLICY "Merchants can update their own applications"
ON public.applications
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND (status = 'draft' OR status = 'submitted')
)
WITH CHECK (
  auth.uid() = user_id
  AND status IN ('draft', 'submitted')
);