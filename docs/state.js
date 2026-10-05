export const STORAGE_KEY = 'zezima-potato-patch-v1';
export const MAX_ENTRIES = 12;
export const MAX_POTATOES = 999999;

export function freshState() {
  return { potatoes: 0, entries: [] };
}

export function readState(storage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return freshState();
    const potatoes = Number.isSafeInteger(saved.potatoes) && saved.potatoes >= 0
      ? Math.min(saved.potatoes, MAX_POTATOES) : 0;
    const entries = Array.isArray(saved.entries) ? saved.entries.filter(entry =>
      entry && typeof entry.name === 'string' && entry.name.trim() &&
      typeof entry.message === 'string' && entry.message.trim() &&
      typeof entry.date === 'string' && Number.isFinite(Date.parse(entry.date))
    ).slice(0, MAX_ENTRIES).map(entry => ({
      name: entry.name.trim().slice(0, 24),
      message: entry.message.trim().slice(0, 240),
      date: entry.date
    })) : [];
    return { potatoes, entries };
  } catch {
    return freshState();
  }
}

export function saveState(storage, state) {
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function harvestPotato(state) {
  return { ...state, potatoes: Math.min(state.potatoes + 1, MAX_POTATOES) };
}

export function addEntry(state, name, message, now = new Date()) {
  const cleanName = String(name ?? '').trim().slice(0, 24);
  const cleanMessage = String(message ?? '').trim().slice(0, 240);
  if (!cleanName || !cleanMessage) return null;
  return {
    ...state,
    entries: [{ name: cleanName, message: cleanMessage, date: now.toISOString() },
      ...state.entries].slice(0, MAX_ENTRIES)
  };
}
