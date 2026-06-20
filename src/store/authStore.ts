import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  token: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'minimore-auth',
    }
  )
);
