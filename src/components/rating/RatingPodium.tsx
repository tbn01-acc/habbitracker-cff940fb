import React from 'react';
import { Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserAvatarWithFrame } from '@/components/rewards/UserAvatarWithFrame';
import { UserRewardItems } from '@/hooks/useUserRewardItems';

interface PodiumUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_stars: number;
  likes_count?: number;
  referrals_count?: number;
  rank: number;
}

interface RatingPodiumProps {
  users: PodiumUser[];
  userRewards: Map<string, UserRewardItems>;
  type: 'stars' | 'likes' | 'referrals';
  isRussian: boolean;
  onUserClick: (userId: string) => void;
}

export function RatingPodium({ users, userRewards, type, isRussian, onUserClick }: RatingPodiumProps) {
  const top3 = users.slice(0, 3);
  
  // Reorder for podium: [2nd, 1st, 3rd]
  const podiumOrder = top3.length >= 3 
    ? [top3[1], top3[0], top3[2]]
    : top3;

  const getValue = (user: PodiumUser) => {
    switch (type) {
      case 'likes':
        return user.likes_count ?? 0;
      case 'referrals':
        return user.referrals_count ?? 0;
      default:
        return user.total_stars;
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return 'h-28';
      case 2: return 'h-20';
      case 3: return 'h-16';
      default: return 'h-12';
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-black';
      case 2: return 'bg-gray-400 text-black';
      case 3: return 'bg-amber-600 text-white';
      default: return 'bg-muted text-foreground';
    }
  };

  if (top3.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-3 mb-4">
        {podiumOrder.map((user, index) => {
          if (!user) return null;
          const actualRank = user.rank;
          
          return (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => onUserClick(user.user_id)}
            >
              {/* Avatar with frame */}
              <div className="relative mb-2">
                <UserAvatarWithFrame
                  avatarUrl={user.avatar_url}
                  displayName={user.display_name}
                  frameId={userRewards.get(user.user_id)?.activeFrame}
                  size={actualRank === 1 ? 'lg' : 'md'}
                />
                {/* Rank badge */}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor(actualRank)}`}>
                  {actualRank}
                </div>
              </div>

              {/* Name */}
              <p className="text-xs font-medium text-center max-w-[80px] truncate mb-1">
                {user.display_name}
              </p>

              {/* Value */}
              <div className="flex items-center gap-1 text-sm font-semibold text-yellow-500">
                <Star className="h-3 w-3 fill-yellow-500" />
                {getValue(user).toLocaleString()}
              </div>

              {/* Podium base */}
              <div className={`mt-2 w-20 ${getPodiumHeight(actualRank)} rounded-t-lg bg-gradient-to-b ${
                actualRank === 1 
                  ? 'from-yellow-500/30 to-yellow-500/10' 
                  : actualRank === 2 
                    ? 'from-gray-400/30 to-gray-400/10'
                    : 'from-amber-600/30 to-amber-600/10'
              }`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
