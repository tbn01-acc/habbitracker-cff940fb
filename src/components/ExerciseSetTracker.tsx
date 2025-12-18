import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Minus } from 'lucide-react';
import { ExerciseSet } from '@/types/fitness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface ExerciseSetTrackerProps {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  performedSets: ExerciseSet[];
  onLogSet: (setData: ExerciseSet) => void;
  disabled?: boolean;
}

export function ExerciseSetTracker({
  exerciseId,
  exerciseName,
  targetSets,
  targetReps,
  performedSets,
  onLogSet,
  disabled,
}: ExerciseSetTrackerProps) {
  const { t } = useTranslation();
  const [currentReps, setCurrentReps] = useState(targetReps);
  const [currentWeight, setCurrentWeight] = useState<number | undefined>(undefined);

  const completedSetsCount = performedSets.filter(s => s.completed).length;
  const nextSetNumber = completedSetsCount + 1;
  const isComplete = completedSetsCount >= targetSets;

  const handleLogSet = () => {
    onLogSet({
      setNumber: nextSetNumber,
      reps: currentReps,
      weight: currentWeight,
      completed: true,
    });
  };

  return (
    <div className="bg-muted/50 rounded-xl p-3 space-y-3">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{exerciseName}</span>
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          isComplete ? "bg-fitness text-white" : "bg-muted text-muted-foreground"
        )}>
          {completedSetsCount}/{targetSets}
        </span>
      </div>

      {/* Sets visualization */}
      <div className="flex gap-1.5">
        {Array.from({ length: targetSets }).map((_, i) => {
          const set = performedSets.find(s => s.setNumber === i + 1);
          return (
            <div
              key={i}
              className={cn(
                "flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                set?.completed 
                  ? "bg-fitness text-white" 
                  : i === completedSetsCount 
                    ? "bg-fitness/20 text-fitness border-2 border-dashed border-fitness"
                    : "bg-background text-muted-foreground"
              )}
            >
              {set?.completed ? (
                <div className="flex flex-col items-center">
                  <span>{set.reps}</span>
                  {set.weight && <span className="text-[10px] opacity-80">{set.weight}kg</span>}
                </div>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Input for next set */}
      {!isComplete && !disabled && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentReps(Math.max(1, currentReps - 1))}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Input
                type="number"
                value={currentReps}
                onChange={(e) => setCurrentReps(parseInt(e.target.value) || 0)}
                className="w-14 h-8 text-center text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentReps(currentReps + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
              <span className="text-xs text-muted-foreground">{t('reps')}</span>
            </div>

            <Input
              type="number"
              value={currentWeight || ''}
              onChange={(e) => setCurrentWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="kg"
              className="w-16 h-8 text-center text-sm"
            />

            <Button
              onClick={handleLogSet}
              size="sm"
              className="bg-fitness hover:bg-fitness/90 text-white h-8"
            >
              <Check className="w-4 h-4" />
            </Button>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Completed message */}
      {isComplete && (
        <div className="text-center py-1">
          <span className="text-xs text-fitness font-medium">✓ {t('completed')}</span>
        </div>
      )}
    </div>
  );
}
