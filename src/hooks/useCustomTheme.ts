import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CustomTheme {
  id: string;
  name: string;
  cssVariables: Record<string, string>;
  isDark: boolean;
}

// Aqua-glass-material design themes
export const CUSTOM_THEMES: CustomTheme[] = [
  {
    id: 'night_purple',
    name: 'Ночь',
    isDark: true,
    cssVariables: {
      '--background': '260 25% 8%',
      '--foreground': '260 10% 95%',
      '--card': '260 25% 12%',
      '--card-foreground': '260 10% 95%',
      '--popover': '260 25% 12%',
      '--popover-foreground': '260 10% 95%',
      '--primary': '270 75% 55%',
      '--primary-foreground': '0 0% 100%',
      '--primary-glow': '270 80% 65%',
      '--secondary': '260 20% 18%',
      '--secondary-foreground': '260 10% 90%',
      '--muted': '260 20% 16%',
      '--muted-foreground': '260 10% 55%',
      '--accent': '280 70% 60%',
      '--accent-foreground': '0 0% 100%',
      '--border': '260 20% 22%',
      '--input': '260 20% 22%',
      '--ring': '270 75% 55%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(270, 75%, 55%), hsl(280, 70%, 60%))',
    },
  },
  {
    id: 'sunset',
    name: 'Закат',
    isDark: false,
    cssVariables: {
      '--background': '25 30% 95%',
      '--foreground': '25 50% 15%',
      '--card': '0 0% 100%',
      '--card-foreground': '25 50% 15%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '25 50% 15%',
      '--primary': '15 85% 55%',
      '--primary-foreground': '0 0% 100%',
      '--primary-glow': '25 90% 60%',
      '--secondary': '30 25% 90%',
      '--secondary-foreground': '25 50% 20%',
      '--muted': '30 20% 92%',
      '--muted-foreground': '25 30% 45%',
      '--accent': '350 80% 55%',
      '--accent-foreground': '0 0% 100%',
      '--border': '30 20% 85%',
      '--input': '30 20% 85%',
      '--ring': '15 85% 55%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(15, 85%, 55%), hsl(350, 80%, 55%))',
    },
  },
  {
    id: 'ocean',
    name: 'Океан',
    isDark: false,
    cssVariables: {
      '--background': '200 25% 96%',
      '--foreground': '200 50% 10%',
      '--card': '0 0% 100%',
      '--card-foreground': '200 50% 10%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '200 50% 10%',
      '--primary': '190 80% 45%',
      '--primary-foreground': '0 0% 100%',
      '--primary-glow': '180 75% 50%',
      '--secondary': '200 20% 90%',
      '--secondary-foreground': '200 50% 15%',
      '--muted': '200 15% 93%',
      '--muted-foreground': '200 20% 45%',
      '--accent': '210 85% 55%',
      '--accent-foreground': '0 0% 100%',
      '--border': '200 20% 87%',
      '--input': '200 20% 87%',
      '--ring': '190 80% 45%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(190, 80%, 45%), hsl(210, 85%, 55%))',
    },
  },
  {
    id: 'forest',
    name: 'Лес',
    isDark: false,
    cssVariables: {
      '--background': '140 20% 96%',
      '--foreground': '140 40% 12%',
      '--card': '0 0% 100%',
      '--card-foreground': '140 40% 12%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '140 40% 12%',
      '--primary': '145 65% 40%',
      '--primary-foreground': '0 0% 100%',
      '--primary-glow': '150 70% 45%',
      '--secondary': '140 18% 90%',
      '--secondary-foreground': '140 40% 18%',
      '--muted': '140 15% 93%',
      '--muted-foreground': '140 20% 45%',
      '--accent': '85 60% 45%',
      '--accent-foreground': '0 0% 100%',
      '--border': '140 18% 86%',
      '--input': '140 18% 86%',
      '--ring': '145 65% 40%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(145, 65%, 40%), hsl(85, 60%, 45%))',
    },
  },
  {
    id: 'cyber',
    name: 'Кибер',
    isDark: true,
    cssVariables: {
      '--background': '240 20% 6%',
      '--foreground': '180 100% 90%',
      '--card': '240 25% 10%',
      '--card-foreground': '180 100% 90%',
      '--popover': '240 25% 10%',
      '--popover-foreground': '180 100% 90%',
      '--primary': '170 100% 50%',
      '--primary-foreground': '240 20% 6%',
      '--primary-glow': '165 100% 55%',
      '--secondary': '240 20% 15%',
      '--secondary-foreground': '180 80% 85%',
      '--muted': '240 20% 12%',
      '--muted-foreground': '180 40% 50%',
      '--accent': '300 100% 60%',
      '--accent-foreground': '0 0% 100%',
      '--border': '240 20% 20%',
      '--input': '240 20% 20%',
      '--ring': '170 100% 50%',
      '--gradient-primary': 'linear-gradient(135deg, hsl(170, 100%, 50%), hsl(300, 100%, 60%))',
    },
  },
];

const ACTIVE_THEME_KEY = 'topfocus_active_theme';

export function useCustomTheme() {
  const { user } = useAuth();
  const [activeThemeId, setActiveThemeId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_THEME_KEY);
  });
  const [ownedThemes, setOwnedThemes] = useState<string[]>([]);

  // Fetch owned themes from purchased_rewards
  const fetchOwnedThemes = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('purchased_rewards')
        .select('reward_id, is_used, rewards_shop!inner(reward_type, reward_value)')
        .eq('user_id', user.id);

      if (data) {
        const themeIds = data
          .filter((pr: any) => pr.rewards_shop?.reward_type === 'theme')
          .map((pr: any) => {
            const value = pr.rewards_shop?.reward_value as { theme_id?: string };
            return value?.theme_id;
          })
          .filter(Boolean) as string[];
        
        setOwnedThemes(themeIds);
      }
    } catch (err) {
      console.error('Error fetching owned themes:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchOwnedThemes();
  }, [fetchOwnedThemes]);

  // Apply theme CSS variables to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (!activeThemeId) {
      // Remove custom theme, restore default
      CUSTOM_THEMES.forEach((theme) => {
        Object.keys(theme.cssVariables).forEach((key) => {
          root.style.removeProperty(key);
        });
      });
      return;
    }

    const theme = CUSTOM_THEMES.find((t) => t.id === activeThemeId);
    if (!theme) return;

    // Apply dark/light class
    root.classList.remove('light', 'dark');
    root.classList.add(theme.isDark ? 'dark' : 'light');

    // Apply CSS variables
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    localStorage.setItem(ACTIVE_THEME_KEY, activeThemeId);
  }, [activeThemeId]);

  const applyTheme = useCallback((themeId: string) => {
    if (!ownedThemes.includes(themeId) && themeId !== 'default') {
      return false;
    }
    setActiveThemeId(themeId === 'default' ? null : themeId);
    return true;
  }, [ownedThemes]);

  const resetTheme = useCallback(() => {
    setActiveThemeId(null);
    localStorage.removeItem(ACTIVE_THEME_KEY);
    
    // Reset to system preference
    const root = document.documentElement;
    CUSTOM_THEMES.forEach((theme) => {
      Object.keys(theme.cssVariables).forEach((key) => {
        root.style.removeProperty(key);
      });
    });
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.remove('light', 'dark');
    root.classList.add(prefersDark ? 'dark' : 'light');
  }, []);

  const isThemeOwned = useCallback((themeId: string) => {
    return ownedThemes.includes(themeId);
  }, [ownedThemes]);

  const getActiveTheme = useCallback(() => {
    return CUSTOM_THEMES.find((t) => t.id === activeThemeId) || null;
  }, [activeThemeId]);

  return {
    activeThemeId,
    ownedThemes,
    themes: CUSTOM_THEMES,
    applyTheme,
    resetTheme,
    isThemeOwned,
    getActiveTheme,
    refetchOwnedThemes: fetchOwnedThemes,
  };
}
