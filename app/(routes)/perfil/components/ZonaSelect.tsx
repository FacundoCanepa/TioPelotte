"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { MapPin } from "lucide-react";
import { zonas } from "@/app/(routes)/ubicacion/components/zonas";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function ZonaSelect({ value, onChange }: Props) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <div className="relative">
        <Select.Trigger
          className="w-full border rounded px-3 py-2 bg-white/80 flex items-center justify-between focus:ring-2 focus:ring-[#FFD966]"
        >
          <div className="flex items-center gap-2 text-gray-800">
            <MapPin className="w-5 h-5 text-gray-600" />
            <Select.Value placeholder="Seleccioná tu zona" />
          </div>
          <Select.Icon>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="z-50 max-h-48 overflow-y-auto rounded border bg-white shadow-lg animate-fade-in"
            position="popper"
          >
            <Select.Viewport className="p-1">
              {zonas.map((zona) => (
                <Select.Item
                  key={zona.nombre}
                  value={zona.nombre}
                  className="px-3 py-2 text-sm text-gray-800 hover:bg-[#FFD966]/40 rounded cursor-pointer"
                >
                  <Select.ItemText>{zona.nombre}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </div>
    </Select.Root>
  );
}
