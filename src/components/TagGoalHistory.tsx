import { useMemo } from 'react';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { History, TrendingUp, TrendingDown, Check, X, Clock, Wallet } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { useTagGoalHistory } from '@/hooks/useTagGoalHistory';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TagGoalHistoryProps {
  tagId: string;
  tagColor: string;
}

export function TagGoalHistory({ tagId, tagColor }: TagGoalHistoryProps) {
  const { t, language } = useTranslation();
  const { history, loading, getAchievementRate } = useTagGoalHistory(tagId);
  const locale = language === 'ru' ? ru : enUS;
  const isRu = language === 'ru';

  const achievementRate = useMemo(() => getAchievementRate(tagId), [tagId, getAchievementRate]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-6 text-center">
        <History className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">
          {isRu ? 'История целей пока пуста' : 'Goal history is empty'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {isRu ? 'Данные появятся после завершения периодов' : 'Data will appear after periods complete'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Achievement Rate */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {isRu ? 'Общий процент достижения' : 'Overall Achievement Rate'}
          </span>
          <span className="text-lg font-bold" style={{ color: tagColor }}>
            {achievementRate}%
          </span>
        </div>
        <Progress value={achievementRate} className="h-2" />
      </Card>

      {/* History List */}
      <div className="space-y-3">
        {history.map(entry => {
          const periodStart = format(new Date(entry.period_start), 'd MMM', { locale });
          const periodEnd = format(new Date(entry.period_end), 'd MMM yyyy', { locale });
          
          const budgetProgress = entry.budget_goal 
            ? Math.round((entry.actual_budget / entry.budget_goal) * 100) 
            : null;
          const timeProgress = entry.time_goal_minutes 
            ? Math.round((entry.actual_time_minutes / entry.time_goal_minutes) * 100)
            : null;

          return (
            <Card key={entry.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {periodStart} — {periodEnd}
                  </p>
                  <Badge variant={entry.goal_achieved ? 'default' : 'secondary'} className="mt-1">
                    {entry.goal_achieved ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        {isRu ? 'Достигнуто' : 'Achieved'}
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 mr-1" />
                        {isRu ? 'Не достигнуто' : 'Not achieved'}
                      </>
                    )}
                  </Badge>
                </div>
                {entry.goal_achieved ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
              </div>

              <div className="space-y-2">
                {entry.budget_goal && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{isRu ? 'Бюджет:' : 'Budget:'}</span>
                    <span className={entry.actual_budget <= entry.budget_goal ? 'text-green-500' : 'text-destructive'}>
                      {entry.actual_budget.toLocaleString()} / {entry.budget_goal.toLocaleString()} ₽
                    </span>
                    <span className="text-muted-foreground">({budgetProgress}%)</span>
                  </div>
                )}
                {entry.time_goal_minutes && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{isRu ? 'Время:' : 'Time:'}</span>
                    <span className={entry.actual_time_minutes <= entry.time_goal_minutes ? 'text-green-500' : 'text-destructive'}>
                      {Math.round(entry.actual_time_minutes / 60 * 10) / 10} / {Math.round(entry.time_goal_minutes / 60)} {isRu ? 'ч' : 'h'}
                    </span>
                    <span className="text-muted-foreground">({timeProgress}%)</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
