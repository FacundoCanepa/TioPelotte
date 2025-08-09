"use client";

import { useEffect, useState } from "react";
import { Loader2, Phone, Home, Truck, Landmark } from "lucide-react";
import ZonaSelect from "./ZonaSelect";
import { zonas } from "@/app/(routes)/ubicacion/components/zonas";

// Tipado del formulario
interface FormData {
  telefono: string;
  direccion: string;
  zona: string;
  referencias: string;
}

interface Props {
  userId: number;
  jwt: string;
}

export default function PerfilForm({ userId, jwt }: Props) {
  const [formData, setFormData] = useState<FormData>({
    telefono: "",
    direccion: "",
    zona: "",
    referencias: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = await res.json();
        setFormData({
          telefono: data.telefono || "",
          direccion: data.direccion || "",
          zona: data.zona || "",
          referencias: data.referencias || "",
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [jwt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al guardar");

      setMessage("✅ Datos actualizados con éxito.");
    } catch (err) {
      setMessage("❌ Hubo un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const zonaSeleccionada = zonas.find((z) => z.nombre === formData.zona);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="animate-spin mx-auto text-black" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white/60 border border-[#FFD966] rounded-2xl shadow p-6 backdrop-blur"
    >
      <InputField
        icon={<Phone className="w-5 h-5 text-[#8B4513]" />}
        name="telefono"
        value={formData.telefono}
        onChange={handleChange}
        placeholder="Teléfono"
      />

      <InputField
        icon={<Home className="w-5 h-5 text-[#8B4513]" />}
        name="direccion"
        value={formData.direccion}
        onChange={handleChange}
        placeholder="Dirección"
      />

      <ZonaSelect
        value={formData.zona}
        onChange={(value) => setFormData({ ...formData, zona: value })}
      />

      {zonaSeleccionada && (
        <div className="flex items-center gap-2 text-sm text-gray-700 px-1">
          <Truck size={18} />
          Costo de envío a {zonaSeleccionada.nombre}:{" "}
          <span className="font-semibold">{zonaSeleccionada.precio}</span>
        </div>
      )}

      <div className="flex items-start gap-3 border rounded px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-[#FFD966]">
        <Landmark className="w-5 h-5 text-[#8B4513] mt-1" />
        <textarea
          name="referencias"
          value={formData.referencias}
          onChange={handleChange}
          placeholder="Referencias del domicilio (ej: portón negro, timbre roto...)"
          rows={3}
          className="w-full outline-none bg-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#8B4513] text-white py-2 rounded hover:opacity-90 transition cursor-pointer "
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>

      {message && <p className="text-center text-sm mt-2">{message}</p>}
    </form>
  );
}

interface InputFieldProps {
  icon: React.ReactNode;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

function InputField({ icon, name, value, onChange, placeholder }: InputFieldProps) {
  return (
    <div className="flex items-center gap-3 border rounded px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-[#FFD966]">
      {icon}
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full outline-none bg-transparent"
      />
    </div>
  );
}
