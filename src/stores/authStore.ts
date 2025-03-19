import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the baseline accounts prefix constant
const BASELINE_ACCOUNTS_PREFIX = "1m2kl5";

interface AuthState {
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userId: string, token: string) => void;
  logout: () => void;
  isBaselineUser: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
      },
      isBaselineUser: () => {
        const { userId } = get();
        if (!userId) return false;
        return userId.startsWith(BASELINE_ACCOUNTS_PREFIX);
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 