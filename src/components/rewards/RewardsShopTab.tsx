import React, { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { ShopReward, PurchasedReward } from '@/hooks/useRewardsShop';
import { useCustomTheme, CUSTOM_THEMES } from '@/hooks/useCustomTheme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemePreviewDialog } from './ThemePreviewDialog';
import { 
  Star, 
  Snowflake, 
  Percent, 
  ShoppingBag, 
  CheckCircle, 
  Gift, 
  Palette, 
  User, 
  Frame, 
  Zap, 
  Award,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { triggerPurchaseCelebration } from '@/utils/celebrations';
import { toast } from 'sonner';

interface RewardsShopTabProps {
  rewards: ShopReward[];
  purchasedRewards: PurchasedReward[];
  loading: boolean;
  userStars: number;
  purchaseReward: (rewardId: string) => Promise<boolean>;
  useReward: (purchasedRewardId: string) => Promise<boolean>;
  getUnusedRewards: () => PurchasedReward[];
}

export function RewardsShopTab({
  rewards,
  purchasedRewards,
  loading,
  userStars,
  purchaseReward,
  useReward,
  getUnusedRewards
}: RewardsShopTabProps) {
  const { language } = useTranslation();
  const isRussian = language === 'ru';
  const { activeThemeId, applyTheme, isThemeOwned, refetchOwnedThemes } = useCustomTheme();
  
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [themePreviewOpen, setThemePreviewOpen] = useState(false);

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'freeze': return <Snowflake className="h-8 w-8 text-blue-500" />;
      case 'pro_discount': return <Percent className="h-8 w-8 text-green-500" />;
      case 'theme': return <Palette className="h-8 w-8 text-purple-500" />;
      case 'avatar': return <User className="h-8 w-8 text-pink-500" />;
      case 'frame': return <Frame className="h-8 w-8 text-amber-500" />;
      case 'icon': return <Zap className="h-8 w-8 text-yellow-500" />;
      case 'badge': return <Award className="h-8 w-8 text-red-500" />;
      default: return <Gift className="h-8 w-8 text-primary" />;
    }
  };

  const getRewardTypeLabel = (type: string) => {
    const labels: Record<string, { ru: string; en: string }> = {
      freeze: { ru: 'Заморозка', en: 'Freeze' },
      pro_discount: { ru: 'Скидка PRO', en: 'PRO Discount' },
      theme: { ru: 'Тема', en: 'Theme' },
      avatar: { ru: 'Аватар', en: 'Avatar' },
      frame: { ru: 'Рамка', en: 'Frame' },
      icon: { ru: 'Иконка', en: 'Icon' },
      badge: { ru: 'Бейдж', en: 'Badge' },
    };
    return labels[type] ? (isRussian ? labels[type].ru : labels[type].en) : type;
  };

  const handlePurchase = async (rewardId: string) => {
    const success = await purchaseReward(rewardId);
    if (success) {
      triggerPurchaseCelebration();
      refetchOwnedThemes();
    }
  };

  const handleUseReward = async (pr: PurchasedReward) => {
    if (pr.reward?.reward_type === 'theme') {
      const themeId = (pr.reward.reward_value as { theme_id?: string })?.theme_id;
      if (themeId) {
        applyTheme(themeId);
        toast.success(isRussian ? 'Тема применена!' : 'Theme applied!');
        await useReward(pr.id);
      }
    } else {
      await useReward(pr.id);
    }
  };

  const handleThemePreview = (reward: ShopReward) => {
    const themeId = (reward.reward_value as { theme_id?: string })?.theme_id;
    if (themeId) {
      setSelectedThemeId(themeId);
      setThemePreviewOpen(true);
    }
  };

  const unusedRewards = getUnusedRewards();
  const selectedTheme = CUSTOM_THEMES.find(t => t.id === selectedThemeId) || null;

  // Group rewards by type
  const groupedRewards = rewards.reduce((acc, reward) => {
    const type = reward.reward_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(reward);
    return acc;
  }, {} as Record<string, ShopReward[]>);

  return (
    <div className="space-y-4 overflow-x-hidden">
      {/* Stars balance */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold">{userStars}</p>
                <p className="text-xs text-muted-foreground">{isRussian ? 'Ваши звёзды' : 'Your stars'}</p>
              </div>
            </div>
            {unusedRewards.length > 0 && (
              <Badge variant="default">
                {unusedRewards.length} {isRussian ? 'доступно' : 'available'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="shop">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shop" className="text-xs sm:text-sm">
            <ShoppingBag className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="truncate">{isRussian ? 'Магазин' : 'Shop'}</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs sm:text-sm">
            <Gift className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="truncate">{isRussian ? 'Мои награды' : 'My Rewards'}</span>
            {unusedRewards.length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">{unusedRewards.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="mt-4">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedRewards).map(([type, typeRewards]) => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    {getRewardIcon(type)}
                    <span>{getRewardTypeLabel(type)}</span>
                    <Badge variant="outline" className="text-xs">{typeRewards.length}</Badge>
                  </div>
                  
                  <div className="grid gap-3">
                    {typeRewards.map((reward, index) => {
                      const canAfford = userStars >= reward.price_stars;
                      const isTheme = reward.reward_type === 'theme';
                      
                      return (
                        <motion.div
                          key={reward.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className={!canAfford ? 'opacity-60' : ''}>
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-muted rounded-lg flex-shrink-0">
                                  {getRewardIcon(reward.reward_type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {isTheme ? (
                                      <button
                                        className="font-semibold hover:text-primary transition-colors text-left"
                                        onClick={() => handleThemePreview(reward)}
                                      >
                                        {reward.name}
                                      </button>
                                    ) : (
                                      <h3 className="font-semibold truncate">{reward.name}</h3>
                                    )}
                                    {isTheme && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleThemePreview(reward)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                    {reward.description}
                                  </p>
                                  
                                  <div className="flex gap-1 mt-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {getRewardTypeLabel(reward.reward_type)}
                                    </Badge>
                                    {reward.reward_type === 'pro_discount' && (
                                      <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600">
                                        {isRussian ? 'Только месячный' : 'Monthly only'}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="text-right flex-shrink-0">
                                  <div className="flex items-center gap-1 text-base sm:text-lg font-bold mb-2 justify-end">
                                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" />
                                    {reward.price_stars}
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    disabled={!canAfford}
                                    onClick={() => handlePurchase(reward.id)}
                                    className="text-xs sm:text-sm"
                                  >
                                    {isRussian ? 'Купить' : 'Buy'}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {rewards.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {isRussian ? 'Магазин пока пуст' : 'Shop is empty'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <div className="space-y-4">
            {purchasedRewards.length > 0 ? (
              purchasedRewards.map((pr, index) => {
                const isTheme = pr.reward?.reward_type === 'theme';
                const themeId = isTheme ? (pr.reward?.reward_value as { theme_id?: string })?.theme_id : null;
                const isActiveTheme = isTheme && themeId === activeThemeId;
                
                return (
                  <motion.div
                    key={pr.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={pr.is_used && !isActiveTheme ? 'opacity-60' : ''}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                            {pr.reward && getRewardIcon(pr.reward.reward_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium truncate">{pr.reward?.name}</h3>
                              {isActiveTheme ? (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {isRussian ? 'Активна' : 'Active'}
                                </Badge>
                              ) : pr.is_used ? (
                                <Badge variant="secondary">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {isRussian ? 'Использовано' : 'Used'}
                                </Badge>
                              ) : (
                                <Badge variant="default">
                                  {isRussian ? 'Доступно' : 'Available'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(pr.created_at), 'dd MMM yyyy', { locale: ru })}
                            </p>
                          </div>
                          
                          {(!pr.is_used || isTheme) && (
                            <Button
                              size="sm"
                              variant={isActiveTheme ? 'secondary' : 'outline'}
                              onClick={() => handleUseReward(pr)}
                              className="flex-shrink-0 text-xs sm:text-sm"
                            >
                              {isTheme 
                                ? (isActiveTheme 
                                    ? (isRussian ? 'Активна' : 'Active')
                                    : (isRussian ? 'Применить' : 'Apply'))
                                : (isRussian ? 'Использовать' : 'Use')
                              }
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {isRussian ? 'У вас пока нет наград' : 'No rewards yet'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isRussian ? 'Заработайте звёзды и купите награды!' : 'Earn stars and buy rewards!'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Theme Preview Dialog */}
      <ThemePreviewDialog
        open={themePreviewOpen}
        onOpenChange={setThemePreviewOpen}
        theme={selectedTheme}
        isOwned={selectedThemeId ? isThemeOwned(selectedThemeId) : false}
        isActive={selectedThemeId === activeThemeId}
        onApply={() => {
          if (selectedThemeId) {
            applyTheme(selectedThemeId);
            toast.success(isRussian ? 'Тема применена!' : 'Theme applied!');
            setThemePreviewOpen(false);
          }
        }}
      />
    </div>
  );
}
