"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import Button from "@/components/ui/Buttones";
import { ShoppingCart, LogOut } from "lucide-react";

export default function PerfilActions() {
  const router = useRouter();
  const logout = useUserStore((state) => state.clearUser);

  return (
    <div className="space-y-4">
      <div className="bg-[#FFF7E6] border border-[#FFD966] text-[#8B4513] text-sm px-4 py-3 rounded-md shadow-sm">
        ✏️ Podés editar tus datos directamente en los campos y guardar los cambios.
      </div>

      <div className="flex flex-wrap gap-4">
        <Button onClick={() => router.push("/cart")} className="flex gap-2">
          <ShoppingCart size={18} /> Ir al carrito
        </Button>

        <Button
          onClick={logout}
          className="flex gap-2 bg-red-500 hover:bg-red-600 text-white"
        >
          <LogOut size={18} /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
