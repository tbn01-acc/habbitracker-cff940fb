import React from 'react';
import { Star, ThumbsUp, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type RatingType = 'stars' | 'likes' | 'referrals';
export type RatingPeriod = 'all' | 'year' | 'month';

interface RatingTabsProps {
  type: RatingType;
  onTypeChange: (type: RatingType) => void;
  period: RatingPeriod;
  onPeriodChange: (period: RatingPeriod) => void;
  isRussian: boolean;
}

export function RatingTabs({ type, onTypeChange, period, onPeriodChange, isRussian }: RatingTabsProps) {
  return (
    <div className="space-y-3">
      {/* Type tabs - Stars/Likes/Referrals */}
      <Tabs value={type} onValueChange={(v) => onTypeChange(v as RatingType)}>
        <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/50">
          <TabsTrigger value="stars" className="text-sm gap-2 data-[state=active]:bg-background">
            {isRussian ? 'По звёздам' : 'By stars'}
          </TabsTrigger>
          <TabsTrigger value="referrals" className="text-sm gap-2 data-[state=active]:bg-background">
            {isRussian ? 'По рефералам' : 'By referrals'}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Period tabs */}
      <div className="flex gap-2 border-b border-border">
        {([
          { value: 'all', labelRu: 'За всё время', labelEn: 'All time' },
          { value: 'year', labelRu: 'За год', labelEn: 'Per year' },
          { value: 'month', labelRu: 'За месяц', labelEn: 'Per month' },
        ] as const).map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={`pb-2 text-sm font-medium transition-all border-b-2 ${
              period === p.value
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {isRussian ? p.labelRu : p.labelEn}
          </button>
        ))}
      </div>
    </div>
  );
}
