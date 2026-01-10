-- Add new reward types: avatars, frames, icons, badges
-- Fix PRO discount - only for monthly subscription

-- Insert avatar rewards
INSERT INTO rewards_shop (name, description, price_stars, reward_type, reward_value, is_active)
VALUES
  ('Аватар "Космонавт"', 'Уникальная аватарка космонавта', 80, 'avatar', '{"avatar_id": "astronaut", "avatar_url": "/avatars/astronaut.png"}', true),
  ('Аватар "Робот"', 'Футуристичный аватар робота', 80, 'avatar', '{"avatar_id": "robot", "avatar_url": "/avatars/robot.png"}', true),
  ('Аватар "Ниндзя"', 'Таинственный аватар ниндзя', 100, 'avatar', '{"avatar_id": "ninja", "avatar_url": "/avatars/ninja.png"}', true),
  ('Аватар "Дракон"', 'Эпический аватар с драконом', 150, 'avatar', '{"avatar_id": "dragon", "avatar_url": "/avatars/dragon.png"}', true)
ON CONFLICT DO NOTHING;

-- Insert frame rewards
INSERT INTO rewards_shop (name, description, price_stars, reward_type, reward_value, is_active)
VALUES
  ('Рамка "Золото"', 'Золотая рамка для аватара', 120, 'frame', '{"frame_id": "gold", "border_color": "#FFD700", "glow": true}', true),
  ('Рамка "Неон"', 'Неоновая светящаяся рамка', 150, 'frame', '{"frame_id": "neon", "border_color": "#00ff88", "glow": true}', true),
  ('Рамка "Огонь"', 'Огненная анимированная рамка', 200, 'frame', '{"frame_id": "fire", "animated": true}', true),
  ('Рамка "Лёд"', 'Ледяная кристаллическая рамка', 180, 'frame', '{"frame_id": "ice", "border_color": "#88ddff"}', true)
ON CONFLICT DO NOTHING;

-- Insert achievement icon rewards
INSERT INTO rewards_shop (name, description, price_stars, reward_type, reward_value, is_active)
VALUES
  ('Иконка "Молния"', 'Иконка молнии для достижений', 60, 'icon', '{"icon_id": "lightning", "icon_emoji": "⚡"}', true),
  ('Иконка "Корона"', 'Королевская иконка', 100, 'icon', '{"icon_id": "crown", "icon_emoji": "👑"}', true),
  ('Иконка "Алмаз"', 'Сверкающий алмаз', 120, 'icon', '{"icon_id": "diamond", "icon_emoji": "💎"}', true),
  ('Иконка "Ракета"', 'Взлетающая ракета', 80, 'icon', '{"icon_id": "rocket", "icon_emoji": "🚀"}', true)
ON CONFLICT DO NOTHING;

-- Insert badge rewards
INSERT INTO rewards_shop (name, description, price_stars, reward_type, reward_value, is_active)
VALUES
  ('Бейдж "Продуктивный"', 'Бейдж для профиля - Продуктивный', 100, 'badge', '{"badge_id": "productive", "badge_text": "Продуктивный", "badge_color": "#10b981"}', true),
  ('Бейдж "Эксперт"', 'Бейдж для профиля - Эксперт', 150, 'badge', '{"badge_id": "expert", "badge_text": "Эксперт", "badge_color": "#8b5cf6"}', true),
  ('Бейдж "Мастер"', 'Бейдж для профиля - Мастер', 200, 'badge', '{"badge_id": "master", "badge_text": "Мастер", "badge_color": "#f59e0b"}', true),
  ('Бейдж "Легенда"', 'Легендарный бейдж профиля', 300, 'badge', '{"badge_id": "legend", "badge_text": "Легенда", "badge_color": "#ef4444"}', true)
ON CONFLICT DO NOTHING;

-- Update PRO discount description to clarify it's only for monthly
UPDATE rewards_shop 
SET description = 'Скидка на первый месяц PRO подписки (только месячный тариф)',
    reward_value = '{"discount_percent": 10, "applicable_period": "monthly"}'
WHERE reward_type = 'pro_discount' AND reward_value->>'discount_percent' = '10';

UPDATE rewards_shop 
SET description = 'Скидка на первый месяц PRO подписки (только месячный тариф)',
    reward_value = '{"discount_percent": 20, "applicable_period": "monthly"}'
WHERE reward_type = 'pro_discount' AND reward_value->>'discount_percent' = '20';