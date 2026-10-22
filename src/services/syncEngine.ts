import { SyncQueueItem, SyncStatus } from '../types';
import { getSyncQueue, saveSyncQueue, getLastSyncTime, saveLastSyncTime } from './storage';

type SyncListener = (status: SyncStatus) => void;

const listeners = new Set<SyncListener>();

let currentStatus: SyncStatus = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
};

// Initialize status
if (typeof window !== 'undefined') {
  const queue = getSyncQueue();
  currentStatus.pendingCount = queue.length;
  currentStatus.lastSyncedAt = getLastSyncTime() || new Date().toISOString();

  window.addEventListener('online', () => {
    updateStatus({ isOnline: true });
    triggerSync();
  });

  window.addEventListener('offline', () => {
    updateStatus({ isOnline: false });
  });
}

function updateStatus(partial: Partial<SyncStatus>) {
  currentStatus = { ...currentStatus, ...partial };
  listeners.forEach(fn => fn(currentStatus));
}

export function subscribeToSyncStatus(listener: SyncListener): () => void {
  listeners.add(listener);
  listener(currentStatus);
  return () => {
    listeners.delete(listener);
  };
}

export function getLatestSyncStatus(): SyncStatus {
  return currentStatus;
}

export function enqueueSyncAction(action: string, payload: any): void {
  const queue = getSyncQueue();
  const item: SyncQueueItem = {
    id: 'sync_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    action,
    payload,
    timestamp: Date.now(),
    synced: false,
  };
  queue.push(item);
  saveSyncQueue(queue);
  updateStatus({ pendingCount: queue.length });

  // If online, schedule debounced sync
  if (currentStatus.isOnline) {
    scheduleDebouncedSync();
  }
}

let syncTimeout: any = null;
function scheduleDebouncedSync() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    triggerSync();
  }, 1000);
}

export async function triggerSync(force = false): Promise<boolean> {
  if (currentStatus.isSyncing) return false;
  if (!currentStatus.isOnline && !force) return false;

  updateStatus({ isSyncing: true });

  // Simulate local/cloud synchronization
  await new Promise(res => setTimeout(res, 800));

  try {
    saveSyncQueue([]);
    const nowIso = new Date().toISOString();
    saveLastSyncTime(nowIso);
    updateStatus({
      isSyncing: false,
      pendingCount: 0,
      lastSyncedAt: nowIso,
    });
    return true;
  } catch (err) {
    console.error('Sync failed:', err);
    updateStatus({ isSyncing: false });
    return false;
  }
}
