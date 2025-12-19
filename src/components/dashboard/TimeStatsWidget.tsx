import { motion } from 'framer-motion';
import { Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { useTimeTracker } from '@/hooks/useTimeTracker';
import { useTasks } from '@/hooks/useTasks';
import { useTranslation } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

export function TimeStatsWidget() {
  const { t } = useTranslation();
  const { getTodayEntries, getTodayTotalTime, formatDuration, entries } = useTimeTracker();
  const { tasks } = useTasks();

  const todayEntries = getTodayEntries();
  const todayTotal = getTodayTotalTime();

  // Calculate week stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEntries = entries.filter(e => new Date(e.startTime) >= weekAgo);
  const weekTotal = weekEntries.reduce((sum, e) => sum + e.duration, 0);
  const avgPerDay = weekTotal / 7;

  // Top task by time today
  const taskTimeMap = new Map<string, number>();
  todayEntries.forEach(entry => {
    const current = taskTimeMap.get(entry.taskId) || 0;
    taskTimeMap.set(entry.taskId, current + entry.duration);
  });
  
  let topTask: { name: string; time: number } | null = null;
  taskTimeMap.forEach((time, taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && (!topTask || time > topTask.time)) {
      topTask = { name: task.name, time };
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl p-4 shadow-card border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-task" />
          <span className="font-medium text-sm">{t('timeSpent') || 'Учёт времени'}</span>
        </div>
        <Link to="/tasks" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Today */}
        <div className="bg-muted/50 rounded-xl p-3">
          <div className="text-2xl font-bold text-foreground">
            {formatDuration(todayTotal)}
          </div>
          <div className="text-xs text-muted-foreground">{t('today') || 'Сегодня'}</div>
        </div>

        {/* Week avg */}
        <div className="bg-muted/50 rounded-xl p-3">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-2xl font-bold text-foreground">
              {formatDuration(Math.round(avgPerDay))}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">{t('week')}</div>
        </div>
      </div>

      {/* Top task */}
      {topTask && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-1">{t('timeByTask')}</div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate flex-1">{topTask.name}</span>
            <span className="text-sm text-service font-medium">{formatDuration(topTask.time)}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
