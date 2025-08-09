"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Search } from "lucide-react";
import { toast } from "sonner";

const rolesDisponibles = ["Authenticated", "Administrador", "Empleado"];
const zonasDisponibles = [
  "Etcheverry 2", "Etcheverry 1", "Olmos", "ruta 36 y 197", "los hornos 1",
  "los hornos 2", "los hornos 3", "62 y 248", "Barrio Los Cachorros", "El rodeo",
  "Area 60", "Miralagos", "Campos de Roca I y II", "Haras del SUR I", "Haras del SUR III",
  "Posada de los Lagos", "Haras del SUR II", "Abasto", "Abasto 2",
  "Club de campo La Torre", "Romero", "Romero II"
];

interface Usuario {
  id: number;
  username: string;
  email: string;
  role: { name: string };
  telefono?: string;
  direccion?: string;
  zona?: string;
}

export default function UsuariosSection() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [originales, setOriginales] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        if (Array.isArray(json?.data)) {
          setUsuarios(json.data);
          setOriginales(json.data);
        }
      } catch {
        toast.error("No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const handleInputChange = (id: number, field: keyof Usuario, value: string) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  const handleRoleChange = (id: number, value: string) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: { name: value } } : u))
    );
  };

  const usuarioCambio = (u: Usuario) => {
    const original = originales.find((o) => o.id === u.id);
    return JSON.stringify(original) !== JSON.stringify(u);
  };

  const guardarUsuario = async (usuario: Usuario) => {
    setSavingId(usuario.id);
    try {
      const res = await fetch(`/api/admin/users/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });
      if (!res.ok) throw new Error();
      toast.success("Usuario actualizado");
      setOriginales((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...usuario } : u))
      );
    } catch {
      toast.error("No se pudo guardar el usuario");
    } finally {
      setSavingId(null);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    [u.username, u.email, u.telefono].some((campo) =>
      campo?.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
      </div>
    );
  }

  return (
    <section className="px-4 md:px-10 space-y-6">
      <h1 className="text-3xl font-semibold text-[#8B4513] font-garamond">
        Gestión de Usuarios
      </h1>

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2 max-w-md">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
        />
      </div>

      {/* Tarjetas de usuario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuariosFiltrados.map((u) => (
          <div key={u.id} className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
            <input
              value={u.username}
              onChange={(e) => handleInputChange(u.id, "username", e.target.value)}
              placeholder="Nombre"
              className="w-full border rounded-md px-3 py-1.5 text-sm"
            />
            <input
              value={u.email}
              onChange={(e) => handleInputChange(u.id, "email", e.target.value)}
              placeholder="Email"
              className="w-full border rounded-md px-3 py-1.5 text-sm"
            />
            <select
              value={u.role?.name || ""}
              onChange={(e) => handleRoleChange(u.id, e.target.value)}
              className="w-full border rounded-md px-3 py-1.5 text-sm"
            >
              {rolesDisponibles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <input
              type="number"
              value={u.telefono || ""}
              onChange={(e) => handleInputChange(u.id, "telefono", e.target.value)}
              placeholder="Teléfono"
              className="w-full border rounded-md px-3 py-1.5 text-sm"
            />
            {u.telefono && (
              <a
                href={`https://wa.me/54${u.telefono}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 underline text-sm"
              >
                Enviar WhatsApp
              </a>
            )}
            <input
              value={u.direccion || ""}
              onChange={(e) => handleInputChange(u.id, "direccion", e.target.value)}
              placeholder="Dirección"
              className="w-full border rounded-md px-3 py-1.5 text-sm"
            />
            <select
              value={u.zona || ""}
              onChange={(e) => handleInputChange(u.id, "zona", e.target.value)}
              className="w-full border rounded-md px-3 py-1.5 text-sm"
            >
              <option value="">Seleccionar zona</option>
              {zonasDisponibles.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>

            <button
              onClick={() => guardarUsuario(u)}
              disabled={savingId === u.id || !usuarioCambio(u)}
              className={`w-full mt-2 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-white text-sm transition 
                ${savingId === u.id || !usuarioCambio(u)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#8B4513] hover:bg-[#5A3E1B]"}`}
            >
              {savingId === u.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
