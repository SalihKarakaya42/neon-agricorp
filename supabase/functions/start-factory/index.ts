import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface StartFactoryRequest {
  userId: string;
  recipeName: string;
  inputs: Record<string, number>;
  waterCost: number;
  energyCost: number;
}

serve(async (req: Request) => {
  const { userId, recipeName, inputs, waterCost, energyCost }: StartFactoryRequest = await req.json()

  if (!userId || !recipeName || !inputs) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: player, error: fetchError } = await supabase
    .from('player_data')
    .select('water, energy, inventory')
    .eq('id', userId)
    .single()

  if (fetchError || !player) {
    return new Response(JSON.stringify({ error: 'Player not found' }), { status: 404 })
  }

  const inventory = typeof player.inventory === 'object' && player.inventory !== null
    ? { ...player.inventory }
    : {}

  // Validate resources
  if (Number(player.water) < waterCost) {
    return new Response(JSON.stringify({ error: 'Insufficient water' }), { status: 400 })
  }
  if (Number(player.energy) < energyCost) {
    return new Response(JSON.stringify({ error: 'Insufficient energy' }), { status: 400 })
  }
  for (const [res, qty] of Object.entries(inputs)) {
    if ((inventory[res] || 0) < qty) {
      return new Response(JSON.stringify({ error: `Insufficient ${res}` }), { status: 400 })
    }
  }

  // Consume inputs
  for (const [res, qty] of Object.entries(inputs)) {
    inventory[res] = (inventory[res] || 0) - qty
    if (inventory[res] <= 0) delete inventory[res]
  }

  const { error: updateError } = await supabase
    .from('player_data')
    .update({
      water: Number(player.water) - waterCost,
      energy: Number(player.energy) - energyCost,
      inventory,
      last_saved: new Date().toISOString(),
    })
    .eq('id', userId)

  if (updateError) {
    return new Response(JSON.stringify({ error: 'Failed to update player data' }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true, inventory, water: Number(player.water) - waterCost, energy: Number(player.energy) - energyCost }), {
    headers: { 'Content-Type': 'application/json' },
  })
})