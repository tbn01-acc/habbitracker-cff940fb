-- Table for tag goal history (tracking changes)
CREATE TABLE IF NOT EXISTS public.tag_goal_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tag_id UUID REFERENCES public.user_tags(id) ON DELETE CASCADE,
  budget_goal NUMERIC,
  time_goal_minutes INTEGER,
  period VARCHAR(20) NOT NULL DEFAULT 'monthly',
  actual_budget NUMERIC DEFAULT 0,
  actual_time_minutes INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  goal_achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tag_goal_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for tag_goal_history
CREATE POLICY "Users can view own goal history" 
ON public.tag_goal_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal history" 
ON public.tag_goal_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goal history" 
ON public.tag_goal_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goal history" 
ON public.tag_goal_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Table for Robokassa payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency VARCHAR(10) DEFAULT 'RUB',
  status VARCHAR(20) DEFAULT 'pending', -- pending, success, fail
  payment_method VARCHAR(50) DEFAULT 'robokassa',
  invoice_id VARCHAR(100) UNIQUE NOT NULL,
  subscription_period VARCHAR(20), -- monthly, quarterly, annual, etc.
  robokassa_inv_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Service can update payments (via edge function)
CREATE POLICY "Service can update payments" 
ON public.payments 
FOR UPDATE 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_tag_goal_history_user_tag ON public.tag_goal_history(user_id, tag_id);