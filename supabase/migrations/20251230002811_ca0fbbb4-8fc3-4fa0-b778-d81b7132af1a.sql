-- Add trial-related columns to subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_bonus_months INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Update handle_new_user function to create PRO trial subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_code TEXT;
  referrer_profile RECORD;
  trial_days INTEGER := 7;
  bonus_months INTEGER := 1;
BEGIN
  -- Check if user was referred
  referrer_code := new.raw_user_meta_data ->> 'referred_by';
  
  IF referrer_code IS NOT NULL AND referrer_code != '' THEN
    -- Find referrer by code
    SELECT * INTO referrer_profile 
    FROM public.profiles 
    WHERE referral_code = referrer_code;
    
    IF referrer_profile.user_id IS NOT NULL THEN
      -- Referred user gets 14 days trial and 2 bonus months
      trial_days := 14;
      bonus_months := 2;
      
      -- Create referral record
      INSERT INTO public.referrals (referrer_id, referred_id)
      VALUES (referrer_profile.user_id, new.id);
    END IF;
  END IF;

  -- Create profile
  INSERT INTO public.profiles (user_id, display_name, avatar_url, referred_by)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    referrer_profile.user_id
  );

  -- Create PRO trial subscription
  INSERT INTO public.subscriptions (
    user_id, 
    plan, 
    is_trial, 
    trial_bonus_months,
    trial_ends_at,
    expires_at
  )
  VALUES (
    new.id,
    'pro',
    true,
    bonus_months,
    now() + (trial_days || ' days')::interval,
    now() + (trial_days || ' days')::interval
  );

  RETURN new;
END;
$$;