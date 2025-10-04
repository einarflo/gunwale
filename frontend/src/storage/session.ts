export type PhoneSession = {
  v: 1;
  gamePin: string;
  gameId: string;
  gameInstanceId: string;
  username: string;
  points?: number;
  colour?: number;
  savedAt: number;
};

const KEY = 'tavl.phone.session';

export function loadPhoneSession(): PhoneSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1) return null;
    return data as PhoneSession;
  } catch (_) {
    return null;
  }
}

export function savePhoneSession(sess: PhoneSession) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sess));
  } catch (_) {}
}

export function updatePhoneSession(patch: Partial<PhoneSession>) {
  const prev = loadPhoneSession();
  if (!prev) return;
  const next: PhoneSession = {
    ...prev,
    ...patch,
    savedAt: Date.now(),
    v: 1,
  } as PhoneSession;
  savePhoneSession(next);
}

export function clearPhoneSession() {
  try { localStorage.removeItem(KEY); } catch (_) {}
}

