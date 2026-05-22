import { supabase } from './supabaseClient';

type SyncAction = 'harvest' | 'start-factory' | 'contract-validate' | 'sell' | 'research' | 'unlock-district';

interface SyncResult<T = unknown> {
  success: boolean;
  serverData?: T;
  error?: string;
}

const SYNC_ENABLED = true;

export async function syncWithServer<T = unknown>(
  action: SyncAction,
  body: Record<string, unknown>,
): Promise<SyncResult<T>> {
  if (!SYNC_ENABLED) {
    return { success: false, error: 'Sync disabled' };
  }

  try {
    const { data, error } = await supabase.functions.invoke(action, {
      body,
    });

    if (error) {
      console.error(`Server sync failed for ${action}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, serverData: data as T };
  } catch (err) {
    console.error(`Server sync error for ${action}:`, err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function syncWithFallback<T = unknown>(
  action: SyncAction,
  body: Record<string, unknown>,
  optimisticUpdate: () => void,
  rollbackUpdate: () => void,
): Promise<SyncResult<T>> {
  // Optimistic update
  optimisticUpdate();

  // Try server
  const result = await syncWithServer<T>(action, body);

  if (!result.success) {
    // Server failed, rollback
    rollbackUpdate();
    return result;
  }

  return result;
}