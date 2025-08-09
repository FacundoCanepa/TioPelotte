"use client";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { useCallback, useRef } from "react";

interface Props {
  values: { id: number }[];
  previews: string[];
  onChange: (ids: { id: number }[], previews: string[]) => void;
  uploadImages: (files: FileList | File[]) => Promise<{ ids: { id: number }[]; urls: string[] }>;
  loading: boolean;
}

export default function UploadCarouselGallery({ values, previews, onChange, uploadImages, loading }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const { ids, urls } = await uploadImages(files);
      if (ids.length) {
        onChange([...values, ...ids], [...previews, ...urls]);
      }
    },
    [uploadImages, values, previews, onChange]
  );

  const remove = (idx: number) => {
    const newIds = values.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    onChange(newIds, newPreviews);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="bg-[#fbe6d4] hover:bg-[#efd6bf] text-[#8B4513] px-4 py-2 rounded-md flex items-center gap-2 justify-center"
      >
        <ImagePlus className="w-4 h-4" /> {loading ? "Subiendo..." : "Subir múltiples"}
      </button>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {previews.map((src, idx) => (
            <div key={idx} className="relative">
              <Image src={src} alt={`img-${idx}`} width={80} height={80} className="object-cover rounded-md h-20 w-20" />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow"
              >
                <X className="w-3 h-3 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}