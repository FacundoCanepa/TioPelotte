"use client";

import { useUserStore } from "@/store/user-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import PerfilHeader from "./components/PerfilHeader";
import PerfilDatosUsuario from "./components/PerfilDatosUsuario";
import PerfilActions from "./components/PerfilActions";
import PerfilSugerencias from "./components/PerfilSugerencias";

export default function PerfilPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const jwt = useUserStore((state) => state.jwt);
  const isSessionChecked = useUserStore((state) => state.isSessionChecked);

  useEffect(() => {
    if (!isSessionChecked) return;
    if (!user || !jwt) {
      router.push("/login");
    }
  }, [isSessionChecked, user, jwt, router]);

  if (!isSessionChecked) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
      </div>
    );
  }

  if (!user || !jwt) return null;

  return (
    <div className="space-y-10">
      <div className="max-w-3xl mx-auto p-4 space-y-10">
      <PerfilHeader />
      <PerfilDatosUsuario />
      <PerfilActions />
      </div>
      <PerfilSugerencias />
    </div>
    
  );
}