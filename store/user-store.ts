"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserType = {
  id: number;
  email: string;
  username: string;
  role?: string;
  telefono?: string;
  zona?: string;
  direccion?: string;
  referencias?: string;
};


interface UserState {
  user: UserType | null;
  jwt: string | null;
  isSessionChecked: boolean;
  setUser: (user: UserType | null) => void;
  setJwt: (jwt: string | null) => void;
  setIsSessionChecked: (checked: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      jwt: null,
      isSessionChecked: false,
      setUser: (user) => set({ user }),
      setJwt: (jwt) => set({ jwt }),
      setIsSessionChecked: (checked) => set({ isSessionChecked: checked }),
      clearUser: () => set({ user: null, jwt: null }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ user: state.user, jwt: state.jwt }),
      skipHydration: true,
    }
  )
);