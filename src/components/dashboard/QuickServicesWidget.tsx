import { motion } from 'framer-motion';
import { 
  Timer, 
  Clock, 
  DollarSign, 
  Calculator, 
  Droplets, 
  Dice5, 
  Globe, 
  CheckSquare, 
  Ruler,
  StickyNote 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ServiceItem {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const services: ServiceItem[] = [
  { icon: <Timer className="w-5 h-5" />, label: 'pomodoroTimer', color: 'bg-service/10 text-service' },
  { icon: <Clock className="w-5 h-5" />, label: 'timeTracker', color: 'bg-task/10 text-task' },
  { icon: <DollarSign className="w-5 h-5" />, label: 'currencyRates', color: 'bg-finance/10 text-finance' },
  { icon: <Calculator className="w-5 h-5" />, label: 'dateCalculator', color: 'bg-primary/10 text-primary' },
  { icon: <Droplets className="w-5 h-5" />, label: 'habitCounters', color: 'bg-habit/10 text-habit' },
  { icon: <Dice5 className="w-5 h-5" />, label: 'randomDecision', color: 'bg-accent/10 text-accent-foreground' },
];

export function QuickServicesWidget() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-4 shadow-card border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-sm">{t('services')}</span>
        <Link 
          to="/services" 
          className="text-xs text-service hover:underline"
        >
          {t('myServices')}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {services.map((service) => (
          <Link
            key={service.label}
            to="/services"
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:scale-105",
              service.color
            )}
          >
            {service.icon}
            <span className="text-xs text-center truncate w-full">
              {t(service.label as any) || service.label}
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
