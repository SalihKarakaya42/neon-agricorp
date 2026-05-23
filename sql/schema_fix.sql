-- NEON AGRICORP - Supabase Schema Setup (güncel)
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard > SQL Editor)

-- Mevcut tabloya eksik sütunları ekle (tablo varsa)
ALTER TABLE public.player_data ADD COLUMN IF NOT EXISTS pod_capacity numeric DEFAULT 4;
ALTER TABLE public.player_data ADD COLUMN IF NOT EXISTS max_water_capacity numeric DEFAULT 500;
ALTER TABLE public.player_data ADD COLUMN IF NOT EXISTS tier4_unlocked numeric DEFAULT 0;

-- Drop and recreate the player_data table (SADECE sıfırdan kuruyorsan)
-- DROP TABLE IF EXISTS public.player_data CASCADE;

-- CREATE TABLE public.player_data (
--   id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   water numeric DEFAULT 100,
--   energy numeric DEFAULT 100,
--   credits numeric DEFAULT 1000,
--   inventory jsonb DEFAULT '{}'::jsonb,
--   pump_power numeric DEFAULT 10,
--   base_energy_production numeric DEFAULT 15,
--   crop_growth_modifier numeric DEFAULT 1.0,
--   water_efficiency numeric DEFAULT 1.0,
--   max_water_capacity numeric DEFAULT 500,
--   max_energy_capacity numeric DEFAULT 1000,
--   unlocked_t3_factories numeric DEFAULT 0,
--   unlocked_prestige numeric DEFAULT 0,
--   pod_capacity numeric DEFAULT 4,
--   research_state jsonb DEFAULT '{"techs": [], "timers": {}}'::jsonb,
--   last_saved timestamp with time zone DEFAULT NOW()
-- );

-- Enable Row Level Security
ALTER TABLE public.player_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies (güvenli oluşturma)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_data' AND policyname = 'Users can view their own data.') THEN
    CREATE POLICY "Users can view their own data." ON public.player_data FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_data' AND policyname = 'Users can create their own profile.') THEN
    CREATE POLICY "Users can create their own profile." ON public.player_data FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_data' AND policyname = 'Users can update own data.') THEN
    CREATE POLICY "Users can update own data." ON public.player_data FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Grant access to authenticated users
GRANT ALL ON public.player_data TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
