import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  sessionId: string | null;
  setSessionId: (sessionId: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      setSessionId: (sessionId) => set({ sessionId }),
      clearSession: () => set({ sessionId: null }),
    }),
    {
      name: 'session-storage', // unique name for localStorage key
    }
  )
); 