import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface UserStatsCardsProps {
  userStars: number;
  userRank: number | null;
  isRussian: boolean;
}

export function UserStatsCards({ userStars, userRank, isRussian }: UserStatsCardsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      {/* Balance Card */}
      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors border-yellow-500/30"
        onClick={() => navigate('/star-history')}
      >
        <CardContent className="p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-lg font-bold text-yellow-500">{userStars}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            {isRussian ? 'Ваш баланс' : 'Your balance'}
            <ChevronRight className="h-3 w-3" />
          </p>
        </CardContent>
      </Card>

      {/* Rank Card */}
      <Card className="border-muted">
        <CardContent className="p-3 text-center">
          <p className="text-lg font-bold">#{userRank || '—'}</p>
          <p className="text-xs text-muted-foreground">
            {isRussian ? 'Ваша позиция' : 'Your position'}
          </p>
        </CardContent>
      </Card>

      {/* Earn Card */}
      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors border-yellow-500/30"
        onClick={() => navigate('/partner-program')}
      >
        <CardContent className="p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            {isRussian ? 'Заработать' : 'Earn'}
            <ChevronRight className="h-3 w-3" />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
