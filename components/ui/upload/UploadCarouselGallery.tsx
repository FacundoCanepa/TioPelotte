"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toMediaURL } from "@/utils/media";

interface Props {
  values: { id: number }[];
  previews: string[];
  onChange: (ids: { id: number }[], previews: string[]) => void;
  uploadImages: (files: FileList | File[]) => Promise<{ ids: { id: number }[]; urls: string[] }>;
  loading: boolean;
  maxSizeMB?: number; // default: 8MB
  accept?: string; // default: "image/*"
}

export default function UploadCarouselGallery({
  values,
  previews,
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
        if (!ids?.length || !urls?.length) {
          setLocalError("No se pudo obtener la(s) imagen(es) subida(s).");
          return;
        }

        // normalizar URLs
        const normalizedUrls = urls.map((u) => toMediaURL(u));
        // evitar duplicados por URL
        const existing = new Set(previews.map((p) => toMediaURL(p)));
        const filteredIdx: number[] = [];
        normalizedUrls.forEach((u, i) => {
          if (!existing.has(u)) filteredIdx.push(i);
        });

        const newIds = [...values, ...filteredIdx.map((i) => ids[i])];
        const newPreviews = [...previews, ...filteredIdx.map((i) => normalizedUrls[i])];

        onChange(newIds, newPreviews);
      } catch (e: any) {
        setLocalError(e?.message ?? "Error al subir las imágenes.");
      }
    },
    [onChange, uploadImages, previews, values]
  );

  const remove = (idx: number) => {
    const newIds = values.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    onChange(newIds, newPreviews);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="bg-[#fbe6d4] hover:bg-[#efd6bf] text-[#8B4513] px-4 py-2 rounded-md inline-flex items-center gap-2"
          disabled={loading}
        >
          <ImagePlus className="w-4 h-4" />
          {loading ? "Subiendo..." : "Subir múltiples"}
        </button>
        <p className="mt-2 text-xs text-[#8B4513]/80">
          Arrastrá y soltá imágenes aquí o hacé click en “Subir múltiples”. Tamaño máx.: {maxSizeMB}MB c/u.
        </p>
        <input
          type="file"
          accept={accept}
          ref={inputRef}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {localError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {localError}
        </p>
      )}

      {previews.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {previews.map((src, idx) => {
            const url = toMediaURL(src);
            return (
              <div key={`${url}-${idx}`} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`img-${idx}`}
                  className="object-cover rounded-md h-20 w-20 border border-[#e6c9a2] bg-white"
                  loading="lazy"
                  onError={() => {
                    // si alguna se rompe, la eliminamos del array
                    const newIds = values.filter((_, i) => i !== idx);
                    const newPreviews = previews.filter((_, i) => i !== idx);
                    onChange(newIds, newPreviews);
                  }}
                />
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow hover:shadow-md"
                  title="Quitar imagen"
                >
                  <X className="w-3 h-3 text-red-600" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full rounded-md border border-[#e6c9a2] bg-white/60 grid place-items-center text-[#8B4513]/60 text-sm h-24">
          Sin imágenes
        </div>
      )}
    </div>
  );
}
