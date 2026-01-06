-- Create table for tag goals (budget and time targets)
CREATE TABLE public.tag_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tag_id UUID NOT NULL REFERENCES public.user_tags(id) ON DELETE CASCADE,
  budget_goal NUMERIC,
  time_goal_minutes INTEGER,
  period TEXT NOT NULL DEFAULT 'monthly', -- weekly, monthly
  notify_on_exceed BOOLEAN DEFAULT true,
  notify_on_milestone BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.tag_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own tag goals"
ON public.tag_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tag goals"
ON public.tag_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tag goals"
ON public.tag_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tag goals"
ON public.tag_goals FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_tag_goals_updated_at
BEFORE UPDATE ON public.tag_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();