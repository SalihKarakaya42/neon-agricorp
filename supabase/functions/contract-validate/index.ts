import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ContractRequest {
  userId: string;
  contractId: string;
  requiredItems: Record<string, number>;
  rewardCredits: number;
  rewardExp: number;
}

serve(async (req: Request) => {
  const { userId, contractId, requiredItems, rewardCredits, rewardExp }: ContractRequest = await req.json()

  if (!userId || !contractId || !requiredItems) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: player, error: fetchError } = await supabase
    .from('player_data')
    .select('credits, inventory')
    .eq('id', userId)
    .single()

  if (fetchError || !player) {
    return new Response(JSON.stringify({ error: 'Player not found' }), { status: 404 })
  }

  const inventory = typeof player.inventory === 'object' && player.inventory !== null
    ? { ...player.inventory }
    : {}

  // Validate contract items
  for (const [item, qty] of Object.entries(requiredItems)) {
    if ((inventory[item] || 0) < qty) {
      return new Response(JSON.stringify({ error: `Insufficient ${item}: need ${qty}, have ${inventory[item] || 0}` }), { status: 400 })
    }
  }

  // Consume contract items
  for (const [item, qty] of Object.entries(requiredItems)) {
    inventory[item] = (inventory[item] || 0) - qty
    if (inventory[item] <= 0) delete inventory[item]
  }

  const { error: updateError } = await supabase
    .from('player_data')
    .update({
      credits: Number(player.credits) + rewardCredits,
      inventory,
      last_saved: new Date().toISOString(),
    })
    .eq('id', userId)

  if (updateError) {
    return new Response(JSON.stringify({ error: 'Failed to update player data' }), { status: 500 })
  }

  return new Response(JSON.stringify({
    success: true,
    inventory,
    credits: Number(player.credits) + rewardCredits,
    rewardExp,
    contractId,
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
})