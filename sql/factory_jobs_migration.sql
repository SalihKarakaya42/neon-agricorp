-- NEON AGRICORP - Factory Jobs Storage Migration
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard > SQL Editor)
-- Adds factory_jobs column to player_data for cross-device sync

ALTER TABLE public.player_data ADD COLUMN IF NOT EXISTS factory_jobs jsonb DEFAULT '[]'::jsonb;
