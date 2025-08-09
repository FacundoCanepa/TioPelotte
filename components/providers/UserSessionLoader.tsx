"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/user-store";

/**
 * Carga la sesión del usuario desde localStorage de forma segura
 * y actualiza el store de Zustand al iniciar la app
 */
export default function UserSessionLoader() {
  const setIsSessionChecked = useUserStore((s) => s.setIsSessionChecked);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const restore = async () => {
      try {
        await useUserStore.persist.rehydrate();
      } catch (error) {
        console.error("Error al cargar la sesión", error);
        localStorage.removeItem("user-storage");
      } finally {
        setIsSessionChecked(true);
      }
    };

    restore();
  }, [setIsSessionChecked]);

  return null;
}