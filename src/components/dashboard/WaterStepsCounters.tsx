import { Droplets, Footprints, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const WATER_KEY = 'habitflow_water_count';
const STEPS_KEY = 'habitflow_steps_count';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function WaterCounter() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const goal = 8;

  useEffect(() => {
    const stored = localStorage.getItem(WATER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date === getToday()) {
          setCount(parsed.count);
        }
      } catch (e) {
        console.error('Failed to parse water count:', e);
      }
    }
  }, []);

  const saveCount = (newCount: number) => {
    setCount(newCount);
    localStorage.setItem(WATER_KEY, JSON.stringify({ date: getToday(), count: newCount }));
  };

  const increment = () => saveCount(count + 1);
  const decrement = () => saveCount(Math.max(0, count - 1));

  const progress = Math.min((count / goal) * 100, 100);

  return (
    <motion.div
      className="bg-card rounded-2xl p-4 shadow-card border border-border"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-sm font-medium text-foreground">{t('water')}</span>
        </div>
        <span className="text-xs text-muted-foreground">{count}/{goal} {t('cups')}</span>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={decrement}>
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-2xl font-bold text-foreground min-w-[3rem] text-center">{count}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={increment}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export function StepsCounter() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const goal = 10000;

  useEffect(() => {
    const stored = localStorage.getItem(STEPS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date === getToday()) {
          setCount(parsed.count);
        }
      } catch (e) {
        console.error('Failed to parse steps count:', e);
      }
    }
  }, []);

  const saveCount = (newCount: number) => {
    setCount(newCount);
    localStorage.setItem(STEPS_KEY, JSON.stringify({ date: getToday(), count: newCount }));
  };

  const increment = () => saveCount(count + 1000);
  const decrement = () => saveCount(Math.max(0, count - 1000));

  const progress = Math.min((count / goal) * 100, 100);

  return (
    <motion.div
      className="bg-card rounded-2xl p-4 shadow-card border border-border"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Footprints className="w-4 h-4 text-green-500" />
          </div>
          <span className="text-sm font-medium text-foreground">{t('steps')}</span>
        </div>
        <span className="text-xs text-muted-foreground">{count.toLocaleString()}/{(goal/1000)}k</span>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={decrement}>
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-2xl font-bold text-foreground min-w-[4rem] text-center">{count.toLocaleString()}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={increment}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}