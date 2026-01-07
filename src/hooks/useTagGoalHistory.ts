import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TagGoalHistory {
  id: string;
  user_id: string;
  tag_id: string;
  budget_goal: number | null;
  time_goal_minutes: number | null;
  period: string;
  actual_budget: number;
  actual_time_minutes: number;
  period_start: string;
  period_end: string;
  goal_achieved: boolean;
  created_at: string;
}

export function useTagGoalHistory(tagId?: string) {
  const { user } = useAuth();
  const [history, setHistory] = useState<TagGoalHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('tag_goal_history')
        .select('*')
        .eq('user_id', user.id)
        .order('period_end', { ascending: false });

      if (tagId) {
        query = query.eq('tag_id', tagId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory((data || []) as TagGoalHistory[]);
    } catch (error) {
      console.error('Error fetching tag goal history:', error);
    } finally {
      setLoading(false);
    }
  }, [user, tagId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addHistoryEntry = async (entry: Omit<TagGoalHistory, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tag_goal_history')
        .insert({
          ...entry,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setHistory(prev => [data as TagGoalHistory, ...prev]);
      return data as TagGoalHistory;
    } catch (error) {
      console.error('Error adding goal history:', error);
      return null;
    }
  };

  const getAchievementRate = (tagId?: string): number => {
    const filtered = tagId ? history.filter(h => h.tag_id === tagId) : history;
    if (filtered.length === 0) return 0;
    const achieved = filtered.filter(h => h.goal_achieved).length;
    return Math.round((achieved / filtered.length) * 100);
  };

  return {
    history,
    loading,
    addHistoryEntry,
    getAchievementRate,
    refetch: fetchHistory,
  };
}
