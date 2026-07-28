// Session storage for anonymous chat
const SESSION_KEY = 'chat_session';
const DISPLAY_NAME_KEY = 'chat_display_name';

export interface SessionData {
  sessionId: string;
  displayName: string;
  roomId?: string;
  participantId?: string;
}

function generateSessionId(): string {
  return crypto.randomUUID();
}

export function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getDisplayName(): string | null {
  return sessionStorage.getItem(DISPLAY_NAME_KEY);
}

export function setDisplayName(name: string): void {
  sessionStorage.setItem(DISPLAY_NAME_KEY, name);
}

export function getSession(): SessionData | null {
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  const displayName = sessionStorage.getItem(DISPLAY_NAME_KEY);
  
  if (!sessionId || !displayName) return null;
  
  return {
    sessionId,
    displayName,
  };
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(DISPLAY_NAME_KEY);
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
