"use client";

import { useUserStore } from "@/store/user-store";
import PerfilForm from "./PerfilForm";
import { NotebookPen } from "lucide-react";

export default function PerfilDatosUsuario() {
  const user = useUserStore((state) => state.user);
  const jwt = useUserStore((state) => state.jwt);

  if (!user || !jwt) return null;

  return (
    <section className="space-y-6 bg-white/80 p-6 rounded-2xl shadow-md">
      <div className="flex items-center gap-3 border-b pb-3">
        <NotebookPen className="text-[#8B4513]" size={22} />
        <h2 className="text-xl font-semibold text-[#8B4513]">
          Datos de entrega y contacto
        </h2>
      </div>
      <PerfilForm userId={user.id} jwt={jwt} />
    </section>
  );
}
