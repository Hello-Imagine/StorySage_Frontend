import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSessionStore } from './sessionStore';

interface AuthState {
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userId: string, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      token: null,
      isAuthenticated: false,
      login: (userId, token) => set({ 
        userId, 
        token,
        isAuthenticated: true 
      }),
      logout: () => {
        set({ 
          userId: null, 
          token: null,
          isAuthenticated: false 
        });
        useSessionStore.getState().clearSession();
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 