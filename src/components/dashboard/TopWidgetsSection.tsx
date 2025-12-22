import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/contexts/LanguageContext';
import { WidgetType, useDashboardWidgets } from '@/hooks/useDashboardWidgets';
import { PomodoroWidget } from './PomodoroWidget';
import { TimeStatsWidget } from './TimeStatsWidget';
import { toast } from 'sonner';

const WIDGET_LABELS: Record<WidgetType, { ru: string; en: string; es: string }> = {
  pomodoro: { ru: 'Помодоро таймер', en: 'Pomodoro Timer', es: 'Temporizador Pomodoro' },
  time_stats: { ru: 'Статистика времени', en: 'Time Statistics', es: 'Estadísticas de tiempo' },
  quick_services: { ru: 'Быстрые сервисы', en: 'Quick Services', es: 'Servicios rápidos' },
  weather: { ru: 'Погода', en: 'Weather', es: 'Clima' },
  habit_counters: { ru: 'Счётчики привычек', en: 'Habit Counters', es: 'Contadores de hábitos' },
  quick_notes: { ru: 'Быстрые заметки', en: 'Quick Notes', es: 'Notas rápidas' },
};

const TOP_WIDGET_TYPES: WidgetType[] = ['pomodoro', 'time_stats', 'quick_notes', 'habit_counters'];

export function TopWidgetsSection() {
  const { t, language } = useTranslation();
  const { getEnabledWidgets, toggleWidget, getAllWidgets } = useDashboardWidgets();
  
  const enabledWidgets = getEnabledWidgets().filter(w => TOP_WIDGET_TYPES.includes(w.type)).slice(0, 2);
  const allWidgets = getAllWidgets().filter(w => TOP_WIDGET_TYPES.includes(w.type));
  const enabledCount = enabledWidgets.length;

  const handleToggle = (type: WidgetType, isCurrentlyEnabled: boolean) => {
    if (!isCurrentlyEnabled && enabledCount >= 2) {
      toast.error(t('maxTwoWidgets'));
      return;
    }
    toggleWidget(type);
  };

  const renderWidget = (widgetType: WidgetType) => {
    switch (widgetType) {
      case 'pomodoro':
        return <PomodoroWidget key="pomodoro" />;
      case 'time_stats':
        return <TimeStatsWidget key="time_stats" />;
      default:
        return null;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-end mb-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings2 className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('selectWidgets')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">{t('selectUpToTwo')}</p>
            <div className="space-y-4 py-4">
              {allWidgets.map((widget) => {
                const isEnabled = enabledWidgets.some(w => w.type === widget.type);
                return (
                  <div key={widget.id} className="flex items-center gap-3">
                    <Checkbox
                      id={widget.id}
                      checked={isEnabled}
                      onCheckedChange={() => handleToggle(widget.type, isEnabled)}
                      disabled={!isEnabled && enabledCount >= 2}
                    />
                    <Label htmlFor={widget.id} className="flex-1 cursor-pointer">
                      {WIDGET_LABELS[widget.type][language as keyof typeof WIDGET_LABELS.pomodoro] || WIDGET_LABELS[widget.type].en}
                    </Label>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {enabledWidgets.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {enabledWidgets.map((widget) => renderWidget(widget.type))}
        </div>
      )}
    </div>
  );
}