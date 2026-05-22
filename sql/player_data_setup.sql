CREATE TABLE IF NOT EXISTS public.player_data (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  water numeric DEFAULT 100,
  energy numeric DEFAULT 100,
  credits numeric DEFAULT 1000,
  inventory jsonb DEFAULT '{}'::jsonb,
  pump_power numeric DEFAULT 10,
  base_energy_production numeric DEFAULT 15,
  crop_growth_modifier numeric DEFAULT 1.0,
  water_efficiency numeric DEFAULT 1.0,
  max_energy_capacity numeric DEFAULT 1000,
  unlocked_t3_factories numeric DEFAULT 0,
  unlocked_prestige numeric DEFAULT 0,
  research_state jsonb DEFAULT '{"techs": [], "timers": {}}'::jsonb,
  last_saved timestamp with time zone DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.player_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data."
ON public.player_data FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile."
ON public.player_data FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data."
ON public.player_data FOR UPDATE
USING (auth.uid() = id);
