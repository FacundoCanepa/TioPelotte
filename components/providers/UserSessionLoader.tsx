"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/user-store";

/**
 * Carga la sesión del usuario desde localStorage de forma segura
 * y actualiza el store de Zustand al iniciar la app
 */
export default function UserSessionLoader() {
  const setUser = useUserStore((s) => s.setUser);
  const setJwt = useUserStore((s) => s.setJwt);
  const setIsSessionChecked = useUserStore((s) => s.setIsSessionChecked);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem("user-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        const state = parsed?.state ?? {};
        if (state.user) setUser(state.user);
        if (state.jwt) setJwt(state.jwt);
      }
    } catch (error) {
      console.error("Error al cargar la sesión", error);
      localStorage.removeItem("user-storage");
    } finally {
      setIsSessionChecked(true);
    }
  }, [setUser, setJwt, setIsSessionChecked]);

  return null;
}