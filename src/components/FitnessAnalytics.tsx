import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Dumbbell } from 'lucide-react';
import { useFitness } from '@/hooks/useFitness';
import { useTranslation } from '@/contexts/LanguageContext';
import { Period, PeriodSelector } from '@/components/PeriodSelector';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FitnessAnalyticsProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
}

const CHART_COLORS = [
  'hsl(262, 80%, 55%)',
  'hsl(168, 80%, 40%)',
  'hsl(35, 95%, 55%)',
  'hsl(200, 80%, 50%)',
  'hsl(340, 80%, 55%)',
  'hsl(145, 70%, 45%)',
];

export function FitnessAnalytics({ period, onPeriodChange }: FitnessAnalyticsProps) {
  const { t } = useTranslation();
  const { getAnalytics, exerciseCategories } = useFitness();

  const periodDays = period === '7' ? 7 : period === '14' ? 14 : 30;
  const analytics = useMemo(() => getAnalytics(periodDays), [getAnalytics, periodDays]);

  const categoryData = useMemo(() => {
    return Object.entries(analytics.byCategory).map(([catId, count], index) => {
      const category = exerciseCategories.find(c => c.id === catId);
      return {
        name: category?.name || t('uncategorized'),
        value: count,
        color: category?.color || CHART_COLORS[index % CHART_COLORS.length],
      };
    });
  }, [analytics.byCategory, exerciseCategories, t]);

  const statusData = useMemo(() => [
    { name: t('statusNotStarted'), value: analytics.byStatus.not_started, color: 'hsl(var(--muted-foreground))' },
    { name: t('statusInProgress'), value: analytics.byStatus.in_progress, color: 'hsl(35, 95%, 55%)' },
    { name: t('completed'), value: analytics.byStatus.completed, color: 'hsl(262, 80%, 55%)' },
  ], [analytics.byStatus, t]);

  const chartData = useMemo(() => {
    return analytics.dailyStats.map(stat => ({
      date: new Date(stat.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      exercises: stat.exercises,
      sets: stat.sets,
      weight: Math.round(stat.totalWeight / 1000),
    }));
  }, [analytics.dailyStats]);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-center">
        <PeriodSelector
          value={period}
          onValueChange={onPeriodChange}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-fitness/20 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-fitness" />
            </div>
            <span className="text-xs text-muted-foreground">{t('exercises')}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.completedExercises}</p>
          <p className="text-xs text-muted-foreground">/ {analytics.totalExercises}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-fitness/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-fitness" />
            </div>
            <span className="text-xs text-muted-foreground">{t('sets')}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.totalSets}</p>
          <p className="text-xs text-muted-foreground">{t('completed')}</p>
        </motion.div>
      </div>

      {/* Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-4 border border-border"
      >
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-fitness" />
          {t('activityByDay')}
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="sets" fill="hsl(262, 80%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 border border-border"
        >
          <h3 className="text-sm font-medium text-foreground mb-4">{t('byCategory')}</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {categoryData.map((cat, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-muted-foreground">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl p-4 border border-border"
      >
        <h3 className="text-sm font-medium text-foreground mb-4">{t('byStatus')}</h3>
        <div className="space-y-3">
          {statusData.map((status, index) => {
            const total = statusData.reduce((sum, s) => sum + s.value, 0);
            const percent = total > 0 ? (status.value / total) * 100 : 0;
            return (
              <div key={index}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{status.name}</span>
                  <span className="font-medium text-foreground">{status.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
