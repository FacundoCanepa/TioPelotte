"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { toMediaURL } from "@/utils/media";

interface Props {
  value: { id: number } | null;
  preview: string; // puede venir relativo o absoluto
  onChange: (value: { id: number } | null, preview: string) => void;
  uploadImages: (
    files: FileList | File[]
  ) => Promise<{ ids: { id: number }[]; urls: string[] }>;
  loading: boolean;
  maxSizeMB?: number; // opcional: límite de tamaño
  accept?: string; // opcional: "image/*" por defecto
}

export default function UploadImageMain({
  value,
  preview,
  onChange,
  uploadImages,
  loading,
  maxSizeMB = 8,
  accept = "image/*",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const validateFiles = (files: FileList | File[]) => {
    const arr = Array.from(files as any as File[]);
    if (!arr.length) return "No se seleccionó ninguna imagen.";
    const tooBig = arr.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (tooBig) return `El archivo "${tooBig.name}" supera ${maxSizeMB}MB.`;
    const notImage = arr.find((f) => !f.type.startsWith("image/"));
    if (notImage) return `El archivo "${notImage.name}" no es una imagen válida.`;
    return null;
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setLocalError(null);
      const validation = validateFiles(files);
      if (validation) {
        setLocalError(validation);
        return;
      }

      try {
        const { ids, urls } = await uploadImages(files);
        if (ids?.[0] && urls?.[0]) {
          onChange(ids[0], urls[0]); // guardamos el id y la url devueltos por el uploader
        } else {
          setLocalError("No se pudo obtener la imagen subida.");
        }
      } catch (e: any) {
        setLocalError(e?.message ?? "Error al subir la imagen.");
      }
    },
    [onChange, uploadImages]
  );

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const normalizedPreview = toMediaURL(preview);

  return (
    <div className="space-y-2">
      <div
        className={[
          "rounded-md border border-dashed p-4 transition-colors",
          dragOver ? "border-[#8B4513] bg-[#fbe6d4]/60" : "border-[#e6c9a2] bg-[#fbe6d4]/40",
        ].join(" ")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="flex items-center gap-2 justify-between">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="bg-[#fbe6d4] hover:bg-[#efd6bf] text-[#8B4513] px-4 py-2 rounded-md inline-flex items-center gap-2"
            disabled={loading}
          >
            <UploadCloud className="w-4 h-4" />
            {loading ? "Subiendo..." : "Subir imagen"}
          </button>

          {value && normalizedPreview && (
            <button
              type="button"
              onClick={() => onChange(null, "")}
              className="text-[#8B4513]/80 hover:text-[#8B4513] inline-flex items-center gap-1 text-sm"
              title="Quitar imagen"
            >
              <X className="w-4 h-4" /> Quitar
            </button>
          )}
        </div>

        <p className="mt-2 text-xs text-[#8B4513]/80">
          Arrastrá y soltá una imagen aquí o hacé click en “Subir imagen”. Tamaño máx.: {maxSizeMB}MB.
        </p>

        <input
          type="file"
          accept={accept}
          ref={inputRef}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {localError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {localError}
        </p>
      )}

      {normalizedPreview ? (
        // ✅ Usamos <img> nativo en admin para evitar restricciones de dominios de next/image
        <div className="relative w-full h-40 overflow-hidden rounded-md border border-[#e6c9a2] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={normalizedPreview}
            alt="preview"
            className="object-cover w-full h-full"
            loading="lazy"
            onError={() => setLocalError("No se pudo cargar el preview de la imagen.")}
          />
        </div>
      ) : (
        <div className="w-full h-40 rounded-md border border-[#e6c9a2] bg-white/60 grid place-items-center text-[#8B4513]/60 text-sm">
          Sin imagen seleccionada
        </div>
      )}
    </div>
  );
}
