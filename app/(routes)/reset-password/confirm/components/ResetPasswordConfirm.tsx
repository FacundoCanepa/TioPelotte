"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface ResetPasswordConfirmProps {
  code: string | null;
}

export default function ResetPasswordConfirm({
  code,
}: ResetPasswordConfirmProps) {

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      toast.error("Código de recuperación inválido o faltante.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          password,
          passwordConfirmation: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error?.message || "No se pudo cambiar la contraseña.");
        return;
      }

      toast.success("✅ Contraseña actualizada. Iniciá sesión.");
      router.push("/login");
 } catch (err) {
      console.error(err);
      toast.error("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBE6D4] flex items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold text-center text-[#8B4513] mb-6">
          Nueva contraseña
        </h2>

        <label className="block mb-4">
          <span className="text-sm text-[#5A3E1B] font-medium">Nueva contraseña</span>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border px-3 py-2 pl-10 rounded-md text-sm focus:ring-2 focus:ring-[#FFD966]"
            />
            <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8B4513]" />
          </div>
        </label>

        <label className="block mb-6">
          <span className="text-sm text-[#5A3E1B] font-medium">Confirmar contraseña</span>
          <div className="relative">
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full border px-3 py-2 pl-10 rounded-md text-sm focus:ring-2 focus:ring-[#FFD966]"
            />
            <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8B4513]" />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FFD966] text-[#5A3E1B] hover:bg-[#f5c741] rounded-md py-2 font-medium"
        >
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
