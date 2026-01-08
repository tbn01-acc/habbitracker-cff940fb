-- Add columns to referrals table for activity tracking
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS active_days INTEGER DEFAULT 0;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS total_time_minutes INTEGER DEFAULT 0;
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;

-- Create referral_earnings table for tracking partner earnings
CREATE TABLE public.referral_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  earning_type TEXT NOT NULL CHECK (earning_type IN ('registration_bonus', 'payment_commission')),
  amount_rub DECIMAL(12, 2) DEFAULT 0,
  bonus_weeks INTEGER DEFAULT 0,
  payment_id UUID REFERENCES public.payments(id),
  commission_percent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_wallet table for tracking partner earnings balance
CREATE TABLE public.user_wallet (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance_rub DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_earned_rub DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_withdrawn_rub DECIMAL(12, 2) NOT NULL DEFAULT 0,
  bonus_weeks_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create withdrawal_requests table
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_rub DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  withdrawal_type TEXT NOT NULL CHECK (withdrawal_type IN ('cash', 'subscription', 'gift_certificate')),
  applied_multiplier DECIMAL(3, 1) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create referral_activity_log for tracking daily logins
CREATE TABLE public.referral_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Enable RLS on all new tables
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_earnings
CREATE POLICY "Users can view their own earnings" ON public.referral_earnings
  FOR SELECT USING (auth.uid() = referrer_id);

-- RLS policies for user_wallet
CREATE POLICY "Users can view their own wallet" ON public.user_wallet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet" ON public.user_wallet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON public.user_wallet
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for withdrawal_requests
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for referral_activity_log
CREATE POLICY "Users can view their own activity" ON public.referral_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" ON public.referral_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity" ON public.referral_activity_log
  FOR UPDATE USING (auth.uid() = user_id);

-- Add trigger for wallet updated_at
CREATE TRIGGER update_user_wallet_updated_at
  BEFORE UPDATE ON public.user_wallet
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update calculate_referral_bonus function with new logic
CREATE OR REPLACE FUNCTION public.calculate_referral_bonus_v2(
  referrer_user_id UUID,
  OUT bonus_weeks INTEGER,
  OUT commission_percent INTEGER
)
RETURNS RECORD
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_refs INTEGER;
  paid_refs INTEGER;
  is_pro BOOLEAN;
  is_lifetime BOOLEAN;
  paid_with_money BOOLEAN;
BEGIN
  bonus_weeks := 0;
  commission_percent := 0;

  -- Count active referrals (7+ days, 30+ minutes)
  SELECT COUNT(*)
  INTO active_refs
  FROM public.referrals
  WHERE referrer_id = referrer_user_id AND is_active = true;

  -- Count paid referrals
  SELECT COUNT(*)
  INTO paid_refs
  FROM public.referrals
  WHERE referrer_id = referrer_user_id AND referred_has_paid = true;

  -- Check if user has PRO subscription
  SELECT 
    (plan = 'pro' AND (expires_at IS NULL OR expires_at > now())),
    (period = 'lifetime'),
    (plan = 'pro' AND NOT COALESCE(is_trial, false))
  INTO is_pro, is_lifetime, paid_with_money
  FROM public.subscriptions
  WHERE user_id = referrer_user_id;

  is_pro := COALESCE(is_pro, false);
  is_lifetime := COALESCE(is_lifetime, false);
  paid_with_money := COALESCE(paid_with_money, false);

  -- Calculate bonus weeks based on user type
  IF is_pro AND paid_with_money THEN
    -- PRO users: +2 weeks per active referral
    bonus_weeks := active_refs * 2;
    
    -- Commission for paid referrals
    IF paid_refs >= 26 THEN
      commission_percent := 15;
    ELSIF paid_refs >= 11 THEN
      commission_percent := 10;
    ELSIF paid_refs >= 1 THEN
      commission_percent := 5;
    END IF;
  ELSIF is_lifetime THEN
    -- Lifetime users: only commission for paid referrals
    IF paid_refs >= 26 THEN
      commission_percent := 15;
    ELSIF paid_refs >= 11 THEN
      commission_percent := 10;
    ELSIF paid_refs >= 1 THEN
      commission_percent := 5;
    END IF;
  ELSE
    -- FREE users: +1 week per active referral
    bonus_weeks := active_refs;
    
    -- Bonus weeks for paid referrals
    IF paid_refs >= 26 THEN
      bonus_weeks := bonus_weeks + (paid_refs * 4);
    ELSIF paid_refs >= 11 THEN
      bonus_weeks := bonus_weeks + ((paid_refs - 10) * 3) + (10 * 2);
    ELSIF paid_refs >= 1 THEN
      bonus_weeks := bonus_weeks + (paid_refs * 2);
    END IF;
  END IF;
END;
$$;