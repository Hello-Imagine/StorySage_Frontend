import { create } from 'zustand';

interface SessionState {
  sessionId: string | null;
  setSessionId: (sessionId: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  setSessionId: (sessionId) => set({ sessionId }),
  clearSession: () => set({ sessionId: null }),
})); 