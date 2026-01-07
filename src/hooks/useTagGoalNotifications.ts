import { useEffect, useCallback, useRef } from 'react';
import { useTagGoals } from './useTagGoals';
import { useUserTags } from './useUserTags';
import { useFinance } from './useFinance';
import { useTimeTracker } from './useTimeTracker';
import { useTasks } from './useTasks';
import { useTranslation } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export function useTagGoalNotifications() {
  const { goals } = useTagGoals();
  const { tags } = useUserTags();
  const { transactions } = useFinance();
  const { tasks } = useTasks();
  const timeTracker = useTimeTracker();
  const { t, language } = useTranslation();
  const notifiedGoals = useRef<Set<string>>(new Set());

  const checkGoalExceeded = useCallback(() => {
    const now = new Date();

    goals.forEach(goal => {
      if (!goal.notify_on_exceed) return;

      const tag = tags.find(t => t.id === goal.tag_id);
      if (!tag) return;

      const periodStart = goal.period === 'weekly' 
        ? startOfWeek(now, { weekStartsOn: 1 })
        : startOfMonth(now);
      const periodEnd = goal.period === 'weekly'
        ? endOfWeek(now, { weekStartsOn: 1 })
        : endOfMonth(now);

      // Calculate period expense for this tag
      const tagTransactions = transactions.filter(t => t.tagIds?.includes(goal.tag_id));
      const periodExpense = tagTransactions
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'expense' && t.completed && date >= periodStart && date <= periodEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate period time for this tag's tasks
      const tagTaskIds = new Set(tasks.filter(t => t.tagIds?.includes(goal.tag_id)).map(t => t.id));
      const periodTime = timeTracker.entries
        .filter(e => {
          const date = new Date(e.startTime);
          return e.taskId && tagTaskIds.has(e.taskId) && date >= periodStart && date <= periodEnd;
        })
        .reduce((sum, e) => sum + e.duration, 0);

      const notificationKey = `${goal.id}-${periodStart.toISOString()}`;

      // Check budget exceeded
      if (goal.budget_goal && periodExpense > goal.budget_goal) {
        const budgetKey = `budget-${notificationKey}`;
        if (!notifiedGoals.current.has(budgetKey)) {
          notifiedGoals.current.add(budgetKey);
          
          // Send browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(
              language === 'ru' ? 'Превышен бюджет!' : 'Budget Exceeded!',
              {
                body: language === 'ru' 
                  ? `Тег "${tag.name}": потрачено ${periodExpense.toLocaleString()} ₽ из ${goal.budget_goal.toLocaleString()} ₽`
                  : `Tag "${tag.name}": spent ${periodExpense.toLocaleString()} ₽ of ${goal.budget_goal.toLocaleString()} ₽`,
                icon: '/top-focus-icon.png',
                tag: budgetKey,
              }
            );
          }
          
          toast.warning(
            language === 'ru' 
              ? `Превышен бюджет для "${tag.name}"`
              : `Budget exceeded for "${tag.name}"`,
            {
              description: language === 'ru'
                ? `${periodExpense.toLocaleString()} / ${goal.budget_goal.toLocaleString()} ₽`
                : `${periodExpense.toLocaleString()} / ${goal.budget_goal.toLocaleString()} ₽`
            }
          );
        }
      }

      // Check time exceeded
      if (goal.time_goal_minutes && periodTime > goal.time_goal_minutes) {
        const timeKey = `time-${notificationKey}`;
        if (!notifiedGoals.current.has(timeKey)) {
          notifiedGoals.current.add(timeKey);
          
          const actualHours = Math.round(periodTime / 60 * 10) / 10;
          const goalHours = Math.round(goal.time_goal_minutes / 60 * 10) / 10;
          
          // Send browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(
              language === 'ru' ? 'Превышен лимит времени!' : 'Time Limit Exceeded!',
              {
                body: language === 'ru' 
                  ? `Тег "${tag.name}": потрачено ${actualHours} ч из ${goalHours} ч`
                  : `Tag "${tag.name}": spent ${actualHours}h of ${goalHours}h`,
                icon: '/top-focus-icon.png',
                tag: timeKey,
              }
            );
          }
          
          toast.warning(
            language === 'ru' 
              ? `Превышен лимит времени для "${tag.name}"`
              : `Time limit exceeded for "${tag.name}"`,
            {
              description: `${actualHours} / ${goalHours} ${language === 'ru' ? 'ч' : 'h'}`
            }
          );
        }
      }

      // Check milestone (50%, 75%, 90%)
      if (goal.notify_on_milestone) {
        const milestones = [50, 75, 90];
        
        if (goal.budget_goal) {
          const budgetPercent = Math.round((periodExpense / goal.budget_goal) * 100);
          milestones.forEach(milestone => {
            const milestoneKey = `budget-milestone-${milestone}-${notificationKey}`;
            if (budgetPercent >= milestone && budgetPercent < milestone + 10 && !notifiedGoals.current.has(milestoneKey)) {
              notifiedGoals.current.add(milestoneKey);
              toast.info(
                language === 'ru' 
                  ? `${milestone}% бюджета для "${tag.name}"`
                  : `${milestone}% budget for "${tag.name}"`,
                {
                  description: `${periodExpense.toLocaleString()} / ${goal.budget_goal.toLocaleString()} ₽`
                }
              );
            }
          });
        }

        if (goal.time_goal_minutes) {
          const timePercent = Math.round((periodTime / goal.time_goal_minutes) * 100);
          milestones.forEach(milestone => {
            const milestoneKey = `time-milestone-${milestone}-${notificationKey}`;
            if (timePercent >= milestone && timePercent < milestone + 10 && !notifiedGoals.current.has(milestoneKey)) {
              notifiedGoals.current.add(milestoneKey);
              const actualHours = Math.round(periodTime / 60 * 10) / 10;
              const goalHours = Math.round(goal.time_goal_minutes / 60 * 10) / 10;
              toast.info(
                language === 'ru' 
                  ? `${milestone}% времени для "${tag.name}"`
                  : `${milestone}% time for "${tag.name}"`,
                {
                  description: `${actualHours} / ${goalHours} ${language === 'ru' ? 'ч' : 'h'}`
                }
              );
            }
          });
        }
      }
    });
  }, [goals, tags, transactions, tasks, timeTracker.entries, language]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check goals periodically
  useEffect(() => {
    checkGoalExceeded();
    const interval = setInterval(checkGoalExceeded, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkGoalExceeded]);

  return { checkGoalExceeded };
}
