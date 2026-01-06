import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Wallet, Clock, Bell, BellOff } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { TagGoal } from '@/hooks/useTagGoals';
import { UserTag } from '@/hooks/useUserTags';

interface TagGoalDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    tagId: string,
    budgetGoal: number | null,
    timeGoalMinutes: number | null,
    period: 'weekly' | 'monthly',
    notifyOnExceed: boolean,
    notifyOnMilestone: boolean
  ) => Promise<TagGoal | null>;
  tag: UserTag;
  existingGoal?: TagGoal;
}

export function TagGoalDialog({ open, onClose, onSave, tag, existingGoal }: TagGoalDialogProps) {
  const { t, language } = useTranslation();
  const isRu = language === 'ru';
  
  const [budgetGoal, setBudgetGoal] = useState('');
  const [timeGoalHours, setTimeGoalHours] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [notifyOnExceed, setNotifyOnExceed] = useState(true);
  const [notifyOnMilestone, setNotifyOnMilestone] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingGoal) {
      setBudgetGoal(existingGoal.budget_goal?.toString() || '');
      setTimeGoalHours(existingGoal.time_goal_minutes ? (existingGoal.time_goal_minutes / 60).toString() : '');
      setPeriod(existingGoal.period);
      setNotifyOnExceed(existingGoal.notify_on_exceed);
      setNotifyOnMilestone(existingGoal.notify_on_milestone);
    } else {
      setBudgetGoal('');
      setTimeGoalHours('');
      setPeriod('monthly');
      setNotifyOnExceed(true);
      setNotifyOnMilestone(true);
    }
  }, [existingGoal, open]);

  const handleSave = async () => {
    setSaving(true);
    const budget = budgetGoal ? parseFloat(budgetGoal) : null;
    const timeMinutes = timeGoalHours ? Math.round(parseFloat(timeGoalHours) * 60) : null;
    
    await onSave(tag.id, budget, timeMinutes, period, notifyOnExceed, notifyOnMilestone);
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] max-w-md mx-auto bg-card rounded-3xl p-6 shadow-lg z-50 overflow-y-auto max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${tag.color}20` }}
                >
                  <Target className="w-5 h-5" style={{ color: tag.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {isRu ? 'Цели для тега' : 'Tag Goals'}
                  </h2>
                  <p className="text-sm text-muted-foreground">{tag.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Period Toggle */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">
                {isRu ? 'Период' : 'Period'}
              </Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('weekly')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all",
                    period === 'weekly'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {isRu ? 'Неделя' : 'Weekly'}
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all",
                    period === 'monthly'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {isRu ? 'Месяц' : 'Monthly'}
                </button>
              </div>
            </div>

            {/* Budget Goal */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-finance" />
                {isRu ? 'Бюджет (₽)' : 'Budget (₽)'}
              </Label>
              <Input
                type="number"
                value={budgetGoal}
                onChange={(e) => setBudgetGoal(e.target.value)}
                placeholder={isRu ? 'Лимит расходов' : 'Expense limit'}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {isRu ? 'Максимальная сумма расходов за период' : 'Maximum expense amount per period'}
              </p>
            </div>

            {/* Time Goal */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-task" />
                {isRu ? 'Время (часов)' : 'Time (hours)'}
              </Label>
              <Input
                type="number"
                value={timeGoalHours}
                onChange={(e) => setTimeGoalHours(e.target.value)}
                placeholder={isRu ? 'Целевое время' : 'Target time'}
                className="bg-background"
                step="0.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {isRu ? 'Целевое количество часов работы' : 'Target working hours'}
              </p>
            </div>

            {/* Notifications */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notifyOnExceed ? (
                    <Bell className="w-4 h-4 text-destructive" />
                  ) : (
                    <BellOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {isRu ? 'Уведомлять о превышении' : 'Notify on exceed'}
                  </span>
                </div>
                <Switch
                  checked={notifyOnExceed}
                  onCheckedChange={setNotifyOnExceed}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notifyOnMilestone ? (
                    <Bell className="w-4 h-4 text-habit" />
                  ) : (
                    <BellOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {isRu ? 'Уведомлять о достижениях' : 'Notify on milestones'}
                  </span>
                </div>
                <Switch
                  checked={notifyOnMilestone}
                  onCheckedChange={setNotifyOnMilestone}
                />
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving || (!budgetGoal && !timeGoalHours)}
              className="w-full"
              style={{ backgroundColor: tag.color }}
            >
              {saving ? (isRu ? 'Сохранение...' : 'Saving...') : t('save')}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
