"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import { useUserStore } from "@/store/user-store";

export default function LoginForm() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const setJwt = useUserStore((state) => state.setJwt);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const traducirError = (mensaje: string) => {
    if (mensaje.includes("Invalid identifier or password")) {
      return "Email o contraseña incorrectos";
    }
    if (mensaje.includes("identifier is a required field") || mensaje.includes("Missing identifier")) {
      return "Falta ingresar el email";
    }
    if (mensaje.includes("password is a required field") || mensaje.includes("Missing password")) {
      return "Falta ingresar la contraseña";
    }
    return "Error al iniciar sesión. Intentá nuevamente.";
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error || "Error desconocido";
        setError(traducirError(msg));
        return;
      }

      setUser({ ...data.user, role: data.user?.role?.name || "cliente" });
      setJwt(data.jwt);
      router.push("/perfil");
    } catch (err) {
      setError("Error de red. Verificá tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-center text-[#8B4513]">
        Iniciar sesión
      </h2>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-300">
          <Mail className="w-5 h-5 text-gray-500" />
          <input
            type="email"
            placeholder="Email"
            className="w-full py-2 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300">
          <Lock className="w-5 h-5 text-gray-500" />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full py-2 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        onClick={handleLogin}
        className="w-full py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#6e3911] transition-colors flex justify-center items-center"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Ingresar"}
      </button>

      <p className="text-sm text-center text-stone-700">
        ¿Olvidaste tu contraseña?{" "}
        <span
          onClick={() => router.push("/reset-password")}
          className="underline cursor-pointer text-[#8B4513]"
        >
          Recuperarla
        </span>
      </p>

      <p className="text-sm text-center text-stone-700 mt-2">
        ¿No tenés cuenta?{" "}
        <span
          onClick={() => router.push("/register")}
          className="underline cursor-pointer text-[#8B4513]"
        >
          Registrate
        </span>
      </p>
    </div>
  );
}
