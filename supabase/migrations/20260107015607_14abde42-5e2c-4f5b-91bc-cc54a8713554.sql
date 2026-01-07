-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service can update payments" ON public.payments;

-- Create more restrictive update policy - only status updates for matching invoice
CREATE POLICY "Users can update own payments" 
ON public.payments 
FOR UPDATE 
USING (auth.uid() = user_id);