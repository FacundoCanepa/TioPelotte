'use client';

import { useEffect, useState } from "react";
import { Loader2, Save, Search, Trash2, Edit, X } from "lucide-react";
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
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

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
    setEditingUser(prev => prev && prev.id === id ? { ...prev, [field]: value } : prev);
  };

  const handleRoleChange = (id: number, value: string) => {
    setEditingUser(prev => prev && prev.id === id ? { ...prev, role: { name: value } } : prev);
  };

  const guardarUsuario = async (usuario: Usuario) => {
    if (!usuario) return;
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
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...usuario } : u))
      );
      setEditingUser(null);
    } catch {
      toast.error("No se pudo guardar el usuario");
    } finally {
      setSavingId(null);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    [u.username, u.email, u.telefono, u.zona].some((campo) =>
      campo?.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <section className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Gestión de Usuarios
        </h1>
        <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
        {usuariosFiltrados.map((u) => (
          <div key={u.id} className="p-4 bg-white rounded-xl shadow-sm flex flex-col gap-3 border">
            <div className="font-semibold text-gray-800">{u.username}</div>
            <div className="text-sm text-gray-600">{u.email}</div>
            {u.telefono && (
              <a href={`https://wa.me/54${u.telefono}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 inline-flex items-center gap-2">
                {u.telefono}
              </a>
            )}
            <div className="text-sm text-gray-500">{u.zona} - {u.direccion}</div>
            <div className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 self-start">{u.role.name}</div>
            <button
              onClick={() => setEditingUser(u)}
              className="w-full sm:w-auto mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-white shadow-sm hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg border shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuariosFiltrados.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{u.username}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {u.telefono ? 
                    <a href={`https://wa.me/54${u.telefono}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 inline-flex items-center gap-2">
                      {u.telefono}
                    </a> : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{u.direccion || '-'}</div>
                    <div className="text-xs text-gray-400">{u.zona || 'Sin zona'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 self-start">{u.role.name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => setEditingUser(u)} className="text-amber-600 hover:text-amber-900 inline-flex items-center gap-2">
                    <Edit size={16}/> Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Editar Usuario</h2>
                <button onClick={() => setEditingUser(null)} className="p-1 rounded-full hover:bg-gray-100"><X size={20}/></button>
            </div>
            
            <div className="space-y-3">
                <input value={editingUser.username} onChange={(e) => handleInputChange(editingUser.id, "username", e.target.value)} placeholder="Nombre" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input value={editingUser.email} onChange={(e) => handleInputChange(editingUser.id, "email", e.target.value)} placeholder="Email" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input type="text" value={editingUser.telefono || ""} onChange={(e) => handleInputChange(editingUser.id, "telefono", e.target.value)} placeholder="Teléfono" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input value={editingUser.direccion || ""} onChange={(e) => handleInputChange(editingUser.id, "direccion", e.target.value)} placeholder="Dirección" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <select value={editingUser.zona || ""} onChange={(e) => handleInputChange(editingUser.id, "zona", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Seleccionar zona</option>
                  {zonasDisponibles.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                <select value={editingUser.role.name} onChange={(e) => handleRoleChange(editingUser.id, e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {rolesDisponibles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button onClick={() => guardarUsuario(editingUser)} disabled={savingId === editingUser.id} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white shadow-sm hover:bg-amber-700 transition-colors font-medium">
                {savingId === editingUser.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Guardar Cambios
              </button>
              <button onClick={() => setEditingUser(null)} className="w-full sm:w-auto inline-flex justify-center rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
