import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/LanguageContext';

export interface TagGoal {
  id: string;
  user_id: string;
  tag_id: string;
  budget_goal: number | null;
  time_goal_minutes: number | null;
  period: 'weekly' | 'monthly';
  notify_on_exceed: boolean;
  notify_on_milestone: boolean;
  created_at: string;
  updated_at: string;
}

export function useTagGoals() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [goals, setGoals] = useState<TagGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tag_goals')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setGoals((data || []) as TagGoal[]);
    } catch (error) {
      console.error('Error fetching tag goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const upsertGoal = async (
    tagId: string,
    budgetGoal: number | null,
    timeGoalMinutes: number | null,
    period: 'weekly' | 'monthly' = 'monthly',
    notifyOnExceed: boolean = true,
    notifyOnMilestone: boolean = true
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tag_goals')
        .upsert({
          user_id: user.id,
          tag_id: tagId,
          budget_goal: budgetGoal,
          time_goal_minutes: timeGoalMinutes,
          period,
          notify_on_exceed: notifyOnExceed,
          notify_on_milestone: notifyOnMilestone,
        }, { onConflict: 'user_id,tag_id' })
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => {
        const existing = prev.find(g => g.tag_id === tagId);
        if (existing) {
          return prev.map(g => g.tag_id === tagId ? data as TagGoal : g);
        }
        return [...prev, data as TagGoal];
      });
      
      toast.success(t('save'));
      return data as TagGoal;
    } catch (error) {
      console.error('Error saving tag goal:', error);
      toast.error(t('error'));
      return null;
    }
  };

  const deleteGoal = async (tagId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('tag_goals')
        .delete()
        .eq('tag_id', tagId)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.tag_id !== tagId));
      toast.success(t('delete'));
      return true;
    } catch (error) {
      console.error('Error deleting tag goal:', error);
      toast.error(t('error'));
      return false;
    }
  };

  const getGoalForTag = (tagId: string): TagGoal | undefined => {
    return goals.find(g => g.tag_id === tagId);
  };

  return {
    goals,
    loading,
    upsertGoal,
    deleteGoal,
    getGoalForTag,
    refetch: fetchGoals,
  };
}
