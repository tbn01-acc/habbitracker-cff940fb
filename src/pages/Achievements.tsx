import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, ArrowLeft, Trophy } from 'lucide-react';
import { Achievements as AchievementsComponent } from '@/components/Achievements';
import { AppHeader } from '@/components/AppHeader';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function AchievementsPage() {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isRussian = language === 'ru';

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          {isRussian ? 'Загрузка...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/profile');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isRussian ? 'Награды и достижения' : 'Rewards & Achievements'}
              </h1>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AchievementsComponent />
        </motion.div>
      </div>
    </div>
  );
}
