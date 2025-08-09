"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("📩 Te enviamos un correo para cambiar tu contraseña");
      } else {
        toast.error(data?.error?.message || "No se pudo enviar el email.");
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBE6D4] flex items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-center text-[#8B4513] mb-6">
          Recuperar contraseña
        </h2>

        <label className="block mb-4">
          <span className="text-[#5A3E1B] text-sm font-medium">Email asociado a tu cuenta</span>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border px-3 py-2 pl-10 rounded-md text-sm focus:ring-2 focus:ring-[#FFD966]"
            />
            <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8B4513]" />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FFD966] text-[#5A3E1B] hover:bg-[#f5c741] rounded-md py-2 font-medium"
        >
          {loading ? "Enviando..." : "Enviar link de recuperación"}
        </button>
      </form>
    </div>
  );
}
