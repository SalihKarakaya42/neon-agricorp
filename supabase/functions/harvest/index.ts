import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface HarvestRequest {
  userId: string;
  outputResources: string[];
}

serve(async (req: Request) => {
  const { userId, outputResources }: HarvestRequest = await req.json()

  if (!userId || !outputResources || !Array.isArray(outputResources) || outputResources.length === 0) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: player, error: fetchError } = await supabase
    .from('player_data')
    .select('inventory')
    .eq('id', userId)
    .single()

  if (fetchError || !player) {
    return new Response(JSON.stringify({ error: 'Player not found' }), { status: 404 })
  }

  const inventory = typeof player.inventory === 'object' && player.inventory !== null
    ? { ...player.inventory as Record<string, number> }
    : {}

  for (const resource of outputResources) {
    inventory[resource] = (inventory[resource] || 0) + 1
  }

  const { error: updateError } = await supabase
    .from('player_data')
    .update({ inventory, last_saved: new Date().toISOString() })
    .eq('id', userId)

  if (updateError) {
    return new Response(JSON.stringify({ error: 'Failed to update inventory' }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true, inventory }), {
    headers: { 'Content-Type': 'application/json' },
  })
})