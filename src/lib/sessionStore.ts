// Persistent storage for anonymous chat (localStorage so it survives page refresh)
const SESSION_KEY = 'chat_session';
const DISPLAY_NAME_KEY = 'chat_display_name';
const ROOM_CODE_KEY = 'chat_room_code';
const PARTICIPANT_ID_KEY = 'chat_participant_id';
const ROOM_ID_KEY = 'chat_room_id';

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
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getDisplayName(): string | null {
  return localStorage.getItem(DISPLAY_NAME_KEY);
}

export function setDisplayName(name: string): void {
  localStorage.setItem(DISPLAY_NAME_KEY, name);
}

export function getSavedRoom(): { roomCode: string; participantId: string; roomId: string } | null {
  const roomCode = localStorage.getItem(ROOM_CODE_KEY);
  const participantId = localStorage.getItem(PARTICIPANT_ID_KEY);
  const roomId = localStorage.getItem(ROOM_ID_KEY);
  if (roomCode && participantId && roomId) return { roomCode, participantId, roomId };
  return null;
}

export function saveRoom(roomCode: string, participantId: string, roomId: string): void {
  localStorage.setItem(ROOM_CODE_KEY, roomCode);
  localStorage.setItem(PARTICIPANT_ID_KEY, participantId);
  localStorage.setItem(ROOM_ID_KEY, roomId);
}

export function clearSavedRoom(): void {
  localStorage.removeItem(ROOM_CODE_KEY);
  localStorage.removeItem(PARTICIPANT_ID_KEY);
  localStorage.removeItem(ROOM_ID_KEY);
}

export function getSession(): SessionData | null {
  const sessionId = localStorage.getItem(SESSION_KEY);
  const displayName = localStorage.getItem(DISPLAY_NAME_KEY);
  if (!sessionId || !displayName) return null;
  return { sessionId, displayName };
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(DISPLAY_NAME_KEY);
  clearSavedRoom();
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
