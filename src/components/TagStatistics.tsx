import { useMemo } from 'react';
import { Tag, CheckSquare, Repeat, Wallet } from 'lucide-react';
import { useUserTags } from '@/hooks/useUserTags';
import { useTasks } from '@/hooks/useTasks';
import { useHabits } from '@/hooks/useHabits';
import { useFinance } from '@/hooks/useFinance';
import { useTranslation } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TagStats {
  id: string;
  name: string;
  color: string;
  tasksCount: number;
  habitsCount: number;
  transactionsCount: number;
  totalCount: number;
}

export function TagStatistics() {
  const { tags, loading } = useUserTags();
  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { transactions } = useFinance();
  const { t } = useTranslation();

  const stats = useMemo<TagStats[]>(() => {
    return tags.map(tag => {
      const tasksCount = tasks.filter(task => 
        task.tagIds?.includes(tag.id)
      ).length;
      
      const habitsCount = habits.filter(habit => 
        habit.tagIds?.includes(tag.id)
      ).length;
      
      const transactionsCount = transactions.filter(transaction => 
        transaction.tagIds?.includes(tag.id)
      ).length;

      return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        tasksCount,
        habitsCount,
        transactionsCount,
        totalCount: tasksCount + habitsCount + transactionsCount,
      };
    }).sort((a, b) => b.totalCount - a.totalCount);
  }, [tags, tasks, habits, transactions]);

  const maxTotal = useMemo(() => {
    return Math.max(...stats.map(s => s.totalCount), 1);
  }, [stats]);

  const totalStats = useMemo(() => {
    return {
      tasks: stats.reduce((sum, s) => sum + s.tasksCount, 0),
      habits: stats.reduce((sum, s) => sum + s.habitsCount, 0),
      transactions: stats.reduce((sum, s) => sum + s.transactionsCount, 0),
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{t('noTagsCreated')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('createTagsInProfile')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-task/10 border-task/20">
          <CardContent className="p-4 text-center">
            <CheckSquare className="w-5 h-5 mx-auto text-task mb-1" />
            <p className="text-2xl font-bold text-task">{totalStats.tasks}</p>
            <p className="text-xs text-muted-foreground">{t('tasksLabel')}</p>
          </CardContent>
        </Card>
        <Card className="bg-habit/10 border-habit/20">
          <CardContent className="p-4 text-center">
            <Repeat className="w-5 h-5 mx-auto text-habit mb-1" />
            <p className="text-2xl font-bold text-habit">{totalStats.habits}</p>
            <p className="text-xs text-muted-foreground">{t('habitsLabel')}</p>
          </CardContent>
        </Card>
        <Card className="bg-finance/10 border-finance/20">
          <CardContent className="p-4 text-center">
            <Wallet className="w-5 h-5 mx-auto text-finance mb-1" />
            <p className="text-2xl font-bold text-finance">{totalStats.transactions}</p>
            <p className="text-xs text-muted-foreground">{t('operationsLabel')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tag Details */}
      <div className="space-y-3">
        {stats.map(stat => (
          <Card key={stat.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: stat.color }}
                />
                <h3 className="font-medium flex-1">{stat.name}</h3>
                <span className="text-sm text-muted-foreground">
                  {stat.totalCount} {t('total')}
                </span>
              </div>
              
              <Progress 
                value={(stat.totalCount / maxTotal) * 100} 
                className="h-2 mb-3"
              />
              
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-task" />
                  <span className="text-muted-foreground">{stat.tasksCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-habit" />
                  <span className="text-muted-foreground">{stat.habitsCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-finance" />
                  <span className="text-muted-foreground">{stat.transactionsCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
