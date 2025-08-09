"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, Mail, Lock } from "lucide-react";
import Button from "@/components/ui/Buttones";
import { useUserStore } from "@/store/user-store";

export default function RegisterForm() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const setJwt = useUserStore((state) => state.setJwt);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/local/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      console.log("Respuesta registro:", data); // Debug

      if (!res.ok) {
        const mensaje = data?.error?.message || "";

        if (mensaje.includes("Email or Username are already taken")) {
          throw new Error("El nombre de usuario o email ya está en uso.");
        }

        throw new Error(mensaje || "Error al registrarse.");
      }

      const roleName = data.user?.role?.name || "cliente";

      setUser({ ...data.user, role: roleName });
      setJwt(data.jwt);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Ocurrió un error desconocido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md border border-[#E0E0E0]"
    >
      <h2 className="text-2xl font-garamond text-[#8B4513] mb-6 text-center flex items-center justify-center gap-2">
        <UserPlus className="w-5 h-5" /> Crear cuenta
      </h2>

      {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

      <label className="block mb-4">
        <span className="text-[#5A3E1B] text-sm font-semibold">Nombre de usuario</span>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[#ccc] px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD966]"
            required
          />
          <UserPlus className="absolute left-3 top-3 w-4 h-4 text-[#8B4513]" />
        </div>
      </label>

      <label className="block mb-4">
        <span className="text-[#5A3E1B] text-sm font-semibold">Email</span>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[#ccc] px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD966]"
            required
          />
          <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8B4513]" />
        </div>
      </label>

      <label className="block mb-6">
        <span className="text-[#5A3E1B] text-sm font-semibold">Contraseña</span>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[#ccc] px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD966]"
            required
          />
          <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8B4513]" />
        </div>
      </label>

      <Button
        type="submit"
        className="w-full bg-[#FFD966] text-[#5A3E1B] hover:bg-[#f5c741]"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Registrarse"}
      </Button>

      <p className="text-sm text-center mt-6 text-stone-600">
        ¿Ya tenés cuenta?{" "}
        <span
          className="underline cursor-pointer text-[#8B4513]"
          onClick={() => router.push("/login")}
        >
          Iniciar sesión
        </span>
      </p>
    </form>
  );
}
