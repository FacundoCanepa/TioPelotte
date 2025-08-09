"use client";

import { Dispatch, SetStateAction } from "react";

interface Props {
  form: any;
  setForm: Dispatch<SetStateAction<any>>;
  onSave: () => void;
}

export default function IngredientForm({ form, setForm, onSave }: Props) {
  const unidades = ["kg", "planchas", "unidad"];

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-4 max-w-md">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Nombre</label>
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Stock</label>
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Unidad de medida</label>
        <select
          value={form.unidadMedida || ""}
          onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })}
          className="border p-2 rounded w-full"
        >
          <option value="" disabled>
            Unidad de medida
          </option>
          {unidades.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Precio</label>
        <input
          type="number"
          placeholder="Precio"
          value={form.precio}
          onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
          className="border p-2 rounded w-full"
        />
      </div>
      <button onClick={onSave} className="bg-[#8B4513] text-white px-4 py-2 rounded w-full">
        Guardar
      </button>
    </div>
  );
}
